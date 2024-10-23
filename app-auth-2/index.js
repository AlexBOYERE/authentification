require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios'); // Importer le module axios pour effectuer des requêtes HTTP (MS auth)

const app = express();
app.use(express.static('public'));

const port = 3002;
const portAuth = process.env.PORT_AUTH || 4000;
const adresseAuth = `http://app-ms-auth:` + portAuth + `/`;


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

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Appel au microservice d'authentification pour l'inscription - Remplacer le localhost:3000 par l'URL du ms auth
        const response = await axios.post(adresseAuth + `register`, null, {
            params: { username, password }
        });

        if (response.status === 200) {
            res.redirect('/login');
        }
    } catch (err) {
        const errorMessage = err.response && err.response.data ? err.response.data.message : 'Erreur lors de l\'inscription';
        res.render('register', { error: errorMessage });
    }
});

// Route de connexion
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Appel au microservice d'authentification pour la connexion - Remplacer le localhost:3000 par l'URL du ms auth
        const response = await axios.post(adresseAuth + `login`, null, {
            params: { username, password }
        });

        if (response.status === 200) {
            // Récupérer le token JWT depuis le microservice
            const { token } = response.data;

            // Stocker le token dans la session utilisateur
            req.session.token = token;
            req.session.user = { username }; // Ajouter le nom d'utilisateur à la session

            res.redirect('/account');
        }
    } catch (err) {
        const errorMessage = err.response && err.response.data ? err.response.data.message : 'Erreur lors de la connexion';
        res.render('login', { error: errorMessage });
    }
});

// Middleware pour protéger la route /account
function isAuthenticated(req, res, next) {
    if (req.session.token) {
        return next();
    }
    res.redirect('/login');
}

// Route protégée (account)
app.get('/account', isAuthenticated, (req, res) => {
    res.render('account', { username: req.session.user.username });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});