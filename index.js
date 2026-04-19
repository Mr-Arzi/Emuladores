// index.js
const mqtt = require('mqtt');
const config = require('./config');
const SensorFactory = require('./emuladores/sensores/SensorFactory');
const ActuadorFactory = require('./emuladores/actuadores/ActuadorFactory');

console.log(' Iniciando Sistema Emulador MONART...');

const client = mqtt.connect(config.broker.url);

// ==========================================
// 1. EL CLIMA DE LA SALA (Físicas 360° y Memoria)
// ==========================================
let ambiente = {
    minisplitEncendido: false,
    deshumidificadorEncendido: false,
    humidificadorEncendido: false, // <-- AQUÍ ESTÁ EL NUEVO APARATO
    persianaAbierta: false,
    dimmerEncendido: false,
    nivelDimmer: 0,

    temperaturaActual: 22.0,
    humedadActual: 55.0,
    luzActual: 150,
    uvActual: 10
};

const actuadoresActivos = {}; 

client.on('connect', () => {
    console.log(`Conectado exitosamente a EMQX en ${config.broker.url}`);
    
    console.log('\n--- Iniciando despliegue de Sensores ---');
    config.dispositivos.sensores.forEach(configSensor => {
        try {
            const sensor = SensorFactory.crearSensor(configSensor);
            console.log(` Sensor iniciado: [${sensor.id}]`);

            setInterval(() => {
                let valor;

                // ==========================================
                // 2. FÍSICAS DE LOS SENSORES
                // ==========================================
                if (sensor.tipo === 'Temperatura') {
                    if (ambiente.minisplitEncendido) ambiente.temperaturaActual -= 0.5;
                    else ambiente.temperaturaActual += 0.2;
                    
                    if (ambiente.temperaturaActual < 16) ambiente.temperaturaActual = 16;
                    if (ambiente.temperaturaActual > 35) ambiente.temperaturaActual = 35;
                    valor = parseFloat((ambiente.temperaturaActual + (Math.random() * 0.4 - 0.2)).toFixed(2));
                } 
                else if (sensor.tipo === 'Humedad') {
                    // Lógica para que peleen el Humidificador vs Deshumidificador
                    if (ambiente.deshumidificadorEncendido) {
                        ambiente.humedadActual -= 1.0; // Seca el aire
                    } else if (ambiente.humidificadorEncendido) {
                        ambiente.humedadActual += 1.0; // Inyecta vapor
                    } else {
                        ambiente.humedadActual += 0.1; // Sube naturalmente
                    }
                    
                    if (ambiente.humedadActual < 20) ambiente.humedadActual = 20;
                    if (ambiente.humedadActual > 80) ambiente.humedadActual = 80;
                    valor = parseFloat((ambiente.humedadActual + (Math.random() * 0.5 - 0.25)).toFixed(2));
                }
                else if (sensor.tipo === 'Luz') {
                    let luzObjetivo = 50; 
                    if (ambiente.persianaAbierta) luzObjetivo += 500; 
                    if (ambiente.dimmerEncendido) luzObjetivo += (ambiente.nivelDimmer * 4); 
                    
                    if (ambiente.luzActual < luzObjetivo) ambiente.luzActual += 40;
                    if (ambiente.luzActual > luzObjetivo) ambiente.luzActual -= 40;
                    valor = parseInt(ambiente.luzActual + (Math.random() * 10 - 5));
                }
                else if (sensor.tipo === 'UV') {
                    let uvObjetivo = ambiente.persianaAbierta ? 130 : 5; 
                    if (ambiente.uvActual < uvObjetivo) ambiente.uvActual += 15;
                    if (ambiente.uvActual > uvObjetivo) ambiente.uvActual -= 15;
                    valor = parseInt(ambiente.uvActual + (Math.random() * 2));
                }

                const payload = JSON.stringify({
                    id_sensor: sensor.id,
                    tipo: sensor.tipo,
                    valor: valor,
                    timestamp: new Date().toISOString()
                });

                client.publish(configSensor.topic, payload);
            }, 5000);
        } catch (error) {
            console.error(error.message); 
        }
    });

    console.log('\n--- Iniciando despliegue de Actuadores ---');
    config.dispositivos.actuadores.forEach(configActuador => {
        try {
            const actuador = ActuadorFactory.crearActuador(configActuador);
            console.log(` Actuador iniciado: [${actuador.id}]`);
            actuadoresActivos[configActuador.topic] = actuador;

            client.subscribe(configActuador.topic, (err) => {
                if (!err) console.log(`    Escuchando en: ${configActuador.topic}`);
            });
        } catch (error) {
            console.error(error.message);
        }
    });
});

client.on('message', (topic, message) => {
    if (actuadoresActivos[topic]) {
        try {
            const orden = JSON.parse(message.toString());
            console.log(`\n [ORDEN RECIBIDA] Tópico: ${topic} | Acción: ${orden.accion}`);
            
            actuadoresActivos[topic].ejecutar(orden.accion, orden);

            // ==========================================
            // 3. ENRUTADOR (Usando endsWith para no confundir aparatos)
            // ==========================================
            if (topic.endsWith('/minisplit')) {
                ambiente.minisplitEncendido = (orden.accion === 'encender');
            } 
            else if (topic.endsWith('/deshumidificador')) {
                ambiente.deshumidificadorEncendido = (orden.accion === 'encender');
            }
            else if (topic.endsWith('/humidificador')) {
                ambiente.humidificadorEncendido = (orden.accion === 'encender'); // <-- REGISTRA LA ORDEN DEL NUEVO
            }
            else if (topic.endsWith('/persiana')) {
                ambiente.persianaAbierta = (orden.accion === 'abrir');
            }
            else if (topic.endsWith('/dimmer')) {
                ambiente.dimmerEncendido = (orden.accion === 'encender');
                if (orden.accion === 'encender' && orden.nivel_brillo) {
                    ambiente.nivelDimmer = orden.nivel_brillo; 
                }
            }
        } catch (error) {
            console.error(`Error:`, error);
        }
    }
});