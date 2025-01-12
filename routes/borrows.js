const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isLoggedIn } = require('../middlewares/authMiddleware'); // Middleware'i dahil edin



// Ödünç İşlemlerini Listeleme Rotası
router.get('/', (req, res) => {
    db.query(
        `SELECT 
        OduncAlma.IslemID, 
        Kullanicilar.AdSoyad, 
        Kitaplar.KitapAdi, 
        OduncAlma.AlisTarihi, 
        OduncAlma.IadeTarihi, 
        IFNULL(gecikmeCezasiHesapla(OduncAlma.AlisTarihi, OduncAlma.IadeTarihi), 0) AS GecikmeCezasi
    FROM OduncAlma
    INNER JOIN Kullanicilar ON OduncAlma.KullaniciID = Kullanicilar.KullaniciID
    INNER JOIN Kitaplar ON OduncAlma.KitapID = Kitaplar.KitapID;`,
        (err, results) => {
            if (err) {
                console.error('Ödünç işlemleri alınırken hata oluştu:', err);
                return res.status(500).send('Ödünç işlemleri alınamadı.');
            }

            res.render('borrows', { borrows: results });
        }
    );
});

// Ödünç Alma Ekleme Formunu Getirme Rotası
router.get('/add', (req, res) => {
    db.query('SELECT * FROM Kullanicilar', (err, users) => {
        if (err) throw err;
        db.query('SELECT * FROM Kitaplar WHERE StokDurumu > 0', (err, books) => {
            if (err) throw err;
            res.render('addBorrow', { users, books });
        });
    });
});

// Ödünç Alma İşlemi
router.post('/add', (req, res) => {
    const { KullaniciID, KitapID } = req.body;
    const today = new Date();
    const iadeTarihi = new Date(today.setDate(today.getDate() + 15)); // 15 gün sonrası

    // Veritabanı işlemine başla
    db.query(
        'INSERT INTO OduncAlma (KullaniciID, KitapID, AlisTarihi, IadeTarihi) VALUES (?, ?, NOW(), ?)',
        [KullaniciID, KitapID, iadeTarihi],
        (err, result) => {
            if (err) {
                console.error('Ödünç alma sırasında hata oluştu:', err);
                return res.status(500).send('Ödünç alma işlemi gerçekleştirilemedi.');
            }

            // Stok güncelleme sorgusu
            db.query(
                'UPDATE Kitaplar SET StokDurumu = StokDurumu - 1 WHERE KitapID = ? AND StokDurumu > 0',
                [KitapID],
                (err) => {
                    if (err) {
                        console.error('Stok güncelleme sırasında hata oluştu:', err);
                        return res.status(500).send('Stok güncellenemedi!');
                    }

                    console.log('Stok başarıyla güncellendi.');
                    res.redirect('/borrows'); // Başarılıysa ödünç alma işlemleri sayfasına yönlendirme
                }
            );
        }
    );
});

// Ödünç İşlemi Düzenleme Formunu Getirme Rotası
router.get('/edit/:id', (req, res) => {
    const IslemID = req.params.id;

    // Mevcut ödünç işlemini çek
    db.query('SELECT * FROM OduncAlma WHERE IslemID = ?', [IslemID], (err, borrowResults) => {
        if (err) throw err;

        // Kullanıcıları çek
        db.query('SELECT * FROM Kullanicilar', (err, userResults) => {
            if (err) throw err;

            // Kitapları ve kategorileri çek
            db.query(
                `SELECT Kitaplar.KitapID, Kitaplar.KitapAdi, Kitaplar.StokDurumu, 
                        Kategoriler.KategoriAdi 
                 FROM Kitaplar 
                 JOIN Kategoriler ON Kitaplar.KategoriID = Kategoriler.KategoriID`,
                (err, bookResults) => {
                    if (err) throw err;

                    res.render('editBorrow', {
                        borrow: borrowResults[0],
                        users: userResults,
                        books: bookResults,
                    });
                }
            );
        });
    });
});

// Ödünç İşlemini Düzenleme Rotası
router.post('/edit/:id', (req, res) => {
    const IslemID = req.params.id;
    const { KullaniciID, KitapID } = req.body;

    db.query(
        'UPDATE OduncAlma SET KullaniciID = ?, KitapID = ? WHERE IslemID = ?',
        [KullaniciID, KitapID, IslemID],
        (err) => {
            if (err) {
                console.error('Ödünç işlemi düzenlenirken hata oluştu:', err);
                return res.status(500).send('Ödünç işlemi düzenlenemedi.');
            }

            console.log('Ödünç işlemi başarıyla düzenlendi.');
            res.redirect('/borrows'); // İşlem başarılıysa ödünç işlemleri sayfasına yönlendirme
        }
    );
});

// Ödünç İşlemini Silme Rotası
router.get('/delete/:id', (req, res) => {
    const IslemID = req.params.id;

    // Silinecek ödünç işlemine ait KitapID'yi alın
    db.query('SELECT KitapID FROM OduncAlma WHERE IslemID = ?', [IslemID], (err, results) => {
        if (err) {
            console.error('Kitap bilgisi alınırken hata oluştu:', err);
            return res.status(500).send('Kitap bilgisi alınamadı.');
        }

        const KitapID = results[0].KitapID;

        // Ödünç işlem kaydını sil
        db.query('DELETE FROM OduncAlma WHERE IslemID = ?', [IslemID], (err) => {
            if (err) {
                console.error('Ödünç işlemi silinirken hata oluştu:', err);
                return res.status(500).send('Ödünç işlemi silinemedi.');
            }

            // Stok durumunu artır
            db.query(
                'UPDATE Kitaplar SET StokDurumu = StokDurumu + 1 WHERE KitapID = ?',
                [KitapID],
                (err) => {
                    if (err) {
                        console.error('Stok güncellenirken hata oluştu:', err);
                        return res.status(500).send('Stok güncellenemedi.');
                    }

                    console.log('Stok güncellemesi başarıyla tamamlandı.');
                    res.redirect('/borrows'); // İşlem başarılıysa ödünç işlemleri sayfasına yönlendirme
                }
            );
        });
    });
});

module.exports = router;
