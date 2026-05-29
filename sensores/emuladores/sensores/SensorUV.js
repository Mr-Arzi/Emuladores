const Sensor = require('./Sensor');

class SensorUV extends Sensor {
    constructor(id) {
        super(id, 'UV'); 
    }

    generarDato() {
        // Simulamos radiación UV entre 10 y 60 µW/lm
        this.valor = parseFloat((Math.random() * (60 - 10) + 10).toFixed(2));
        return this.valor;
    }
}

module.exports = SensorUV;