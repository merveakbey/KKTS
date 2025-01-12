const mysql = require('mysql2');

// MySQL bağlantısı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'merve2004', // MySQL şifrenizi yazın
    database: 'kkts_db',
});

// Bağlantıyı kontrol et
db.connect(err => {
    if (err) {
        console.error('MySQL bağlantı hatası:', err);
    } else {
        console.log('MySQL veritabanına başarıyla bağlandı.');
    }
});

module.exports = db;
