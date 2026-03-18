// sensores/SensorFactory.js
const SensorTemperatura = require('./SensorTemperatura');
// Aquí irán importando los demás sensores conforme los desarrollen
// const SensorHumedad = require('./SensorHumedad');
// const SensorLuz = require('./SensorLuz');

// Mapeo dinámico: Relaciona el texto del config con la Clase real
const registroSensores = {
    'Temperatura': SensorTemperatura,
    // 'Humedad': SensorHumedad,
    // 'Luz': SensorLuz
};

class SensorFactory {
    static crearSensor(configuracion) {
        // Buscamos la clase correspondiente en nuestro registro
        const ClaseSensor = registroSensores[configuracion.tipo];

        if (!ClaseSensor) {
            throw new Error(`[Factory] ❌ Tipo de sensor no soportado o no registrado: ${configuracion.tipo}`);
        }

        // Retornamos una nueva instancia, pasándole solo lo que necesita (su ID)
        return new ClaseSensor(configuracion.id);
    }
}

module.exports = SensorFactory;