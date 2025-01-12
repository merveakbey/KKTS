const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database'); // Veritabanı bağlantısı

// Admin giriş sayfasını render et
router.get('/login', (req, res) => {
    res.render('login'); // views/login.ejs dosyasını render eder
});

// Admin giriş işlemi
router.post('/login', (req, res) => {
    const { KullaniciAdi, Sifre } = req.body;

    // Form verilerinin boş olup olmadığını kontrol edin
    if (!KullaniciAdi || !Sifre) {
        return res.status(400).send('Kullanıcı adı veya şifre eksik.');
    }

    // Veritabanında admin kontrolü
    db.query('SELECT * FROM Admin WHERE KullaniciAdi = ?', [KullaniciAdi], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Sunucu hatası.');
        }

        if (results.length === 0) {
            return res.status(401).send('Kullanıcı adı veya şifre hatalı.');
        }

        const admin = results[0];

        // Şifre karşılaştırma
        const isMatch = await bcrypt.compare(Sifre, admin.Sifre);
        if (!isMatch) {
            return res.status(401).send('Kullanıcı adı veya şifre hatalı.');
        }

        // Oturum başlat
        req.session.user = { id: admin.AdminID, username: admin.KullaniciAdi };
        res.redirect('/dashboard'); // Başarılı giriş sonrası dashboard'a yönlendirme
    });
});

// Admin çıkış işlemi
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Çıkış yapılamadı.');
        }
        res.redirect('/login'); // Çıkış sonrası login sayfasına yönlendirme
    });
});

module.exports = router;
