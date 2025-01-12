const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./config/database'); // Veritabanı bağlantısı
const authMiddleware = require('./middlewares/authMiddleware'); // Oturum kontrolü middleware'i

const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Middleware
app.use(
    session({
        secret: 'gizliAnahtar', // Güvenlik için güçlü bir anahtar
        resave: false,
        saveUninitialized: false,
    })
);

// Statik Dosyalar
app.use(express.static('public'));

// EJS Şablon Motoru
app.set('view engine', 'ejs');

// Rotalar
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrows');

// Auth gerektiren rotalar için middleware
app.use('/users', authMiddleware, userRoutes);
app.use('/books', authMiddleware, bookRoutes);
app.use('/borrows', authMiddleware, borrowRoutes);

// Ana Sayfa Rotası
app.get('/', (req, res) => {
    res.redirect('/login'); // Giriş sayfasına yönlendir
});

// Giriş Sayfası Rotası
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/index'); // Eğer oturum açıksa dashboard'a yönlendir
    }
    res.render('login'); // Giriş sayfasını render et
});

// Giriş İşlemi
app.post('/login', (req, res) => {
    const { KullaniciAdi, Sifre } = req.body;

    if (!KullaniciAdi || !Sifre) {
        return res.status(400).send('Kullanıcı adı veya şifre eksik.');
    }

    db.query('SELECT * FROM Admin WHERE KullaniciAdi = ?', [KullaniciAdi], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Sunucu hatası.');
        }

        if (results.length > 0) {
            const admin = results[0];

            if (Sifre === admin.Sifre) {
                req.session.user = { id: admin.AdminID, username: admin.KullaniciAdi };
                return res.redirect('/index');
            } else {
                return res.status(401).send('Hatalı şifre.');
            }
        } else {
            return res.status(404).send('Kullanıcı bulunamadı.');
        }
    });
});

// Dashboard Rotası
app.get('/index', authMiddleware, (req, res) => {
    res.render('index', { username: req.session.user.username });
});

// Çıkış İşlemi
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Çıkış işlemi sırasında hata oluştu:', err);
            return res.status(500).send('Çıkış yapılamadı.');
        }
        res.redirect('/login');
    });
});

// Sunucu Başlat
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
