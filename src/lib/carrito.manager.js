var carrito = {};
const pool = require("../database");

carrito.crearCarrito = async (fkIdCliente) => {
    try {
        const newCarrito = {
            contadorItems: 0,
            fkIdCliente,
        }
        await pool.query("INSERT INTO carrito SET ?", [newCarrito]);

    } catch (error) {
        console.log(error);
    }
}

carrito.agregarItemCarrito = async (fkIdCarrito, fkIdPresentacion, detallesCarrito, cantidadItem) => {
    try {
        const newItemCarrito = {
            fkIdCarrito, fkIdPresentacion, detallesCarrito, cantidadItem
        };
        await pool.query("INSERT INTO itemcarrito SET ?", [newItemCarrito]);
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = carrito;