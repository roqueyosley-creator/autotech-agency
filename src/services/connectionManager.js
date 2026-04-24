import { bluetoothService } from './bluetoothService';
import { TCPClient as TcpClient } from '@devioarts/capacitor-tcpclient';

/**
 * Interface Normalizada para Respuestas OBD
 */
class OBDResponse {
    constructor(raw, source) {
        this.raw = raw;
        this.source = source; // 'usb', 'wifi', 'bluetooth'
        this.timestamp = Date.now();
        this.parsed = this._parseRaw(raw);
    }
    
    _parseRaw(raw) {
        // Lógica básica de normalización, removiendo espacios y >
        return raw ? raw.replace(/\s|>|\r|\n/g, '') : '';
    }
}

/**
 * Manager Universal de Conexión AutoTech PRO
 * Gestiona múltiples protocolos: Bluetooth, WiFi y USB (Serial).
 */
class ConnectionManager {
    constructor() {
        this.activeConnection = null;
        this.connectionType = null; // 'bluetooth' | 'wifi' | 'usb'
        this.wifiKeepAliveInterval = null;
        
        // Chips soportados y baud rates comunes para escáneres OBD
        this.usbBaudRates = [38400, 115200, 500000]; 
        this.usbPort = null;
    }

    /**
     * Evalúa las capacidades del hardware actual para soportar compatibilidad Multi-Plataforma
     * (Windows, Apple/iOS/Mac, Android)
     */
    getCapabilities() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
        
        // Capacitor inyecta este objeto globalmente en apps nativas
        const isNative = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform();
        
        // Electron inyecta variables si es aplicación de escritorio
        const isElectron = typeof window !== 'undefined' && !!window.process?.versions?.electron;

        return {
            usb: {
                supported: ('serial' in navigator) && !isIOS,
                message: isIOS ? "Apple iOS no permite conexión USB Serial (VAG-COM/OTG)." : "Conecta tu cable USB."
            },
            wifi: {
                // Sockets TCP nativos disponibles en Capacitor (Android/iOS) y Electron (Desktop)
                // En navegadores web requeriría proxy o WebSockets.
                supported: isNative || isElectron || true, // true como fallback para pruebas de PWA
                message: "Interface Wi-Fi estándar."
            },
            bluetooth: {
                // Bluetooth Classic (bluetoothSerial) para Android Nativo, Web Bluetooth para BLE en Mac/Windows/Android-Web
                supported: (typeof window !== 'undefined' && !!window.bluetoothSerial) || ('bluetooth' in navigator),
                message: isIOS && !isNative ? "Safari en iOS no soporta Web Bluetooth. Usa la App Nativa." : "Adaptador Bluetooth (Classic / BLE)."
            }
        };
    }

    /**
     * Autoconexión Inteligente (Prioridad: USB -> WiFi -> Bluetooth)
     */
    async autoConnect(bluetoothAddress = null) {
        console.log("Iniciando Autoconexión Inteligente...");
        
        // 1. Intentar USB
        console.log("Prioridad 1: Comprobando conexión USB...");
        try {
            // Requiere interacción del usuario la primera vez en Web Serial API
            // Asumimos que los puertos ya autorizados se pueden pedir
            if ('serial' in navigator) {
                const ports = await navigator.serial.getPorts();
                if (ports.length > 0) {
                    const usbResult = await this.connectUSB(ports[0]);
                    if (usbResult.success) return { success: true, type: 'usb' };
                }
            }
        } catch (e) {
            console.log("USB Auto-connect falló, procediendo a WiFi:", e);
        }

        // 2. Intentar WiFi
        console.log("Prioridad 2: Intentando conexión WiFi (V-Linker / ELM327)...");
        const wifiResult = await this.connectWiFi();
        if (wifiResult.success) return { success: true, type: 'wifi' };

        // 3. Intentar Bluetooth
        if (bluetoothAddress) {
            console.log("Prioridad 3: Intentando conexión Bluetooth...");
            const btResult = await this.connectBluetooth(bluetoothAddress);
            if (btResult.success) return { success: true, type: 'bluetooth' };
        }

        return { success: false, error: "No se pudo establecer ninguna conexión." };
    }

    /**
     * Conecta vía USB Serial (Soporte FTDI, CP210x, CH340, PL2303)
     */
    async connectUSB(port = null) {
        try {
            if (!port) {
                // Pedir permiso al usuario
                port = await navigator.serial.requestPort({
                    filters: [
                        { usbVendorId: 0x0403 }, // FTDI
                        { usbVendorId: 0x10C4 }, // CP210x
                        { usbVendorId: 0x1A86 }, // CH340
                        { usbVendorId: 0x067B }  // PL2303
                    ]
                });
            }

            let connected = false;
            // Auto baud-rate detection
            for (const baudRate of this.usbBaudRates) {
                try {
                    console.log(`Probando USB baud rate: ${baudRate}`);
                    await port.open({ baudRate });
                    
                    this.usbPort = port;
                    this.activeConnection = true;
                    this.connectionType = 'usb';
                    
                    // Prueba simple (Reset) para ver si responde
                    await this.sendRaw('ATZ\r');
                    connected = true;
                    console.log(`Conectado por USB a ${baudRate} baudios`);
                    break; 
                } catch (e) {
                    if (port.readable) await port.close();
                }
            }

            if (!connected) throw new Error("No se pudo negociar el Baud Rate.");
            
            return { success: true };
        } catch (error) {
            console.error("USB Connection Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Conecta vía WiFi (Estándar ELM327 WiFi) con Keep-Alive
     * IP: 192.168.0.10, Port: 35000
     */
    async connectWiFi(ip = '192.168.0.10', port = 35000) {
        try {
            console.log(`Intentando conexión TCP a ${ip}:${port}...`);
            const client = await TcpClient.create({ address: ip, port: port });
            await client.connect();
            
            this.activeConnection = client;
            this.connectionType = 'wifi';
            
            // Inicialización ELM327 sobre TCP
            await this.sendRaw('ATZ\r');
            await this.sendRaw('ATE0\r'); // Eco off
            
            // Iniciar Keep-Alive (Ignorar la desconexión por timeout)
            this._startWiFiKeepAlive();
            
            return { success: true };
        } catch (error) {
            console.error("WiFi Connection Error:", error);
            return { success: false, error: error.message };
        }
    }

    _startWiFiKeepAlive() {
        if (this.wifiKeepAliveInterval) clearInterval(this.wifiKeepAliveInterval);
        this.wifiKeepAliveInterval = setInterval(async () => {
            if (this.connectionType === 'wifi' && this.activeConnection) {
                try {
                    // Enviar un comando inocuo para mantener la sesión (ej: leer voltaje)
                    await this.sendRaw('ATRV\r'); 
                } catch (e) {
                    console.log("Error en Keep-Alive WiFi. Conexión posiblemente perdida.");
                    this.disconnect();
                }
            }
        }, 5000); // Cada 5 segundos
    }

    /**
     * Conecta vía Bluetooth (Llamada al servicio existente)
     */
    async connectBluetooth(address) {
        const success = await bluetoothService.connect(address);
        if (success) {
            this.connectionType = 'bluetooth';
            this.activeConnection = true; // Flag de estado
            return { success: true };
        }
        return { success: false };
    }

    /**
     * Envía un PID y espera la respuesta.
     * Retorna una interfaz normalizada (OBDResponse)
     */
    async sendPID(pid) {
        let rawResponse = "";

        if (this.connectionType === 'bluetooth') {
            rawResponse = await bluetoothService.sendPID(pid);
            
        } else if (this.connectionType === 'wifi' && this.activeConnection) {
            await this.sendRaw(pid + "\r");
            // Lectura TCP con espera de fin de trama ELM327 (>)
            rawResponse = await this._readTCP();
            
        } else if (this.connectionType === 'usb' && this.usbPort) {
            await this.sendRaw(pid + "\r");
            rawResponse = await this._readUSB();
            
        } else {
            // Fallback para desarrollo/mock si no hay conexión real
            rawResponse = "OK";
        }

        return new OBDResponse(rawResponse, this.connectionType);
    }

    /**
     * Lectura TCP con buffer y timeout
     */
    async _readTCP() {
        if (!this.activeConnection) return "";
        return new Promise((resolve) => {
            let buffer = "";
            const timeout = setTimeout(() => resolve(buffer), 2000);
            
            const listener = (data) => {
                const decoded = atob(data.data);
                buffer += decoded;
                if (buffer.includes('>')) {
                    this.activeConnection.removeListener('data', listener);
                    clearTimeout(timeout);
                    resolve(buffer);
                }
            };
            
            this.activeConnection.on('data', listener);
        });
    }

    /**
     * Envío RAW de comandos a través del canal activo
     */
    async sendRaw(command) {
        if (this.connectionType === 'wifi' && this.activeConnection) {
            await this.activeConnection.send({ data: btoa(command) });
        } else if (this.connectionType === 'bluetooth') {
            // Lógica interna de bluetoothService
        } else if (this.connectionType === 'usb' && this.usbPort) {
            const encoder = new TextEncoder();
            const writer = this.usbPort.writable.getWriter();
            await writer.write(encoder.encode(command));
            writer.releaseLock();
        }
    }

    /**
     * Lectura sincrónica/bloqueante básica para USB
     */
    async _readUSB() {
        if (!this.usbPort || !this.usbPort.readable) return "";
        const reader = this.usbPort.readable.getReader();
        const decoder = new TextDecoder();
        let result = "";
        
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                result += decoder.decode(value);
                if (result.includes('>')) break; // Fin de trama ELM327
            }
        } catch(e) {
             console.error("Error leyendo USB:", e);
        } finally {
            reader.releaseLock();
        }
        return result;
    }

    /**
     * Desconexión Universal
     */
    async disconnect() {
        if (this.wifiKeepAliveInterval) {
            clearInterval(this.wifiKeepAliveInterval);
            this.wifiKeepAliveInterval = null;
        }

        if (this.connectionType === 'wifi' && this.activeConnection) {
            await this.activeConnection.disconnect();
        } else if (this.connectionType === 'bluetooth') {
            await bluetoothService.disconnect();
        } else if (this.connectionType === 'usb' && this.usbPort) {
            await this.usbPort.close();
            this.usbPort = null;
        }

        this.activeConnection = null;
        this.connectionType = null;
    }
}

export const connectionManager = new ConnectionManager();
