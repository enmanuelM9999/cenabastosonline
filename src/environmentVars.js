let vars = {};

//Cloudinary
vars.cloud_name = "megaplaza";
vars.api_key = "285948645386645";
vars.api_secret = "jnUx51Ko0Ydj5ga-sjUcQ8pjHKk";

//Base de datos MySql
vars.db_host = "us-cdbr-east-02.cleardb.com";
vars.db_user = "b06f9d7ccd8273";
vars.db_password = "fc8a24f5";
vars.db_database = "heroku_e3aadcc48115b0c";

//Email Nodemailer
vars.email_host = "mail.privateemail.com";
vars.email_port = 587;
vars.email_secure = false;
vars.email_user = "cenabastosonline@polaru.xyz";
vars.email_pass = "cenabastosemail";
vars.email_rejectUnauthorized = false;

//Email Nodemailer
vars.nodemailerConfig = {
    host: vars.email_host,
    port: vars.email_port,
    secure: vars.email_secure,
    auth: {
        user: vars.email_user,
        pass: vars.email_pass
    },
    tls: {
        rejectUnauthorized: vars.email_rejectUnauthorized
    }
};

//Sin clasificar
vars.defaultNotificationsImage=97; //pkIdImagen de la base de datos, contiene el id de na imagen de una campana

module.exports = vars;
