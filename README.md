# MONART — Despliegue en 4 Computadoras

## Arquitectura

```
PC 1: Sensores        PC 3: EMQX (broker)       PC 4: Frontend
  node index.js  ──►  :1883 (MQTT TCP)      ◄──  index.html + main.js
                       :8083 (WebSocket)
PC 2: Actuadores ──►  :1883 (MQTT TCP)
  node index.js
```

El flujo es:
1. **Sensores** publican lecturas cada 5s en `monart/SALA-1/oleo/sensores/*`
2. **Frontend** se suscribe a esos tópicos vía WebSocket y muestra el dashboard
3. **Frontend** publica órdenes a `monart/SALA-1/oleo/actuadores/*`
4. **Actuadores** reciben las órdenes, las ejecutan y publican el nuevo estado en `monart/SALA-1/actuadores/estado`
5. **Sensores** se suscriben a ese tópico de estado para ajustar la simulación física

---

## Paso 1 — PC 3: Levantar EMQX primero

```bash
# Con Docker:
docker run -d --name emqx -p 1883:1883 -p 8083:8083 -p 18083:18083 emqx/emqx:latest
```

Anota la IP de esta máquina, la necesitarás en los otros nodos.
Ver instrucciones completas en: `emqx/README.md`

---

## Paso 2 — PC 1: Nodo de Sensores

```bash
cd sensores
npm install

# Edita .env con la IP de la PC donde está EMQX:
# MQTT_HOST=mqtt://192.168.1.100
# MQTT_PORT=1883

npm start
```

---

## Paso 3 — PC 2: Nodo de Actuadores

```bash
cd actuadores
npm install

# Edita .env con la IP de la PC donde está EMQX:
# MQTT_HOST=mqtt://192.168.1.100
# MQTT_PORT=1883

npm start
```

---

## Paso 4 — PC 4: Frontend

```bash
cd frontend
npm install

# Edita main.js y cambia la IP de EMQX:
# const EMQX_IP = '192.168.1.100';   ← línea ~50

npm start
# Abre el navegador en: http://localhost:8080
```

---

## Tópicos MQTT de referencia

| Tópico | Dirección | Descripción |
|--------|-----------|-------------|
| `monart/SALA-1/oleo/sensores/temperatura` | Sensores → todos | Lectura de temperatura |
| `monart/SALA-1/oleo/sensores/humedad`     | Sensores → todos | Lectura de humedad |
| `monart/SALA-1/oleo/sensores/luz`         | Sensores → todos | Lectura de luz |
| `monart/SALA-1/oleo/sensores/uv`          | Sensores → todos | Lectura UV |
| `monart/SALA-1/oleo/actuadores/minisplit` | Front → Actuadores | Orden al minisplit |
| `monart/SALA-1/oleo/actuadores/deshumidificador` | Front → Actuadores | Orden al deshumidificador |
| `monart/SALA-1/oleo/actuadores/humidificador` | Front → Actuadores | Orden al humidificador |
| `monart/SALA-1/oleo/actuadores/persiana`  | Front → Actuadores | Orden a la persiana |
| `monart/SALA-1/oleo/actuadores/dimmer`    | Front → Actuadores | Orden al dimmer |
| `monart/SALA-1/actuadores/estado`         | Actuadores → Sensores | Estado actual de actuadores |

---

## Cambio clave respecto al código original

En el código original, sensores y actuadores compartían el objeto `ambiente` en memoria.
Al separarlos, el nodo de **actuadores** publica su estado en el tópico `monart/SALA-1/actuadores/estado`
cada vez que recibe una orden. El nodo de **sensores** se suscribe a ese tópico y actualiza
su propio objeto `ambiente` local para mantener la simulación física correcta.
