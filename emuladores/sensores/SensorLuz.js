const Sensor = require('./Sensor');

class SensorLuz extends Sensor {
    constructor(id) {
        super(id, 'Luz'); 
    }

    generarDato() {
        // Simulamos iluminación entre 40 y 160 luxes
        this.valor = parseFloat((Math.random() * (160 - 40) + 40).toFixed(2));
        return this.valor;
    }
}

module.exports = SensorLuz;