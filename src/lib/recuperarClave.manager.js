let clave = {};
const pool = require("../database");
const { email_host, email_port, email_secure, email_user, email_pass, email_rejectUnauthorized } = require("../environmentVars");
const nodemailer=require("nodemailer");
clave.recuperarClave = async (correoUsuario) => {
    try {

        //¿Ya existe un usuario para ese correo?
        const rowsUsuario = await pool.query('SELECT pkIdUsuario,correoUsuario FROM usuario WHERE correoUsuario = ?', [correoUsuario]);
        //Si la consulta arrojó 1 resultado...
        if (rowsUsuario.length != 1) {
            throw new Error("No se encontró el usuario");
        }

        const usuario = rowsUsuario[0];
        //Consultar si los correos coinciden
        if (usuario.correoUsuario != correoUsuario) {
            throw new Error("Los correos no coinciden");
        }
        //console.log("bd ",rowsUsuario[0].correoUsuario," input ",correoUsuario );

        //Correos coinciden, crear nuvea clave
        const nuevaClave = Math.random().toString(36).substring(7);
        //console.log("la nueva clave es ", nuevaClave);

        //Actualizar clave
        await pool.query('UPDATE usuario SET claveUsuario = (aes_encrypt("' + nuevaClave + '","' + nuevaClave + '")) WHERE pkIdUsuario=' + usuario.pkIdUsuario + ';');

        //Enviar correo con la clave
        contentHTML = `
        <h1>Apreciado usuario, su nueva clave es</h1>
        <p>${nuevaClave}</p>
        `;

        //Configurar Emisor
        let config={
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
        }
        //console.log("config ",config);
        let transporter = nodemailer.createTransport(config);
        
        
        //configurar Receptor
        let info = await transporter.sendMail({
            from: '"Cenabastos P.H." <' + email_user + '>', // sender address,
            to: correoUsuario,
            subject: 'Recuperar contraseña',
            // text: 'Contenido'
            html: contentHTML
        })

        console.log('el mensaje enviado fue. ', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        //console.log("12345");
        return { error: false };

    } catch (error) {
        console.log(error);
        return { error: true, msg: error.message }
    }
}

module.exports = clave;