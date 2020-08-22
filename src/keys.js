const{db_host,db_user,db_password,db_database} =require("./environmentVars");
module.exports = {

    database: {
        connectionLimit: 10,
        host: db_host,
        user: db_user,
        password: db_password,
        database: db_database
    }

};
