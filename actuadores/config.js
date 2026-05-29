// config.js - Nodo Actuadores
require('dotenv').config();

module.exports = {
    broker: {
        url: (process.env.MQTT_HOST && process.env.MQTT_PORT)
             ? `${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
             : 'mqtt://localhost:1883'
    },
    actuadores: [
        { id: 'AC-SALA-1',     tipo: 'Minisplit',         topic: 'monart/SALA-1/oleo/actuadores/minisplit' },
        { id: 'DESHUM-SALA-1', tipo: 'Deshumidificador',  topic: 'monart/SALA-1/oleo/actuadores/deshumidificador' },
        { id: 'PERS-SALA-1',   tipo: 'Persiana',          topic: 'monart/SALA-1/oleo/actuadores/persiana' },
        { id: 'DIMMER-SALA-1', tipo: 'Dimmer',            topic: 'monart/SALA-1/oleo/actuadores/dimmer' },
        { id: 'HUMID-SALA-1',  tipo: 'Humidificador',     topic: 'monart/SALA-1/oleo/actuadores/humidificador' }
    ],
    // Tópico donde este nodo publica su estado para que los sensores ajusten la física
    topicEstadoActuadores: 'monart/SALA-1/actuadores/estado'
};










