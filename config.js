require('dotenv').config();

module.exports = {
    broker: {
        url: (process.env.MQTT_HOST && process.env.MQTT_PORT) 
             ? `${process.env.MQTT_HOST}:${process.env.MQTT_PORT}` 
             : 'mqtt://localhost:1883' 
    },
    salas: {
        'SALA-1': { nombre: 'Exposición Renacentista' }
    },
    // El nuevo mapa inteligente de tópicos
    dispositivos: {
        sensores: [
            { id: 'TEMP-SALA-1', tipo: 'Temperatura', topic: 'monart/SALA-1/oleo/sensores/temperatura' },
            { id: 'HUM-SALA-1', tipo: 'Humedad', topic: 'monart/SALA-1/oleo/sensores/humedad' },
            { id: 'LUZ-SALA-1', tipo: 'Luz', topic: 'monart/SALA-1/oleo/sensores/luz' },
            { id: 'UV-SALA-1', tipo: 'UV', topic: 'monart/SALA-1/oleo/sensores/uv' }
        ],
        actuadores: [
            { id: 'AC-SALA-1', tipo: 'Minisplit', topic: 'monart/SALA-1/oleo/actuadores/minisplit' },
            { id: 'DESHUM-SALA-1', tipo: 'Deshumidificador', topic: 'monart/SALA-1/oleo/actuadores/deshumidificador' },
            { id: 'PERS-SALA-1', tipo: 'Persiana', topic: 'monart/SALA-1/oleo/actuadores/persiana' },
            { id: 'DIMMER-SALA-1', tipo: 'Dimmer', topic: 'monart/SALA-1/oleo/actuadores/dimmer' },
            { id: 'HUMID-SALA-1', tipo: 'Humidificador', topic: 'monart/SALA-1/oleo/actuadores/humidificador' }
        ]
    }
};