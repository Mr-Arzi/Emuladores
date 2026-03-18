// estrategias/EstrategiaOleo.js
const EstrategiaConservacion = require('./EstrategiaConservacion');

class EstrategiaOleo extends EstrategiaConservacion {
    evaluar(datosSensor) {
        // Los óleos sufren con temperaturas mayores a 24°C
        if (datosSensor.tipo === 'Temperatura' && datosSensor.valor > 21) {
            return { 
                alerta: true, 
                mensaje: 'Temperatura crítica para Pintura al Óleo',
                comando: { accion: 'encender', temperatura_objetivo: 19 } 
            };
        }
        // Aquí agregarías las reglas de humedad, luz, etc., para el óleo
        
        return { alerta: false };
    }
}

module.exports = EstrategiaOleo;