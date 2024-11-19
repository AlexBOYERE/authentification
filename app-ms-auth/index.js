require('dotenv').config(); // Charger les variables d'environnement depuis .env
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

// Middleware pour analyser le JSON
app.use(bodyParser.json());

// Clé secrète pour signer les JWT, maintenant récupérée depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log('MongoDB connecté', process.env.MONGO_URI))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Modèle utilisateur
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Route d'inscription
app.post('/register', async (req, res) => {
    const { username, password } = req.query;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Cryptage du mot de passe et création de l'utilisateur
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({
        username,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.json({ message: 'Utilisateur enregistré avec succès' });
    } catch (err) {
        res.status(500).json({ message: err + 'Erreur lors de l\'enregistrement de l\'utilisateur' });
    }
});

// Route de connexion
app.post('/login', async (req, res) => {
    const { username, password } = req.query;

    // Vérification si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification du mot de passe
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Génération du JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: 86400 }); // Expire en 24h

    res.json({ message: 'Authentification réussie', token });
});

// Route publique
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API d\'authentification' });
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
