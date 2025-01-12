const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database');

// Giriş formunu göster
router.get('/', (req, res) => {
    res.render('login');
});

// Giriş işlemi
router.post('/', (req, res) => {
    const { KullaniciAdi, Sifre } = req.body;

    const query = 'SELECT * FROM Admin WHERE KullaniciAdi = ?';
    db.query(query, [KullaniciAdi], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Bir hata oluştu.');
        }

        if (results.length === 0) {
            return res.status(401).send('Kullanıcı adı veya şifre hatalı.');
        }

        const admin = results[0];

        // Şifreyi karşılaştır
        bcrypt.compare(Sifre, admin.Sifre, (err, isMatch) => {
            if (err) {
                console.error('Şifre kontrolü sırasında hata:', err);
                return res.status(500).send('Bir hata oluştu.');
            }

            if (!isMatch) {
                return res.status(401).send('Kullanıcı adı veya şifre hatalı.');
            }

            // Başarılı giriş
            req.session.isLoggedIn = true;
            req.session.admin = admin;
            res.redirect('/');
        });
    });
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Örnek admin bilgileri
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    if (username === adminUsername && password === adminPassword) {
        req.session.username = username; // Oturuma kullanıcı adını kaydedin
        res.redirect('/index'); // Başarılı giriş sonrası yönlendirme
    } else {
        res.render('login', { error: 'Hatalı kullanıcı adı veya şifre!' });
    }
});

module.exports = router;
