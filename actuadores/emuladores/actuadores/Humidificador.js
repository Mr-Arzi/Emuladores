const Actuador = require('./Actuador');

class Humidificador extends Actuador {
    constructor(id) {
        // Llama al constructor del padre pasándole el ID, el Tipo fijo y su tópico
        super(id, 'Humidificador');
    }

    // Sobrescribimos la función ejecutar para darle personalidad en la consola
    ejecutar(accion, parametros = {}) {
        if (accion === 'encender') {
            this.estado = true;
            console.log(`    [${this.id}] Procesando acción: '${accion}'`);
            console.log(`    [${this.id}] RESULTADO: Encendido. Inyectando vapor de agua al ambiente...`);
        } else if (accion === 'apagar') {
            this.estado = false;
            console.log(`    [${this.id}] Procesando acción: '${accion}'`);
            console.log(`    [${this.id}] RESULTADO: Apagado. Inyección de vapor detenida.`);
        }
    }
}

module.exports = Humidificador;