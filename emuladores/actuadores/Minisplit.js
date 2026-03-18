const Actuador = require('./Actuador');

class Minisplit extends Actuador {
    constructor(id) {
        super(id);
        this.temperaturaObjetivo = null;
    }

    // Implementamos la lógica de encendido y apagado
    ejecutar(accion, parametrosAdicionales = {}) {
        console.log(`   ⚙️ [${this.id}] Procesando acción: '${accion}'`);
        if (accion === 'encender') {
            this.estado = true;
            this.temperaturaObjetivo = parametrosAdicionales.temperatura_objetivo || 20;
            console.log(`[${this.id}] 🧊 Encendido en modo enfriamiento a ${this.temperaturaObjetivo}°C.`);
        } 
        else if (accion === 'apagar') {
            this.estado = false;
            this.temperaturaObjetivo = null;
            console.log(`[${this.id}] 🛑 Apagado.`);
        }
    }
}

module.exports = Minisplit;