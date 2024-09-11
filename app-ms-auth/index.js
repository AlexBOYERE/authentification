const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware pour analyser le JSON
app.use(bodyParser.json());

// Clé secrète pour signer les JWT - Orienter vers le .env
const JWT_SECRET = process.env.JWT_SECRET

// Base de données d'utilisateurs simulée - Faire une base de données réelle
let users = [
    {
        id: 1,
        username: 'user1',
        password: bcrypt.hashSync('password1', 8) // Mot de passe crypté
    },
    {
        id: 2,
        username: 'user2',
        password: bcrypt.hashSync('password2', 8) // Mot de passe crypté
    }
];

// Route publique
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API d\'authentification' });
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});