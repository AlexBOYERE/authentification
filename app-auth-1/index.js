const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = 3000;

// Utilisateurs enregistrés - faire la transition bdd
let users = [];

// Middleware pour traiter les requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Définir notre moteur de rendu
app.set('view engine', 'ejs');

// Configurer les sessions (cookie)
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // 1 heure - 1200000 2 heures
}));

// Route de la page d'accueil
app.get('/', (req, res) => {
    res.render('index', { message: 'Bienvenue sur notre site' });
});

// Route d'inscription
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.render('register', { error: 'Utilisateur déjà existant' });
    }

    // Hacher le mot de passe et ajouter l'utilisateur
    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

// Route de connexion
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    console.log('récupération' + username + password);

    // Vérifier si l'utilisateur existe
    const user = users.find(user => user.username === username);

    console.log('vérification');

    if (!user) {
        return res.render('login', { error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    if (!bcrypt.compareSync(password, user.password)) {
        return res.render('login', { error: 'Mot de passe incorrect' });
    }

    console.log('ok');
    // Stocker l'utilisateur dans la session*

    console.log(user);
    console.log(username);

    res.redirect('/account');
});

// function pour analyser la connexion de l'utilisateur - route /account
function isAuthenticated(req, res, next) {
    console.log('test');

    console.log(req.session);

    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Route protégée sous login (account)
app.get('/account', isAuthenticated, (req, res) => {
    res.render('account', { username: req.session.user.username });
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
