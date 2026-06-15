// index.js - Nodo Sensores MONART
// Este proceso SOLO publica lecturas de sensores.
// Escucha el estado de los actuadores via MQTT para simular física correcta.

const mqtt = require("mqtt");
const config = require("./config");
const SensorFactory = require("./emuladores/sensores/SensorFactory");

console.log("🔬 Iniciando Nodo de Sensores MONART...");
console.log(`   Conectando a broker: ${config.broker.url}`);

const client = mqtt.connect(config.broker.url, {
    will: {
        topic: 'monart/SALA-1/sistema/notificaciones',
        payload: JSON.stringify({
            tipo: 'sistema',
            origen: 'sensores',
            evento: 'offline',
            mensaje: '🔴 Nodo de Sensores desconectado',
            timestamp: new Date().toISOString()
        }),
        qos: 1,
        retain: false
    }
});

// ===================================================
// Estado del ambiente (se actualiza desde MQTT,
// no desde memoria compartida con actuadores)
// ===================================================
let ambiente = {
  minisplitEncendido: false,
  deshumidificadorEncendido: false,
  humidificadorEncendido: false,
  persianaAbierta: false,
  dimmerEncendido: false,
  nivelDimmer: 0,

  temperaturaActual: 22.0,
  humedadActual: 55.0,
  luzActual: 150,
  uvActual: 10,
};

client.on("connect", () => {
  console.log(`✅ Conectado exitosamente al broker MQTT`);

  // Suscribirse al tópico de estado de actuadores para mantener física sincronizada
  client.subscribe(config.topicEstadoActuadores, (err) => {
    if (!err)
      console.log(
        `📡 Escuchando estado de actuadores en: ${config.topicEstadoActuadores}`,
      );
  });

  console.log("\n--- Iniciando despliegue de Sensores ---");

  // Al conectar, notificar que el nodo de sensores está activo
  client.publish(
    "monart/SALA-1/sistema/notificaciones",
    JSON.stringify({
      tipo: "sistema",
      origen: "sensores",
      evento: "online",
      mensaje: "🔬 Nodo de Sensores conectado y activo",
      timestamp: new Date().toISOString(),
    }),
  );

  config.sensores.forEach((configSensor) => {
    try {
      const sensor = SensorFactory.crearSensor(configSensor);
      console.log(`  Sensor iniciado: [${sensor.id}]`);
      client.publish(
        "monart/SALA-1/sistema/notificaciones",
        JSON.stringify({
          tipo: "sensor",
          origen: sensor.id,
          evento: "online",
          mensaje: `✅ Sensor [${sensor.id}] iniciado correctamente`,
          timestamp: new Date().toISOString(),
        }),
      );

      setInterval(() => {
        let valor;

        if (sensor.tipo === "Temperatura") {
          if (ambiente.minisplitEncendido) ambiente.temperaturaActual -= 0.5;
          else ambiente.temperaturaActual += 0.2;
          if (ambiente.temperaturaActual < 16) ambiente.temperaturaActual = 16;
          if (ambiente.temperaturaActual > 35) ambiente.temperaturaActual = 35;
          valor = parseFloat(
            (ambiente.temperaturaActual + (Math.random() * 0.4 - 0.2)).toFixed(
              2,
            ),
          );
        } else if (sensor.tipo === "Humedad") {
          if (ambiente.deshumidificadorEncendido) {
            ambiente.humedadActual -= 1.0;
          } else if (ambiente.humidificadorEncendido) {
            ambiente.humedadActual += 1.0;
          } else {
            ambiente.humedadActual += 0.1;
          }
          if (ambiente.humedadActual < 20) ambiente.humedadActual = 20;
          if (ambiente.humedadActual > 80) ambiente.humedadActual = 80;
          valor = parseFloat(
            (ambiente.humedadActual + (Math.random() * 0.5 - 0.25)).toFixed(2),
          );
        } else if (sensor.tipo === "Luz") {
          let luzObjetivo = 50;
          if (ambiente.persianaAbierta) luzObjetivo += 500;
          if (ambiente.dimmerEncendido) luzObjetivo += ambiente.nivelDimmer * 4;
          if (ambiente.luzActual < luzObjetivo) ambiente.luzActual += 40;
          if (ambiente.luzActual > luzObjetivo) ambiente.luzActual -= 40;
          valor = parseInt(ambiente.luzActual + (Math.random() * 10 - 5));
        } else if (sensor.tipo === "UV") {
          let uvObjetivo = ambiente.persianaAbierta ? 130 : 5;
          if (ambiente.uvActual < uvObjetivo) ambiente.uvActual += 15;
          if (ambiente.uvActual > uvObjetivo) ambiente.uvActual -= 15;
          valor = parseInt(ambiente.uvActual + Math.random() * 2);
        }

        const payload = JSON.stringify({
          id_sensor: sensor.id,
          tipo: sensor.tipo,
          valor: valor,
          timestamp: new Date().toISOString(),
        });

        client.publish(configSensor.topic, payload);
        console.log(`  📤 [${sensor.id}] -> ${configSensor.topic} | ${sensor.tipo}: ${valor}`);
      }, 5000);
    } catch (error) {
      console.error(error.message);
    }
  });
});

// ===================================================
// Recibir estado de actuadores desde el broker
// El nodo de actuadores publica aquí cuando recibe
// una orden, para mantener la física sincronizada
// ===================================================
client.on("message", (topic, message) => {
  if (topic === config.topicEstadoActuadores) {
    try {
      const estado = JSON.parse(message.toString());
      // Merge del estado recibido al objeto local
      Object.assign(ambiente, estado);
      console.log("🔄 Estado de actuadores actualizado:", estado);
    } catch (e) {
      console.error("Error procesando estado de actuadores:", e.message);
    }
  }
});

client.on("error", (err) => {
  console.error("❌ Error de conexión MQTT:", err.message);
});

client.on("reconnect", () => {
  console.log("🔁 Reconectando al broker...");
});


