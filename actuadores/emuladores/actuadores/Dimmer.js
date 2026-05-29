const Actuador = require('./Actuador');

class Dimmer extends Actuador {
    constructor(id) {
        super(id);
        this.nivelBrillo = 0; // 0 = apagado, 100 = brillo máximo
    }

    ejecutar(accion, parametrosAdicionales = {}) {
        console.log(`    [${this.id}] Procesando acción: '${accion}'`);

        if (accion === 'encender') {
            this.estado = true;
            this.nivelBrillo = parametrosAdicionales.nivel_brillo || 100;
            console.log(`    [${this.id}] RESULTADO: Luces encendidas al ${this.nivelBrillo}%.`);
        } 
        else if (accion === 'apagar') {
            this.estado = false;
            this.nivelBrillo = 0;
            console.log(`    [${this.id}] RESULTADO: Luces apagadas.`);
        }
    }
}

module.exports = Dimmer;