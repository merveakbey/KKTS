const session = require('express-session');

app.use(session({
    secret: 'gizliAnahtar', // Güçlü bir anahtar belirleyin
    resave: false,
    saveUninitialized: true
}));
