const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Remplacez par votre utilisateur MySQL
    password: '', // Remplacez par votre mot de passe MySQL
    database: 'salle_jeux',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();