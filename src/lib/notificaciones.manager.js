let notificacionesManager = {};
const pool = require("../database");
const { nodemailerConfig } = require("../environmentVars");
const nodemailer = require("nodemailer");

notificacionesManager.notificarComerciante = async (comerciante, titulo, descripcion, idImagen, ruta, hora, correoUsuario, enviarCorreo) => {
    try {
        //Insert en la tabla
        const newNotificacion = {
            fkIdComerciante: comerciante,
            titulo: titulo,
            descripcion: descripcion,
            fkIdImagen: idImagen,
            rutaRedireccionamiento: ruta,
            fechaHoraNotificacionCliente: hora
        };
        await pool.query("INSERT INTO notificacioncomerciante SET ?", [newNotificacion]);

        //Envie un correo
        if (enviarCorreo) {

            contentHTML = `
            <h1>${titulo}</h1>
            <p>${descripcion}</p>`;

            //Configurar Emisor
            let transporter = nodemailer.createTransport(nodemailerConfig);

            //configurar Receptor
            let info = await transporter.sendMail({
                from: '"Cenabastos P.H." ' + nodemailerConfig.email_user, // sender address,
                to: correoUsuario,
                subject: titulo,
                // text: 'Contenido'
                html: contentHTML
            })

            console.log('Message sent: %s', info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        }
        return { error: false };
    } catch (error) {
        return { error: true };
    }
};

notificacionesManager.notificarCliente = async (cliente, titulo, descripcion, idImagen, ruta, hora, correoUsuario, enviarCorreo) => {
    try {
        //Insert en la tabla
        const newNotificacion = {
            fkIdCliente: cliente,
            titulo: titulo,
            descripcion: descripcion,
            fkIdImagen: idImagen,
            rutaRedireccionamiento: ruta,
            fechaHoraNotificacionCliente: hora
        };
        await pool.query("INSERT INTO notificacioncliente SET ?", [newNotificacion]);

        //Envie un correo
        if (enviarCorreo) {

            contentHTML = `
            <h1>${titulo}</h1>
            <p>${descripcion}</p>
            `;

            //Configurar Emisor
            let transporter = nodemailer.createTransport(nodemailerConfig);

            //configurar Receptor
            let info = await transporter.sendMail({
                from: '"Cenabastos P.H." ' + nodemailerConfig.email_user, // sender address,
                to: correoUsuario,
                subject: titulo,
                // text: 'Contenido'
                html: contentHTML
            })

            console.log('Message sent: %s', info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        }
        return { error: false };
    } catch (error) {
        return { error: true };
    }
};

notificacionesManager.notificarAdmin = async (titulo, descripcion, correoUsuario) => {
    try {
        //Envie un correo
        contentHTML = `
            <h1>${titulo}</h1>
            <p>${descripcion}</p>
            `;

        //Configurar Emisor
        let transporter = nodemailer.createTransport(nodemailerConfig);

        //configurar Receptor
        let info = await transporter.sendMail({
            from: '"Cenabastos P.H." ' + email_user, // sender address,
            to: correoUsuario,
            subject: titulo,
            // text: 'Contenido'
            html: contentHTML
        })

        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        return { error: false };

    } catch (error) {

    }
};

module.exports = notificacionesManager;