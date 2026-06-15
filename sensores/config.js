require('dotenv').config();

const SALA = process.env.SALA_ID || 'SALA-1';

module.exports = {
    broker: {
        url: (process.env.MQTT_HOST && process.env.MQTT_PORT)
             ? `${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
             : 'mqtt://localhost:1883'
    },
    sala: SALA,
    sensores: [
        { id: `TEMP-${SALA}`, tipo: 'Temperatura', topic: `monart/${SALA}/oleo/sensores/temperatura` },
        { id: `HUM-${SALA}`,  tipo: 'Humedad',     topic: `monart/${SALA}/oleo/sensores/humedad` },
        { id: `LUZ-${SALA}`,  tipo: 'Luz',         topic: `monart/${SALA}/oleo/sensores/luz` },
        { id: `UV-${SALA}`,   tipo: 'UV',           topic: `monart/${SALA}/oleo/sensores/uv` }
    ],
    topicEstadoActuadores: `monart/${SALA}/actuadores/estado`
};