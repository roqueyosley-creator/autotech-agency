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
            if (!bluetoothService.isPluginAvailable()) {
                // Modo Simulación para Desarrollo Web
                console.warn(`Bluetooth Simulation: Recibido PID [${pid}]`);
                setTimeout(() => {
                    if (pid === "AT RV") resolve("13.8V");
                    if (pid === "010C") resolve("41 0C 1A F8"); // ~1726 RPM
                    if (pid === "03") resolve("43 01 33 00 00 00 00"); // P0133
                    resolve("OK");
                }, 100);
                return;
            }
            // Añadir a la cola real
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
        const task = commandQueue.shift();
        if (!task) {
            isProcessing = false;
            return;
        }

        const { pid, resolve, reject } = task;

        try {
            // Escribir comando
            window.bluetoothSerial.write(pid + "\r", 
                () => {
                    // Esperar respuesta con timeout
                    let timeout = setTimeout(() => {
                        reject(new Error("Timeout esperando respuesta de ELM327"));
                        bluetoothService.nextInQueue();
                    }, 2000);

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
        setTimeout(() => bluetoothService.processQueue(), 50);
    },

    /**
     * Secuencia de inicialización estándar para ELM327.
     */
    initializeELM: async () => {
        try {
            await bluetoothService.sendPID("ATZ");
            await bluetoothService.sendPID("ATE0");
            await bluetoothService.sendPID("ATL0");
            await bluetoothService.sendPID("ATSP0");
            return true;
        } catch (e) {
            console.error("Error inicializando ELM327:", e);
            return false;
        }
    }
};
