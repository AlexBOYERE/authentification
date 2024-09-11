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

// Route d'inscription
app.post('/register', (req, res) => {
    const { username, password } = req.query;

    // Vérification si l'utilisateur existe déjà
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Cryptage du mot de passe et création de l'utilisateur
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
    };

    users.push(newUser);
    res.json({ message: 'Utilisateur enregistré avec succès' });
});

// Route publique
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API d\'authentification' });
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});