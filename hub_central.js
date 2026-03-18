const mqtt = require('mqtt');

// 1. Conexión al broker MQTT
const client = mqtt.connect('mqtt://localhost:1883');

// 2. Usamos el comodín '#' para suscribirnos a TODOS los tópicos de sensores
const topicSensores = 'monart/sensores/#';
// Tópico para enviar comandos a un actuador
const topicMiniSplit = 'monart/actuadores/minisplit';

client.on('connect', () => {
    console.log('🌐 Hub Central conectado y listo');
    
    // Suscribirse a los datos entrantes
    client.subscribe(topicSensores, (err) => {
        if (!err) {
            console.log(`✅ Suscrito exitosamente a: ${topicSensores}`);
        } else {
            console.error('❌ Error al suscribirse:', err);
        }
    });
});

// 3. Evento que se dispara cada vez que llega un mensaje de cualquier sensor
client.on('message', (topic, message) => {
    try {
        // Parsear el mensaje de JSON a un objeto de JavaScript
        const data = JSON.parse(message.toString());
        console.log(`\n📥 [HUB] Dato recibido de ${topic}:`);
        console.log(data);

        // 4. Lógica de control del Hub (Ejemplo con la temperatura)
        if (topic === 'monart/sensores/temperatura') {
            if (data.valor > 21.5) {
                console.log('⚠️ [HUB] Alerta: Temperatura superior a 21.5°C.');
                console.log('   -> Enviando orden para ENCENDER el Mini-Split...');
                
                const comando = JSON.stringify({ 
                    accion: 'encender', 
                    modo: 'enfriamiento',
                    temperatura_objetivo: 20 
                });
                
                // Publicar la orden para el actuador
                client.publish(topicMiniSplit, comando);
            }
        }
    } catch (error) {
        console.error('❌ Error procesando el mensaje:', error);
    }
});