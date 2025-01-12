const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isLoggedIn } = require('../middlewares/authMiddleware');


// Kullanıcıları Listeleme
router.get('/', (req, res) => {
    db.query('SELECT * FROM Kullanicilar', (err, results) => {
        if (err) throw err;
        res.render('users', { users: results });
    });
});

// Kullanıcı Ekleme Formu
router.get('/add', (req, res) => {
    res.render('addUser');
});

// Kullanıcı Ekleme İşlemi
router.post('/add', (req, res) => {
    const { AdSoyad, TelefonNumarasi, Eposta } = req.body;
    db.query(
        'INSERT INTO Kullanicilar (AdSoyad, TelefonNumarasi, Eposta) VALUES (?, ?, ?)',
        [AdSoyad, TelefonNumarasi, Eposta],
        (err) => {
            if (err) throw err;
            res.redirect('/users');
        }
    );
});

// Kullanıcı Düzenleme Formunu Getirme Rotası
router.get('/edit/:id', (req, res) => {
    const KullaniciID = req.params.id; // URL'den ID al
    db.query('SELECT * FROM Kullanicilar WHERE KullaniciID = ?', [KullaniciID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Kullanıcı düzenleme sayfası yüklenirken bir hata oluştu.');
        } else if (results.length === 0) {
            res.status(404).send('Kullanıcı bulunamadı.');
        } else {
            res.render('editUser', { user: results[0] }); // Kullanıcı verisini düzenleme sayfasına gönder
        }
    });
});


// Kullanıcı Düzenleme İşlemini Kaydetme Rotası
router.post('/edit/:id', (req, res) => {
    const KullaniciID = req.params.id;
    const { AdSoyad, TelefonNumarasi, Eposta } = req.body;
    db.query(
        'UPDATE Kullanicilar SET AdSoyad = ?, TelefonNumarasi = ?, Eposta = ? WHERE KullaniciID = ?',
        [AdSoyad, TelefonNumarasi, Eposta, KullaniciID],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Kullanıcı güncellenirken bir hata oluştu.');
            } else {
                res.redirect('/users'); // Başarılı olursa kullanıcı listeleme sayfasına yönlendir
            }
        }
    );
});



// Kullanıcı Silme İşlemi
router.get('/delete/:id', (req, res) => {
    const KullaniciID = req.params.id; // ID'yi parametreden al
    db.query('DELETE FROM Kullanicilar WHERE KullaniciID = ?', [KullaniciID], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Kullanıcı silinirken bir hata oluştu');
        } else {
            res.redirect('/users'); // Başarılı olursa kullanıcıları listeleme sayfasına yönlendir
        }
    });
});


module.exports = router;
