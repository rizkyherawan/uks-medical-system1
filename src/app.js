const path = require('path');
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ------------------------------------------------------------
// KONEKSI BACKEND <-> FRONTEND
// 1) express.static: folder /public (HTML, CSS, JS) disajikan langsung
//    oleh Express, jadi frontend & API satu alamat: http://localhost:PORT
// 2) cors: tetap diaktifkan supaya frontend juga bisa dibuka dari
//    Live Server (port 5500) dan memanggil API di port 3000.
// ------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Semua endpoint API diawali /api
app.use('/api', routes);
app.use('/api', notFound);

app.use(errorHandler);

module.exports = app;
