require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

// Connexion à MongoDB avec Mongoose
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.log('Erreur de connexion MongoDB :', err));

// Définir le modèle d'utilisateur pour la collection "auth-1"
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema, 'auth-1'); // Utilisation de la collection "auth-1"

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

    // Vérifier si l'utilisateur existe déjà dans la collection MongoDB
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Utilisateur déjà existant' });
        }

        // Hacher le mot de passe et créer un nouvel utilisateur dans la collection "auth-1"
        const hashedPassword = bcrypt.hashSync(password, 8);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save(); // Enregistrer l'utilisateur dans la base de données
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.render('register', { error: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe dans MongoDB
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Utilisateur non trouvé' });
        }

        // Vérifier le mot de passe
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { error: 'Mot de passe incorrect' });
        }

        // Enregistrer l'utilisateur dans la session
        req.session.user = user;
        res.redirect('/account');
    } catch (err) {
        console.log(err);
        res.render('login', { error: 'Erreur lors de la connexion' });
    }
});

// Middleware pour protéger la route /account
function isAuthenticated(req, res, next) {
    if (req.session.user) {
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
