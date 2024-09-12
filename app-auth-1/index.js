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


    console.log(password);
    // Hacher le mot de passe et ajouter l'utilisateur
    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
