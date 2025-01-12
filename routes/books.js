const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isLoggedIn } = require('../middlewares/authMiddleware'); // Middleware'i dahil edin

// Kitapları Listeleme Rotası
router.get('/', (req, res) => {
    db.query('SELECT * FROM Kitaplar', (err, results) => {
        if (err) throw err;
        res.render('books', { books: results });
    });
});

// Kitap Ekleme Formu Getirme
router.get('/add', (req, res) => {
    db.query('SELECT * FROM Kategoriler', (err, categories) => {
        if (err) {
            console.error('Kategoriler alınırken hata oluştu:', err);
            return res.status(500).send('Kategoriler alınamadı.');
        }
        res.render('addBook', { categories });
    });
});

// Kitap Ekleme İşlemi
router.post('/add', (req, res) => {
    const { KitapAdi, Yazar, KategoriID, YayinTarihi, StokDurumu } = req.body;

    db.query(
        'INSERT INTO Kitaplar (KitapAdi, Yazar, KategoriID, YayinTarihi, StokDurumu) VALUES (?, ?, ?, ?, ?)',
        [KitapAdi, Yazar, KategoriID, YayinTarihi || null, StokDurumu],
        (err) => {
            if (err) {
                console.error('Kitap ekleme sırasında hata oluştu:', err);
                return res.status(500).send('Kitap eklenemedi!');
            }
            res.redirect('/books'); // Kitaplar sayfasına yönlendirme
        }
    );
});

// Kitap Düzenleme Formunu Getirme
router.get('/edit/:id', (req, res) => {
    const KitapID = req.params.id;

    db.query('SELECT * FROM Kitaplar WHERE KitapID = ?', [KitapID], (err, bookResults) => {
        if (err) {
            console.error('Kitap bilgileri alınırken hata oluştu:', err);
            return res.status(500).send('Kitap bilgileri alınamadı.');
        }

        db.query('SELECT * FROM Kategoriler', (err, categories) => {
            if (err) {
                console.error('Kategoriler alınırken hata oluştu:', err);
                return res.status(500).send('Kategoriler alınamadı.');
            }

            res.render('editBook', { book: bookResults[0], categories });
        });
    });
});

// Kitap Düzenleme İşlemi
router.post('/edit/:id', (req, res) => {
    const KitapID = req.params.id;
    const { KitapAdi, Yazar, KategoriID, YayinTarihi, StokDurumu } = req.body;

    db.query(
        'UPDATE Kitaplar SET KitapAdi = ?, Yazar = ?, KategoriID = ?, YayinTarihi = ?, StokDurumu = ? WHERE KitapID = ?',
        [KitapAdi, Yazar, KategoriID, YayinTarihi || null, StokDurumu, KitapID],
        (err) => {
            if (err) {
                console.error('Kitap düzenleme sırasında hata oluştu:', err);
                return res.status(500).send('Kitap düzenlenemedi!');
            }
            res.redirect('/books');
        }
    );
});

// Kitap Silme Rotası
router.get('/delete/:id', (req, res) => {
    const KitapID = req.params.id;

    db.query('DELETE FROM Kitaplar WHERE KitapID = ?', [KitapID], (err) => {
        if (err) {
            console.error('Kitap silme sırasında hata oluştu:', err);
            return res.status(500).send('Kitap silinemedi!');
        }
        res.redirect('/books');
    });
});

module.exports = router;
