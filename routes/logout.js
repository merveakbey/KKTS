router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Oturum sonlandırma hatası:', err);
        }
        res.redirect('/login');
    });
});
