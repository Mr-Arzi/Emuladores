class Sensor {
    constructor(id, tipo) {
        this.id = id;
        this.tipo = tipo;
        this.valor = 0.0;
    }

    // Simulamos un método abstracto. Si una clase hija no lo implementa, falla.
    generarDato() {
        throw new Error("El método generarDato() debe ser implementado por la subclase");
    }
}

module.exports = Sensor;