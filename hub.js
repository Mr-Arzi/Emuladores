const mqtt = require('mqtt');
const config = require('./config');
// Importas tus estrategias aquí...

const client = mqtt.connect(config.broker.url);

// 1. Objeto para llevar el control de las cuentas regresivas
const temporizadoresActivos = {}; 

client.on('connect', () => {
    console.log(` Hub conectado`);
    // Nos suscribimos a los sensores y también a las respuestas del Front
    client.subscribe(['monart/sensores/#', 'monart/hub/respuestas']);
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());

    console.log(`\n [HUB RECIBIÓ] Tópico: ${topic}`);
        console.log(`   Datos:`, data);

    // =======================================================
    // ESCENARIO A: LLEGA UN DATO DE UN SENSOR
    // =======================================================
    if (topic.includes('monart/sensores/')) {
        const sensorConfig = config.dispositivos.sensores.find(s => s.id === data.id_sensor);
        if (!sensorConfig) return;

        // Aquí aplicas tu Patrón Strategy (simulado en estas líneas)
        // const resultadoEstrategia = estrategiaAplicar.evaluar(data);
        
        // Supongamos que tu Estrategia determinó que hace mucho calor en la Sala 1:
        const resultadoEstrategia = { 
            alerta: true, 
            actuador_requerido: 'Minisplit',
            comando: { accion: 'encender', temperatura_objetivo: 21 } 
        };

        if (resultadoEstrategia.alerta) {
            const idAlerta = `${sensorConfig.sala}-${resultadoEstrategia.actuador_requerido}`;

            // Si ya hay un temporizador corriendo para este problema, no hacemos nada para no duplicar
            if (temporizadoresActivos[idAlerta]) return;

            console.log(`\n ALERTA EN ${sensorConfig.sala}. Pidiendo autorización al Front...`);

            // 2. Mandamos la notificación al Front para que el usuario lo vea
            client.publish('monart/front/alertas', JSON.stringify({
                id_alerta: idAlerta,
                mensaje: `Temperatura alta. ¿Encender ${resultadoEstrategia.actuador_requerido}?`,
                comando_sugerido: resultadoEstrategia.comando
            }));

            // 3. INICIAMOS EL CRONÓMETRO (Ej. 10 segundos = 10000 milisegundos)
            temporizadoresActivos[idAlerta] = setTimeout(() => {
                console.log(` [FAILSAFE] Tiempo agotado sin respuesta. Tomando el control en ${sensorConfig.sala}...`);
                
                // Buscamos cuál es el tópico del actuador que corresponde a esta sala
                const actuadorDestino = config.dispositivos.actuadores.find(
                    a => a.tipo === resultadoEstrategia.actuador_requerido // Falta agregar "sala" a los actuadores en config.js
                );

                if (actuadorDestino) {
                    // MANDAMOS LA ORDEN AL BROKER PARA QUE LA ESCUCHE EL ACTUADOR
                    client.publish(actuadorDestino.topic, JSON.stringify(resultadoEstrategia.comando));
                    console.log(` Orden de emergencia enviada a: ${actuadorDestino.topic}`);
                }

                // Limpiamos el registro del temporizador porque ya se ejecutó
                delete temporizadoresActivos[idAlerta];

            }, 10000); 
        }
    }

    // =======================================================
    // ESCENARIO B: EL FRONT RESPONDE ANTES DE QUE ACABE EL TIEMPO
    // =======================================================
    else if (topic === 'monart/hub/respuestas') {
        const respuestaFront = data; // { id_alerta: 'SALA-1-Minisplit', decision: 'aprobar', comando: {...} }

        if (temporizadoresActivos[respuestaFront.id_alerta]) {
            // 4. ¡El operador respondió! Cancelamos la cuenta regresiva automática
            clearTimeout(temporizadoresActivos[respuestaFront.id_alerta]);
            delete temporizadoresActivos[respuestaFront.id_alerta];

            console.log(` Intervención humana recibida para ${respuestaFront.id_alerta}: ${respuestaFront.decision}`);

            if (respuestaFront.decision === 'aprobar') {
                // Buscamos el actuador y publicamos la orden aprobada
                const actuadorDestino = config.dispositivos.actuadores.find(a => a.tipo === 'Minisplit');
                client.publish(actuadorDestino.topic, JSON.stringify(respuestaFront.comando));
                console.log(` Orden humana ejecutada.`);
            } else {
                console.log(` El operador denegó la acción. No se hizo nada.`);
            }
        }
    }
});