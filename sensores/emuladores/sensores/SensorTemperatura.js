const Sensor = require('./Sensor');

class SensorTemperatura extends Sensor {
    constructor(id) {
        // Llama al constructor del padre (Sensor) pasándole el ID y el Tipo fijo
        super(id, 'Temperatura'); 
    }

    // Sobrescribimos el método con la lógica específica de la temperatura
    generarDato() {
        // Temperatura ideal de museo entre 19 y 22 grados
        this.valor = parseFloat((Math.random() * (22 - 19) + 19).toFixed(2));
        return this.valor;
    }
}

module.exports = SensorTemperatura;