var carrito = {};
const pool = require("../database");

carrito.crearCarrito = async (fkIdCliente) => {
    try {
        //¿Ya existe un carrito para ese cliente? Si ya existe
        const rowsCarrito = await pool.query("SELECT pkIdCarrito FROM carrito WHERE fkIdCliente=?", [fkIdCliente]);
        if (rowsCarrito.length != 0) {
            throw new Error("ca1-Existen 1 o más carritos asociados a ese cliente"); //(Se entiende que no existe carrito, no se valida la posibilidad de que el cliente no exista)
        }
        //Crear carrito
        const newCarrito = {
            contadorItems: 0,
            fkIdCliente,
        }
        await pool.query("INSERT INTO carrito SET ?", [newCarrito]);
    } catch (error) {
        console.log(error);
    }
}

carrito.agregarItemCarrito = async (pkIdUsuario, fkIdLocalComercial, fkIdPresentacion, detallesCarrito, cantidadItem) => {
    try {
        //¿El item a agregar es de un local diferente a los items que ya están?
        var rowCarrito = await pool.query("SELECT pkIdCarrito,contadorItems,fkIdLocalSeleccionado FROM carrito WHERE fkIdCliente=?", [pkIdUsuario]);
        if (rowCarrito.length == 0) {
            throw new Error("ca2-No hay creado un carrito para el usuario");
        }
        if (rowCarrito.length != 1) {
            throw new Error("ca3-No hay 1 solo carrito para el usuario " + pkIdUsuario + ", posiblemente se manipuló la BD manualmente");
        }
        if (rowCarrito[0].fkIdLocalSeleccionado != fkIdLocalComercial && rowCarrito[0].contadorItems > 0) {
            throw new Error("ca4-Se intenta agregar un item de una tienda diferente. Debe pedir en una sola tienda a la vez ");//Advertir que debe pedir en una tienda a la vez hasta que sea posible pedir en varias
        }
        //¿El item está repetido?
        const rowItemRepetido = await pool.query("SELECT itemcarrito.pkIdItemCarrito FROM itemcarrito INNER JOIN carrito ON carrito.pkIdCarrito=itemcarrito.fkIdCarrito WHERE carrito.fkIdCliente=? AND itemcarrito.fkIdPresentacion", [pkIdUsuario]);
        if (rowItemRepetido.length > 0) {
            throw new Error("ca5-Posiblemente el item está repetido, para modificarlo vaya al carrito");
        }
        //Agregar el item al carro
        const newItemCarrito = {
            fkIdCarrito: rowCarrito[0].pkIdCarrito, fkIdPresentacion, detallesCarrito, cantidadItem
        };
        await pool.query("INSERT INTO itemcarrito SET ?", [newItemCarrito]);

        //actuaizar el carrito
        if (rowCarrito[0].contadorItems == 0) { //Si es el primer item del carrito, se debe seleccionar el local
            rowCarrito[0].fkIdLocalSeleccionado = fkIdLocalComercial;
        }

        rowCarrito[0].contadorItems++;
        var newCarrito = {
            contadorItems: rowCarrito[0].contadorItems,
            fkIdLocalSeleccionado: rowCarrito[0].fkIdLocalSeleccionado
        };
        await pool.query("UPDATE carrito SET ? WHERE fkIdCliente=?", [newCarrito, pkIdUsuario]);
    } catch (error) {
        console.log(error);
    }
}

carrito.getLengthCarrito = async (idCliente) => {
    try {
        var rowCarrito = await pool.query("SELECT contadorItems FROM carrito WHERE fkIdCliente=?", [idCliente]);
        if (rowCarrito.length != 1) {
            throw new Error("ca6-No existe carrito o existe más de 1 carrito asociado al cliente");
        }

        if (rowCarrito[0].contadorItems == 0) {
            rowCarrito[0].contadorItems = "";
        }
        return rowCarrito[0].contadorItems;
    } catch (error) {
        console.log(error);
    }
}

carrito.vaciarCarrito = async (idCliente) => {
    try {
        //borrar todos los items
        await pool.query("DELETE ic FROM itemcarrito ic INNER JOIN carrito ON carrito.pkIdCarrito=itemcarrito.fkIdCarrito WHERE carrito.fkIdCliente=?", [idCliente]);
        //actualizar el carrito
        var newCarrito = {
            contadorItems: 0,
            fkIdLocalSeleccionado: null
        };
        await pool.query("UPDATE carrito SET ? WHERE fkIdCliente=?", [newCarrito, idCliente]);
    } catch (error) {
        console.log(error);
    }
}

carrito.borrarItemCarrito = async (idCliente, pkIdItemCarrito) => {
    try {
        //obtener el carrito
        const rowCarrito = await pool.query("SELECT carrito.contadorItems, carrito.fkIdLocalSeleccionado FROM carrito INNER JOIN itemcarrito ON itemcarrito.fkIdCarrito=carrito.pkIdCarrito WHERE itemcarrito.pkIdItemCarrito=?", [pkIdItemCarrito]);
        if (rowCarrito.length != 1) {
            throw new Error("ca7-No existe carrito o existe más de 1 carrito asociado al cliente");
        }
        var contItems = rowCarrito[0].contadorItems;
        var localSeleccionado = rowCarrito[0].fkIdLocalSeleccionado;

        if (contItems == 0) {
            throw new Error("ca8-El carrito está vacío.");
        }
        //borrar el item
        await pool.query("DELETE ic FROM itemcarrito ic INNER JOIN carrito ON carrito.pkIdCarrito=itemcarrito.fkIdCarrito WHERE carrito.fkIdCliente=? AND ic.pkIdItemCarrito=?", [idCliente, pkIdItemCarrito]);
        //actuaizar el carrito
        contItems--;
        if (contItems == 0) {
            localSeleccionado = null;
        }
        var newCarrito = {
            contadorItems: contItems,
            fkIdLocalSeleccionado: localSeleccionado
        };
        await pool.query("UPDATE carrito SET ? WHERE fkIdCliente=?", [newCarrito, idCliente]);
    } catch (error) {
        console.log(error);
    }
}

module.exports = carrito;