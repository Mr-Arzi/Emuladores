// index.js - Nodo Actuadores MONART
// Este proceso SOLO recibe órdenes para los actuadores.
// Cada vez que ejecuta una orden, publica el nuevo estado
// en un tópico compartido para que el nodo de sensores
// pueda mantener la simulación física sincronizada.

const mqtt = require("mqtt");
const config = require("./config");
const ActuadorFactory = require("./emuladores/actuadores/ActuadorFactory");

console.log("⚙️  Iniciando Nodo de Actuadores MONART...");
console.log(`   Conectando a broker: ${config.broker.url}`);

const client = mqtt.connect(config.broker.url, {
    will: {
        topic: 'monart/SALA-1/sistema/notificaciones',
        payload: JSON.stringify({
            tipo: 'sistema',
            origen: 'actuadores',
            evento: 'offline',
            mensaje: '🔴 Nodo de Actuadores desconectado',
            timestamp: new Date().toISOString()
        }),
        qos: 1,
        retain: false
    }
});

// Estado local para publicar al tópico de estado
let estadoActuadores = {
  minisplitEncendido: false,
  deshumidificadorEncendido: false,
  humidificadorEncendido: false,
  persianaAbierta: false,
  dimmerEncendido: false,
  nivelDimmer: 0,
};

const actuadoresActivos = {};

client.on("connect", () => {
  console.log(`✅ Conectado exitosamente al broker MQTT`);
  console.log("\n--- Iniciando despliegue de Actuadores ---");

  config.actuadores.forEach((configActuador) => {
    try {
      const actuador = ActuadorFactory.crearActuador(configActuador);

      console.log(` ✔ Actuador iniciado: [${actuador.id}]`);
      client.publish(
        "`monart/${config.sala}/sistema/notificaciones",
        JSON.stringify({
          tipo: "actuador",
          origen: actuador.id,
          evento: "online",
          mensaje: `⚙️ Nodo de Actuadores conectado y activo (${config.sala})`,
          timestamp: new Date().toISOString(),
        }),
      );

      actuadoresActivos[configActuador.topic] = actuador;

      client.subscribe(configActuador.topic, (err) => {
        if (!err) console.log(`    📡 Escuchando en: ${configActuador.topic}`);
      });
    } catch (error) {
      console.error(error.message);
    }
  });
});

client.on("message", (topic, message) => {
  if (!actuadoresActivos[topic]) return;

  try {
    const orden = JSON.parse(message.toString());
    console.log(`\n ▶ [ORDEN RECIBIDA] Tópico: ${topic}`);
    console.log(`   Payload: ${message.toString()}`);

    actuadoresActivos[topic].ejecutar(orden.accion, orden);

    // Actualizar estado local según la orden recibida
    if (topic.endsWith("/minisplit")) {
      estadoActuadores.minisplitEncendido = orden.accion === "encender";
      console.log(`   🌡️  Minisplit -> ${estadoActuadores.minisplitEncendido ? "ENCENDIDO" : "APAGADO"}`);
    } else if (topic.endsWith("/deshumidificador")) {
      estadoActuadores.deshumidificadorEncendido = orden.accion === "encender";
      console.log(`   💨 Deshumidificador -> ${estadoActuadores.deshumidificadorEncendido ? "ENCENDIDO" : "APAGADO"}`);
    } else if (topic.endsWith("/humidificador")) {
      estadoActuadores.humidificadorEncendido = orden.accion === "encender";
      console.log(`   💧 Humidificador -> ${estadoActuadores.humidificadorEncendido ? "ENCENDIDO" : "APAGADO"}`);
    } else if (topic.endsWith("/persiana")) {
      estadoActuadores.persianaAbierta = orden.accion === "abrir";
      console.log(`   🪟 Persiana -> ${estadoActuadores.persianaAbierta ? "ABIERTA" : "CERRADA"}`);
    } else if (topic.endsWith("/dimmer")) {
      estadoActuadores.dimmerEncendido = orden.accion === "encender";
      if (orden.accion === "encender" && orden.nivel_brillo) {
        estadoActuadores.nivelDimmer = orden.nivel_brillo;
      }
      console.log(`   💡 Dimmer -> ${estadoActuadores.dimmerEncendido ? `ENCENDIDO al ${estadoActuadores.nivelDimmer}%` : "APAGADO"}`);
    }

    // Publicar el nuevo estado para que el nodo de sensores actualice su física
    client.publish(
      config.topicEstadoActuadores,
      JSON.stringify(estadoActuadores),
    );
    console.log(`   📤 Estado publicado en ${config.topicEstadoActuadores}`);
  } catch (error) {
    console.error("Error procesando orden:", error.message);
  }
});

client.on("error", (err) => {
  console.error("❌ Error de conexión MQTT:", err.message);
});

client.on("reconnect", () => {
  console.log("🔁 Reconectando al broker...");
});

