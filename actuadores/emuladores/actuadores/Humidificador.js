const Actuador = require('./Actuador');

class Humidificador extends Actuador {
    constructor(id) {
        // Llama al constructor del padre pasándole el ID, el Tipo fijo y su tópico
        super(id, 'Humidificador');
    }

    // Sobrescribimos la función ejecutar para darle personalidad en la consola
    ejecutar(accion, parametros) {
        // Cambiamos el estado interno usando la lógica del padre
        super.ejecutar(accion, parametros);

        if (accion === 'encender') {
            console.log(`[${this.id}]  Inyectando vapor de agua al ambiente...`);
        } else {
            console.log(`[${this.id}]  Inyección de vapor detenida.`);
        }
    }
}

module.exports = Humidificador;