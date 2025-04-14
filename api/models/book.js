const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

class Book {
    static async getAllBooks() {
        const result = await pool.query('SELECT * FROM books');
        return result.rows;
    }

    static async getBookById(id) {
        const result = await pool.query(
            'SELECT * FROM books WHERE id = $1', 
            [id]
        )
        return result.rows[0]
    }

    static async createBook({ title, author, year }) {
        const result = await pool.query(
            'INSERT INTO books (title, author, year) VALUES ($1, $2, $3) RETURNING *',
            [title, author, year]
        )
        return result.rows[0]
    }

    static async updateBook(id, {title, author, year}) {
        const result = await pool.query(
            'UPDATE books SET title = $1, author = $2, year = $3 WHERE id = $4 RETURNING * ',
            [title, author, year, id]
        )
    }

    static async deleteBook(id) {
        await pool.query('DELETE FROM books WHERE id = $1', [id]);
    }
}

module.exports = Book;