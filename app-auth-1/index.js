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

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
