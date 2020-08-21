var clave = {};
const pool = require("../database");

clave.recuperarClave = async (correoUsuario) => {
    try {

        //¿Ya existe un usuario para ese correo?
        const rowsUsuario = await pool.query('SELECT pkIdUsuario,correoUsuario FROM usuario WHERE correoUsuario = ?', [correoUsuario]);
        //Si la consulta arrojó 1 resultado...
        if (rowsUsuario.length != 1) {
            throw new Error("Ya existe un usuario asignados a este correo");
        }

        const usuario = rowsUsuario[0];
        //Consultar si los correos coinciden
        if (usuario.correoUsuario != correoUsuario) {
            throw new Error("Los correos no coinciden");
        }

        //Correos coinciden, crear nuvea clave
        const nuevaClave = Math.random().toString(36).substring(7);

        //Actualizar clave
        await pool.query('UPDATE usuario SET claveUsuario = (aes_encrypt("' + nuevaClave + '","' + nuevaClave + '")) WHERE pkIdUsuario=' + usuario.pkIdUsuario + ';');

        //Enviar correo con la clave
        contentHTML = `
        <h1>Apreciado usuario, su nueva clave es</h1>
        <p>${nuevaClave}</p>
        `;

        //Configurar Emisor
        let transporter = nodemailer.createTransport({
            host: 'mail.lamegaplaza.com',
            port: 587,
            secure: false,
            auth: {
            user: 'prami@lamegaplaza.com',
            pass: 'pramipassprami'
            },
            tls: {
            rejectUnauthorized: false
            }
        });

        //configurar Receptor
        let info = await transporter.sendMail({
            from: '"Prami" <prami@lamegaplaza.com>', // sender address,
            to: email,
            subject: 'Recuperar contraseña',
            // text: 'Contenido'
            html: contentHTML   
        })

        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        return {error:false};

    } catch (error) {
        return {error:true, msg:error.message}
        console.log(error);
    }
}

module.exports = clave;