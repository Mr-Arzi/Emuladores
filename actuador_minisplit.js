const mqtt = require('mqtt');

// 1. Conexión al broker MQTT
const client = mqtt.connect('mqtt://localhost:1883');

// 2. Tópico exclusivo para recibir órdenes este actuador
const topic = 'monart/actuadores/minisplit';

// Variables para simular el estado interno del equipo físico
let estadoActual = 'apagado';
let temperaturaObjetivo = null;

client.on('connect', () => {
    console.log('❄️ Actuador Mini-Split conectado y listo');
    
    // 3. Suscribirse para escuchar órdenes
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`✅ Escuchando comandos en: ${topic}`);
        } else {
            console.error('❌ Error al suscribirse:', err);
        }
    });
});

// 4. Lógica para procesar las órdenes que lleguen
client.on('message', (topic, message) => {
    try {
        const orden = JSON.parse(message.toString());
        console.log(`\n🔔 [MINI-SPLIT] Orden recibida:`);
        console.log(orden);

        // Procesar la acción
        if (orden.accion === 'encender') {
            if (estadoActual === 'apagado') {
                estadoActual = 'encendido';
                temperaturaObjetivo = orden.temperatura_objetivo;
                console.log(`🧊 ACCIÓN: Encendiendo en modo ${orden.modo} a ${temperaturaObjetivo}°C.`);
            } else {
                console.log(`ℹ️ AVISO: El Mini-Split ya estaba encendido.`);
            }
        } 
        else if (orden.accion === 'apagar') {
            if (estadoActual === 'encendido') {
                estadoActual = 'apagado';
                temperaturaObjetivo = null;
                console.log(`🛑 ACCIÓN: Apagando equipo.`);
            } else {
                console.log(`ℹ️ AVISO: El Mini-Split ya estaba apagado.`);
            }
        }

    } catch (error) {
        console.error('❌ Error leyendo la orden:', error);
    }
});