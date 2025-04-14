CREATE DATABASE library;

\c library;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    year INT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password) VALUES
('admin', '$2b$10$M.kMPH9UXH67itfHTUcrIOJgyRxXaH2RtciXMKmK6m.TfQX/S68d2'),
-- admin, password123

INSERT INTO books (title, author, year) VALUES
('Le Petit Prince', 'Antoine de Saint-Exupéry', 1943),
('1984', 'George Orwell', 1949),
('Les Misérables', 'Victor Hugo', 1862),
('Harry Potter à l\'école des sorciers', 'J.K. Rowling', 1997),
('Le Seigneur des Anneaux', 'J.R.R. Tolkien', 1954);