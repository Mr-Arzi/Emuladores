# PC 3: EMQX Broker

## Instalación rápida

### Opción A — Docker (recomendada)
```bash
docker run -d --name emqx \
  -p 1883:1883 \
  -p 8083:8083 \
  -p 18083:18083 \
  emqx/emqx:latest
```

### Opción B — Instalación directa (Ubuntu/Debian)
```bash
curl -s https://assets.emqx.com/scripts/install-emqx-deb.sh | sudo bash
sudo systemctl start emqx
sudo systemctl enable emqx
```

## Puertos que deben estar abiertos en la red

| Puerto | Protocolo | Usado por |
|--------|-----------|-----------|
| 1883   | MQTT TCP  | Sensores y Actuadores (Node.js) |
| 8083   | MQTT WebSocket | Frontend (navegador) |
| 18083  | HTTP Dashboard | Panel admin EMQX (opcional) |

## Verificar que funciona
- Panel web EMQX: http://IP-DE-ESTA-PC:18083
  - Usuario: `admin` / Contraseña: `public` (primera vez)
- O probar con: `mosquitto_pub -h localhost -t test/ping -m hola`

## Importante
Anota la IP de esta computadora (ej. `192.168.1.100`).
Deberás ponerla en el archivo `.env` de las PCs de sensores y actuadores,
y en `main.js` del frontend.
