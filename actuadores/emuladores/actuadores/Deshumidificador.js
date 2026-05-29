const Actuador = require('./Actuador');

class Deshumidificador extends Actuador {
    constructor(id) {
        super(id);
        this.humedadObjetivo = null;
    }

    ejecutar(accion, parametrosAdicionales = {}) {
        console.log(`    [${this.id}] Procesando acción: '${accion}'`);

        if (accion === 'encender') {
            this.estado = true;
            this.humedadObjetivo = parametrosAdicionales.humedad_objetivo || 45;
            console.log(`    [${this.id}] RESULTADO: Encendido. Buscando humedad del ${this.humedadObjetivo}%.`);
        } 
        else if (accion === 'apagar') {
            this.estado = false;
            this.humedadObjetivo = null;
            console.log(`    [${this.id}] RESULTADO: Apagado.`);
        }
    }
}

module.exports = Deshumidificador;