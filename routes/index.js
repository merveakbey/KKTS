const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/authMiddleware');
// Dashboard sayfası
router.get('/', (req, res) => {
    if (req.session && req.session.username) {
        res.render('index', { username: req.session.username }); // Kullanıcı adıyla render et
    } else {
        res.redirect('/login'); // Giriş yapılmadıysa login sayfasına yönlendir
    }
});

module.exports = router;
