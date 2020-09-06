let notificacionesManager = {};
const pool = require("../database");
const {email_host, email_port, email_secure, email_user, email_pass, email_rejectUnauthorized} = require("../environmentVars");
const nodemailer= require("nodemailer");

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
                let transporter = nodemailer.createTransport({
                    host: email_host,
                    port: email_port,
                    secure: email_secure,
                    auth: {
                        user: email_user,
                        pass: email_pass
                    },
                    tls: {
                        rejectUnauthorized: email_rejectUnauthorized
                    }
                });

                //configurar Receptor
                let info = await transporter.sendMail({
                    from: '"Prami" '+email_user, // sender address,
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
        }
    } catch (error) {

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
                let transporter = nodemailer.createTransport({
                    host: email_host,
                    port: email_port,
                    secure: email_secure,
                    auth: {
                        user: email_user,
                        pass: email_pass
                    },
                    tls: {
                        rejectUnauthorized: email_rejectUnauthorized
                    }
                });

                //configurar Receptor
                let info = await transporter.sendMail({
                    from: '"Prami" '+email_user, // sender address,
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
        }
    } catch (error) {

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
                let transporter = nodemailer.createTransport({
                    host: email_host,
                    port: email_port,
                    secure: email_secure,
                    auth: {
                        user: email_user,
                        pass: email_pass
                    },
                    tls: {
                        rejectUnauthorized: email_rejectUnauthorized
                    }
                });

                //configurar Receptor
                let info = await transporter.sendMail({
                    from: '"Prami" '+email_user, // sender address,
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