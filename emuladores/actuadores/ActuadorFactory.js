// actuadores/ActuadorFactory.js
const Minisplit = require('./Minisplit');
const Deshumidificador = require('./Deshumidificador');
const Persiana = require('./Persiana');
const Dimmer = require('./Dimmer');
const Humidificador = require('./Humidificador');

const registroActuadores = {
    'Minisplit': Minisplit,
    'Deshumidificador': Deshumidificador,
    'Persiana': Persiana,
    'Dimmer': Dimmer,
    'Humidificador': Humidificador
};

class ActuadorFactory {
    static crearActuador(configuracion) {
        const ClaseActuador = registroActuadores[configuracion.tipo];

        if (!ClaseActuador) {
            throw new Error(`[Factory]  Tipo de actuador no soportado o no registrado: ${configuracion.tipo}`);
        }

        return new ClaseActuador(configuracion.id);
    }
}

module.exports = ActuadorFactory;