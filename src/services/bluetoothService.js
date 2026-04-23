/**
 * Servicio para comunicación Bluetooth Serial (Standard para ELM327)
 * Incluye un Queue Manager para estabilidad profesional.
 */

let commandQueue = [];
let isProcessing = false;

export const bluetoothService = {
    /**
     * Verifica si el plugin está disponible en el entorno actual.
     */
    isPluginAvailable: () => {
        return typeof window !== 'undefined' && !!window.bluetoothSerial;
    },

    /**
     * Comprueba si el Bluetooth está activado en el dispositivo.
     */
    isEnabled: () => {
        return new Promise((resolve) => {
            if (!bluetoothService.isPluginAvailable()) return resolve(false);
            window.bluetoothSerial.isEnabled(
                () => resolve(true),
                () => resolve(false)
            );
        });
    },

    /**
     * Lista los dispositivos Bluetooth emparejados.
     */
    listPairedDevices: () => {
        return new Promise((resolve, reject) => {
            if (!bluetoothService.isPluginAvailable()) return reject("Plugin Bluetooth no disponible");
            window.bluetoothSerial.list(
                (devices) => resolve(devices),
                (err) => reject(err)
            );
        });
    },

    /**
     * Conecta a un dispositivo por su dirección MAC.
     */
    connect: (address) => {
        return new Promise((resolve, reject) => {
            if (!bluetoothService.isPluginAvailable()) return reject("Plugin no disponible");
            window.bluetoothSerial.connect(
                address,
                () => resolve(true),
                (err) => reject(err)
            );
        });
    },

    /**
     * Desconecta el dispositivo actual.
     */
    disconnect: () => {
        return new Promise((resolve) => {
            if (!bluetoothService.isPluginAvailable()) return resolve();
            window.bluetoothSerial.disconnect(() => resolve(), () => resolve());
        });
    },

    /**
     * Envía un comando AT al adaptador ELM327 usando un gestor de colas.
     */
    sendPID: (pid) => {
        return new Promise((resolve, reject) => {
            // Añadir a la cola
            commandQueue.push({ pid, resolve, reject });
            bluetoothService.processQueue();
        });
    },

    /**
     * Procesa la cola de comandos secuencialmente.
     */
    processQueue: async () => {
        if (isProcessing || commandQueue.length === 0) return;
        
        isProcessing = true;
        const { pid, resolve, reject } = commandQueue.shift();

        try {
            if (!bluetoothService.isPluginAvailable()) throw new Error("No conectado");

            // 1. Limpiar buffer antes de enviar (Opcional pero recomendado)
            // 2. Escribir comando
            window.bluetoothSerial.write(pid + "\r", 
                () => {
                    // Esperar respuesta con timeout
                    let timeout = setTimeout(() => {
                        reject(new Error("Timeout esperando respuesta de ELM327"));
                        bluetoothService.nextInQueue();
                    }, 1000);

                    window.bluetoothSerial.readUntil('>', 
                        (data) => {
                            clearTimeout(timeout);
                            resolve(data);
                            bluetoothService.nextInQueue();
                        }, 
                        (err) => {
                            clearTimeout(timeout);
                            reject(err);
                            bluetoothService.nextInQueue();
                        }
                    );
                }, 
                (err) => {
                    reject(err);
                    bluetoothService.nextInQueue();
                }
            );
        } catch (e) {
            reject(e);
            bluetoothService.nextInQueue();
        }
    },

    /**
     * Finaliza el procesamiento actual y pasa al siguiente.
     */
    nextInQueue: () => {
        isProcessing = false;
        // Pequeño delay para dejar respirar al hardware
        setTimeout(() => bluetoothService.processQueue(), 50);
    },

    /**
     * Secuencia de inicialización estándar para ELM327.
     */
    initializeELM: async () => {
        try {
            await bluetoothService.sendPID("ATZ"); // Reset
            await bluetoothService.sendPID("ATE0"); // Echo off
            await bluetoothService.sendPID("ATL0"); // Linefeeds off
            await bluetoothService.sendPID("ATSP0"); // Protocol Auto
            return true;
        } catch (e) {
            console.error("Error inicializando ELM327:", e);
            return false;
        }
    }
};
