require('dotenv').config();

const SALA = process.env.SALA_ID || 'SALA-1';

module.exports = {
    broker: {
        url: (process.env.MQTT_HOST && process.env.MQTT_PORT)
             ? `${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
             : 'mqtt://localhost:1883'
    },
    sala: SALA,
    actuadores: [
        { id: `AC-${SALA}`,     tipo: 'Minisplit',        topic: `monart/${SALA}/oleo/actuadores/minisplit` },
        { id: `DESHUM-${SALA}`, tipo: 'Deshumidificador', topic: `monart/${SALA}/oleo/actuadores/deshumidificador` },
        { id: `PERS-${SALA}`,   tipo: 'Persiana',         topic: `monart/${SALA}/oleo/actuadores/persiana` },
        { id: `DIMMER-${SALA}`, tipo: 'Dimmer',           topic: `monart/${SALA}/oleo/actuadores/dimmer` },
        { id: `HUMID-${SALA}`,  tipo: 'Humidificador',    topic: `monart/${SALA}/oleo/actuadores/humidificador` }
    ],
    topicEstadoActuadores: `monart/${SALA}/actuadores/estado`
};









