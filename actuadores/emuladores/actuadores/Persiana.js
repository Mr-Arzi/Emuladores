const Actuador = require('./Actuador');

class Persiana extends Actuador {
    constructor(id) {
        super(id);
        this.porcentajeApertura = 0; // 0 = cerrada, 100 = totalmente abierta
    }

    ejecutar(accion, parametrosAdicionales = {}) {
        console.log(`    [${this.id}] Procesando acción: '${accion}'`);

        if (accion === 'abrir') {
            this.porcentajeApertura = 100;
            console.log(`    [${this.id}] RESULTADO: Persiana totalmente abierta.`);
        } 
        else if (accion === 'cerrar') {
            this.porcentajeApertura = 0;
            console.log(`    [${this.id}] RESULTADO: Persiana totalmente cerrada.`);
        }
        else if (accion === 'ajustar') {
            this.porcentajeApertura = parametrosAdicionales.porcentaje || 50;
            console.log(`    [${this.id}] RESULTADO: Persiana ajustada al ${this.porcentajeApertura}%.`);
        }
    }
}

module.exports = Persiana;