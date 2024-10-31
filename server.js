const express = require('express');
const webPush = require("web-push");


const app = express();
const PORT = 3000;

let subscriptionAll = []

const mysql = require('mysql2');
app.use(express.json()); 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();
// Configurer EJS comme moteur de templates
app.set('view engine', 'ejs');
app.use(express.static('./public'));

const session = require('express-session');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // Remplacez par votre nom d'utilisateur MySQL
    password: '',     // Remplacez par votre mot de passe MySQL
    database: 'wpa'       // Remplacez par le nom de votre base de données
  });


  app.use(session({
    secret: 'votre_secret_complexe', // Utilisez une chaîne complexe ici
    resave: false,  // Évite de resauvegarder la session si elle n'a pas changé
    saveUninitialized: false, // Sauvegarde seulement les sessions modifiées
    cookie: {
        maxAge: 60000, // Durée de vie du cookie en millisecondes (ajustez selon votre besoin)
        secure: false // Mettez `true` si vous utilisez HTTPS
    }
}));

  webPush.setVapidDetails(
    "https://localhost:3000/",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );


  app.get("/vapidPublicKey", function (req, res) {
    console.log("VAPIDKEY")
    console.log(process.env.VAPID_PUBLIC_KEY)
    res.send(process.env.VAPID_PUBLIC_KEY);
  });

  app.post("/register", function (req, res) {
    // A real world application would store the subscription info.
    console.log("Register")
    console.log(req.body)
    subscriptionAll.push(req.body)
    res.sendStatus(201);
  });

  app.post('/inscription', (req, res) => {
    console.log(req.body)
    const { username, password } = req.body;
    console.log(username + ":"+password)
    // Hacher le mot de passe
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insérer le nouvel utilisateur dans la base de données
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).send('Erreur lors de l\'inscription');
        res.send('Inscription réussie !');
    });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Exécutez ici votre logique de vérification d'utilisateur (par exemple, vérifiez la base de données)
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send('Erreur lors de la connexion');
        if (results.length === 0) return res.status(400).send('Utilisateur non trouvé');

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Mot de passe incorrect');
        }

        req.session.userId = user.id; // Stocker l'ID de l'utilisateur dans la session

        // Sauvegarder la session et rediriger vers le profil
        req.session.save((err) => {
            if (err) return res.status(500).send('Erreur lors de la sauvegarde de la session');
            res.redirect('/profile');
        });
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Erreur lors de la déconnexion');
        res.send('Déconnexion réussie !');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log("OUI")
        // res.redirect('/profile');

        return next();
    } else {
        console.log("NON")

        res.redirect('/connection.html');
    }
}

app.get('/profile', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    console.log("PROFILEFIOE")
    console.log(req.session.userId)

    // Requête pour récupérer le nom d'utilisateur
    const userSql = 'SELECT username FROM users WHERE id = ?';
    db.query(userSql, [userId], (err, userResults) => {
        if (err) return res.status(500).send('Erreur lors de la récupération des informations utilisateur');
        if (userResults.length === 0) return res.status(404).send('Utilisateur non trouvé');

        const username = userResults[0].username;

        // Requête pour récupérer les favoris de l'utilisateur
        const favSql = `
            SELECT job.id, job.title, job.description, job.image_path 
            FROM favorites 
            JOIN job ON favorites.post_id = job.id 
            WHERE favorites.user_id = ?`;
        
        db.query(favSql, [userId], (err, favResults) => {

            if (err) return res.status(500).send('Erreur lors de la récupération des favoris');
        console.log("render")
            console.log(favResults)
            // Rendre la page avec le nom d'utilisateur et la liste des favoris
            res.render('profile', { username, favorites: favResults });
        });
    });
});



// Route principale pour afficher la page d'accueil
app.get('/', (req, res) => {
    // res.render('index.ejs',);
    
    const sql = 'SELECT * FROM job';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des offres:', err);
            res.status(500).send('Erreur lors de la récupération des offres');
        } else {
            res.render('index', { offres: results });
        }
    });
});

app.get('/offre', (req, res) => {
    const sql = 'SELECT * FROM job';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des offres:', err);
            res.status(500).send('Erreur lors de la récupération des offres');
        } else {
            res.render('offre', { offres: results });
        }
    });
});

app.get('/addOffer', (req, res) => {
    const { titre, description, pathimage } = req.body;

    // Vérifier que toutes les informations nécessaires sont fournies
    if (!titre || !description || !pathimage) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Requête SQL pour insérer une nouvelle offre dans la table `job`
    const sql = 'INSERT INTO job (title, description, image_path) VALUES (?, ?, ?)';
    db.query(sql, [titre, description, pathimage], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'offre:', err);
            return res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'offre.' });
        }
        res.status(201).json({ message: 'Offre ajoutée avec succès.', offerId: result.insertId });
    });
    sendMyNotification("Nouvelle Offre!!",`${description}`,"http://localhost:3000/",res)

});

// app.post("/sendNotification", function (req, res){
//     const subscription = req.body.subscription;
//     const payload = JSON.stringify({
//       title: "Notification de test",
//       message: "Ceci est un exemple de notification push.",
//       url: "https://example.com/notification"
// });

app.post("/sendNotification", function (req, res) {

    subscriptionAll.forEach(element => {
        console.log("isElement")
        console.log(element.subscription)
        const subscription = element.subscription;
        const payload = JSON.stringify({
            title: "Notification de test",
            message: "Ceci est un exemple de notification push.",
            url: "https://example.com/notification"
        })
        const options = {
            TTL: 3600  // Durée de vie en secondes (ici, 1 heure)
        };
        setTimeout(function () {
        webPush
            .sendNotification(subscription, payload, options)
            .then(function () {

            res.sendStatus(201);
            })
            .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
            });
        }, req.body.delay * 1000);

    });
});

app.get('/ajoutFav', isAuthenticated, (req, res) => {
    console.log("ICICICICI")
    const userId = req.session.userId; // ID de l'utilisateur connecté
    const postId = req.query.id; // ID de l'offre envoyé en paramètre

    if (!postId) {
        return res.status(400).send('ID de l\'offre manquant.');
    }

    // Vérifier si l'offre est déjà dans les favoris
    const checkSql = 'SELECT * FROM favorites WHERE user_id = ? AND post_id = ?';
    db.query(checkSql, [userId, postId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification des favoris:', err);
            return res.status(500).send('Erreur interne.');
        }

        if (results.length > 0) {
            return res.status(400).send('Cette offre est déjà dans vos favoris.');
        }

        // Ajouter l'offre aux favoris
        const insertSql = 'INSERT INTO favorites (user_id, post_id) VALUES (?, ?)';
        db.query(insertSql, [userId, postId], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout aux favoris:', err);
                return res.status(500).send('Erreur lors de l\'ajout aux favoris.');
            }
            res.status(201).send('Offre ajoutée aux favoris avec succès.');
        });
    });
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});


function sendMyNotification(titre,description,lien,res){
    subscriptionAll.forEach((element) => {
        console.log("isElement");
        console.log(element.subscription);
    
        const subscription = element.subscription;
        const payload = JSON.stringify({
            title: titre,
            body: description, // Utilisez `body` ici au lieu de `message`
            url: "http://localhost:3000/", // Remplacez par le chemin de votre icône
            actions: [
                { action: "open", title: "Ouvrir l'app" },
                { action: "dismiss", title: "Fermer" }
            ]
        });
    
        const options = {
            TTL: 3600 // Durée de vie en secondes (ici, 1 heure)
        };
    
        setTimeout(function () {
            webPush
                .sendNotification(subscription, payload, options)
                .then(function () {
                })
                .catch(function (error) {
                    console.log(error);
                });
        }, 200);
    });
    
}


