require('dotenv').config();

const mysql = require('mysql');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const main = async () => {
    let connection;

    try {
        connection = mysql.createConnection(dbConfig);

        connection.connect();

        console.log('Borrando tablas...');

        // El orden inverso de eliminación para evitar conflictos de clave externa
        await connection.query('DROP TABLE IF EXISTS messages');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query('DROP TABLE IF EXISTS roles');

        console.log('Creando tablas...');

        // Crear primero las tablas de roles
        await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(5) NOT NULL
      );
    `);

        await connection.query(`
      INSERT INTO roles (name) VALUES
        ('admin'),
        ('user');
    `);

        // Luego, crear la tabla de usuarios
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(45) NOT NULL,
        lastName VARCHAR(45) DEFAULT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        email VARCHAR(150) NOT NULL,
        password VARCHAR(150) NOT NULL,
        roleId INT NOT NULL,
        img VARCHAR(150) NOT NULL,
        FOREIGN KEY (roleId) REFERENCES roles(id)
      );
    `);

        // Finalmente, crear la tabla de mensajes
        await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content VARCHAR(450) NOT NULL,
        userId INT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT current_timestamp(),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

        console.log('¡Tablas creadas!');
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) connection.end();
        process.exit();
    }
};

main();
