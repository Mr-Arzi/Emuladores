const Sensor = require('./Sensor');

class SensorHumedad extends Sensor {
    constructor(id) {
        super(id, 'Humedad'); 
    }

    generarDato() {
        // Simulamos humedad entre 45% y 55%
        this.valor = parseFloat((Math.random() * (55 - 45) + 45).toFixed(2));
        return this.valor;
    }
}

module.exports = SensorHumedad;