class Actuador {
    constructor(id) {
        this.id = id;
        this.estado = false; // false = apagado, true = encendido
    }

    // Método abstracto para recibir comandos
    ejecutar(accion) {
        throw new Error("El método ejecutar() debe ser implementado por la subclase");
    }
}

module.exports = Actuador;