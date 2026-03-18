// actuadores/ActuadorFactory.js
const Minisplit = require('./Minisplit');
// const Deshumidificador = require('./Deshumidificador');
// const Persiana = require('./Persiana');

const registroActuadores = {
    'Minisplit': Minisplit,
    // 'Deshumidificador': Deshumidificador,
    // 'Persiana': Persiana
};

class ActuadorFactory {
    static crearActuador(configuracion) {
        const ClaseActuador = registroActuadores[configuracion.tipo];

        if (!ClaseActuador) {
            throw new Error(`[Factory] ❌ Tipo de actuador no soportado o no registrado: ${configuracion.tipo}`);
        }

        return new ClaseActuador(configuracion.id);
    }
}

module.exports = ActuadorFactory;