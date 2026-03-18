const mqtt = require('mqtt');

// 1. Conexión al broker MQTT (asumiendo que Mosquitto corre en tu misma PC)
const client = mqtt.connect('mqtt://localhost:1883');

// 2. Definir el tópico. Una buena práctica es usar jerarquías claras.
const topic = 'monart/sensores/temperatura';

client.on('connect', () => {
    console.log('✅ Sensor de Temperatura conectado al broker');

    // 3. Bucle para simular la lectura del sensor cada 5 segundos
    setInterval(() => {
        // Simulamos una temperatura estable ideal para un museo (entre 19°C y 22°C)
        const temperaturaSimulada = (Math.random() * (22 - 19) + 19).toFixed(2);
        
        // Estructuramos el dato en JSON
        const payload = JSON.stringify({
            id_sensor: 'TEMP-01',
            valor: parseFloat(temperaturaSimulada),
            unidad: 'C',
            timestamp: new Date().toISOString()
        });

        // 4. Publicar el mensaje en el broker
        client.publish(topic, payload);
        console.log(`📤 Publicado en [${topic}]: ${payload}`);
        
    }, 5000); 
});

client.on('error', (err) => {
    console.error('❌ Error de conexión con el broker:', err);
});