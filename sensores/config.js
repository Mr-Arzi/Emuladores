// config.js - Nodo Sensores
require('dotenv').config();

module.exports = {
    broker: {
        url: (process.env.MQTT_HOST && process.env.MQTT_PORT)
             ? `${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
             : 'mqtt://localhost:1883'
    },
    sensores: [
        { id: 'TEMP-SALA-1', tipo: 'Temperatura', topic: 'monart/SALA-1/oleo/sensores/temperatura' },
        { id: 'HUM-SALA-1',  tipo: 'Humedad',     topic: 'monart/SALA-1/oleo/sensores/humedad' },
        { id: 'LUZ-SALA-1',  tipo: 'Luz',          topic: 'monart/SALA-1/oleo/sensores/luz' },
        { id: 'UV-SALA-1',   tipo: 'UV',            topic: 'monart/SALA-1/oleo/sensores/uv' }
    ],
    // Tópico donde los actuadores publican su estado (este nodo se suscribe para ajustar física)
    topicEstadoActuadores: 'monart/SALA-1/actuadores/estado'
};
