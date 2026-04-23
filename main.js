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
const cliente = mqtt.connect('ws://127.0.0.1:8083/mqtt');

cliente.on('connect', () => {
    document.getElementById('estado-conexion').innerText = '✅ Conectado a EMQX';
    document.getElementById('estado-conexion').style.color = '#00b894';
    cliente.subscribe('monart/SALA-1/+/sensores/#');
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

    cliente.publish(`monart/SALA-1/oleo/actuadores/${dispositivo}`, JSON.stringify(comando));
    
    let textoAccion = accion === 'encender' || accion === 'abrir' ? '🟢 ' + accion.toUpperCase() : '🔴 ' + accion.toUpperCase();
    document.getElementById(`estado-${dispositivo}`).innerText = `Último: ${textoAccion}`;
}