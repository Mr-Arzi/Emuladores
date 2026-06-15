// main.js

// ==========================================
// FÁBRICA DE GRÁFICAS (CHART.JS)
// ==========================================
function instanciarGrafica(idCanvas, titulo, colorLinea, colorFondo, minY, maxY) {
    const ctx = document.getElementById(idCanvas).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: titulo,
                data: [],
                borderColor: colorLinea,
                backgroundColor: colorFondo,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            scales: { y: { min: minY, max: maxY } },
            animation: { duration: 500 }
        }
    });
}

// Creamos las 4 gráficas
const chartTemp = instanciarGrafica('graficaTemp', 'Temperatura (°C)', '#ff7675', 'rgba(255, 118, 117, 0.2)', 15, 35);
const chartHum = instanciarGrafica('graficaHum', 'Humedad (%)', '#74b9ff', 'rgba(116, 185, 255, 0.2)', 20, 80);
const chartLuz = instanciarGrafica('graficaLuz', 'Nivel de Luz (lx)', '#fdcb6e', 'rgba(253, 203, 110, 0.2)', 0, 800);
const chartUV = instanciarGrafica('graficaUV', 'Radiación UV', '#a29bfe', 'rgba(162, 155, 254, 0.2)', 0, 150);

function actualizarGrafica(chart, valor) {
    const hora = new Date().toLocaleTimeString();
    chart.data.labels.push(hora);
    chart.data.datasets[0].data.push(valor);

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

// ==========================================
// CONEXIÓN MQTT
// ==========================================
// ⚠️ CONFIGURACIÓN: Cambia esta IP por la IP de la computadora donde corre EMQX
// EMQX expone WebSocket en el puerto 8083 por defecto
const EMQX_IP = 'localhost';
let salaActual = 'SALA-1';
const salasConocidas = ['SALA-1'];

const cliente = mqtt.connect(`ws://${EMQX_IP}:8083/mqtt`);

cliente.on('connect', () => {
    document.getElementById('estado-conexion').innerText = '✅ Conectado a EMQX';
    document.getElementById('estado-conexion').style.color = '#00b894';
    suscribirSala(salaActual);
});

// Escuchar mensajes
cliente.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic.includes('sensores/temperatura')) {
        document.getElementById('valor-temp').innerText = `${data.valor} °C`;
        actualizarGrafica(chartTemp, data.valor);
        
    } else if (topic.includes('sensores/humedad')) {
        document.getElementById('valor-hum').innerText = `${data.valor} %`;
        actualizarGrafica(chartHum, data.valor);

    } else if (topic.includes('sensores/luz')) {
        document.getElementById('valor-luz').innerText = `${data.valor} lx`;
        actualizarGrafica(chartLuz, data.valor);

    } else if (topic.includes('sensores/uv')) {
        document.getElementById('valor-uv').innerText = `${data.valor}`;
        actualizarGrafica(chartUV, data.valor);

    } else if (topic.includes('sistema/notificaciones')) {
    const notif = JSON.parse(message.toString());
    mostrarNotificacion(notif);
    
} else if (topic === `monart/${salaActual}/actuadores/estado`) {
    const estado = JSON.parse(message.toString());
    procesarCambioActuadores(estado);
}
});

// ==========================================
// ENVIAR COMANDOS A ACTUADORES
// ==========================================
function enviarComando(dispositivo, accion) {
    let comando = { accion: accion };
    if (dispositivo === 'minisplit' && accion === 'encender') comando.temperatura_objetivo = 20;
    if (dispositivo === 'deshumidificador' && accion === 'encender') comando.humedad_objetivo = 45;
    if (dispositivo === 'humidificador' && accion === 'encender') comando.humedad_objetivo = 60; // ¡Con tu mejora agregada!
    if (dispositivo === 'dimmer' && accion === 'encender') comando.nivel_brillo = 80;

    cliente.publish(`monart/${salaActual}/oleo/actuadores/${dispositivo}`, JSON.stringify(comando));
    
    let textoAccion = accion === 'encender' || accion === 'abrir' ? '🟢 ' + accion.toUpperCase() : '🔴 ' + accion.toUpperCase();
    document.getElementById(`estado-${dispositivo}`).innerText = `Último: ${textoAccion}`;
}

// ==========================================
// NOTIFICACIONES DE SISTEMA
// ==========================================
function mostrarNotificacion(notif) {
    const contenedor = document.getElementById('contenedor-notificaciones');
    const div = document.createElement('div');
    div.className = `notificacion ${notif.evento === 'online' ? 'notif-online' : 'notif-offline'}`;
    div.innerHTML = `<strong>${notif.mensaje}</strong> <span class="notif-hora">${new Date(notif.timestamp).toLocaleTimeString()}</span>`;
    contenedor.prepend(div);

    // Máximo 50 notificaciones visibles
    if (contenedor.children.length > 50) {
        contenedor.removeChild(contenedor.lastChild);
    }
}


// ==========================================
// NOTIFICACIONES DE CAMBIO DE ACTUADORES
// ==========================================
let estadoAnteriorActuadores = null;

const nombresActuadores = {
    minisplitEncendido:        '❄️ Mini-Split',
    deshumidificadorEncendido: '🌬️ Deshumidificador',
    humidificadorEncendido:    '♨️ Humidificador',
    persianaAbierta:           '🪟 Persiana',
    dimmerEncendido:           '💡 Dimmer'
};

function procesarCambioActuadores(estadoNuevo) {
    if (!estadoAnteriorActuadores) {
        estadoAnteriorActuadores = estadoNuevo;
        return;
    }

    Object.keys(nombresActuadores).forEach(clave => {
        const antes = estadoAnteriorActuadores[clave];
        const ahora = estadoNuevo[clave];

        if (antes !== ahora) {
            const nombre = nombresActuadores[clave];
            const encendido = ahora === true;
            mostrarNotificacion({
                tipo: 'actuador',
                origen: clave,
                evento: encendido ? 'online' : 'offline',
                mensaje: encendido
                    ? `✅ ${nombre} encendido`
                    : `🔴 ${nombre} apagado`,
                timestamp: new Date().toISOString()
            });
        }
    });

    estadoAnteriorActuadores = estadoNuevo;
}

// ==========================================
// MANEJO DE SALAS
// ==========================================
function suscribirSala(sala) {
    // Desuscribirse de la sala anterior
    cliente.unsubscribe(`monart/+/+/sensores/#`);
    cliente.unsubscribe(`monart/+/sistema/notificaciones`);
    cliente.unsubscribe(`monart/+/actuadores/estado`);

    // Suscribirse a la nueva sala
    cliente.subscribe(`monart/${sala}/+/sensores/#`);
    cliente.subscribe(`monart/${sala}/sistema/notificaciones`);
    cliente.subscribe(`monart/${sala}/actuadores/estado`);

    console.log(`📡 Suscrito a sala: ${sala}`);
}

function cambiarSala(sala) {
    salaActual = sala;
    estadoAnteriorActuadores = null;

    // Limpiar lecturas actuales
    document.getElementById('valor-temp').innerText = '-- °C';
    document.getElementById('valor-hum').innerText = '-- %';
    document.getElementById('valor-luz').innerText = '-- lx';
    document.getElementById('valor-uv').innerText = '--';

    // Limpiar estados de actuadores
    ['minisplit','deshumidificador','humidificador','persiana','dimmer'].forEach(d => {
        document.getElementById(`estado-${d}`).innerText = 'Último: Ninguno';
    });

    suscribirSala(sala);
    mostrarNotificacion({
        tipo: 'sistema',
        origen: 'frontend',
        evento: 'online',
        mensaje: `🏛️ Cambiado a ${sala}`,
        timestamp: new Date().toISOString()
    });
}

function agregarSala() {
    const nombre = prompt('Nombre de la nueva sala (ej: SALA-2):');
    if (!nombre || salasConocidas.includes(nombre)) return;

    salasConocidas.push(nombre);

    const select = document.getElementById('sala-select');
    const option = document.createElement('option');
    option.value = nombre;
    option.innerText = nombre;
    select.appendChild(option);
    select.value = nombre;

    cambiarSala(nombre);
}