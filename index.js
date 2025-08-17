const express = require('express');
const router = express.Router();
const pool = require('./connexion');

// Accueil
router.get('/', async (req, res) => {
    try {
        const [jeux] = await pool.query('SELECT * FROM jeux');
        res.render('accueil', { jeux });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Gestion des jeux
router.get('/jeux', async (req, res) => {
    try {
        const [jeux] = await pool.query('SELECT * FROM jeux');
        res.render('jeux', { jeux });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Gestion des clients
router.get('/clients', async (req, res) => {
    try {
        const [clients] = await pool.query(`
            SELECT c.*, j.nom as jeu_nom, j.prix_par_minute
            FROM clients c 
            LEFT JOIN jeux j ON c.jeu_id = j.id
        `);
        const [jeux] = await pool.query('SELECT * FROM jeux');
        res.render('clients', { clients, jeux });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// CRUD pour les jeux
router.post('/jeux/ajouter', async (req, res) => {
    const { nom, prix, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO jeux (nom, prix_par_minute, description) VALUES (?, ?, ?)',
            [nom, prix, description]
        );
        res.redirect('/jeux');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

router.post('/jeux/supprimer/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM jeux WHERE id = ?', [req.params.id]);
        res.redirect('/jeux');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// CRUD pour les clients
router.post('/clients/ajouter', async (req, res) => {
    const { nom, prenom, solde } = req.body;
    try {
        await pool.query(
            'INSERT INTO clients (nom, prenom, solde) VALUES (?, ?, ?)',
            [nom, prenom, solde]
        );
        res.redirect('/clients');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

router.post('/clients/commencer-jeu/:id', async (req, res) => {
    const { jeu_id } = req.body;
    try {
        const [jeu] = await pool.query('SELECT * FROM jeux WHERE id = ?', [jeu_id]);
        const [client] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
        
        if (jeu.length === 0 || client.length === 0) {
            return res.status(404).send('Client ou jeu non trouvé');
        }
        
        // Calcul du temps maximal possible (en minutes)
        const temps_max = Math.floor(client[0].solde / jeu[0].prix_par_minute);
        
        // Limite à 120 minutes (2h) maximum par session
        const temps_session = Math.min(temps_max, 120);
        
        if (temps_session <= 0) {
            return res.status(400).send('Solde insuffisant pour jouer');
        }
        
        // Calcul du coût réel
        const cout_total = temps_session * jeu[0].prix_par_minute;
        const nouveau_solde = client[0].solde - cout_total;
        
        const date_debut = new Date();
        
        await pool.query(
            'UPDATE clients SET jeu_id = ?, temps_restant = ?, date_debut = ?, solde = ? WHERE id = ?',
            [jeu_id, temps_session, date_debut, nouveau_solde, req.params.id]
        );
        
        res.redirect('/clients');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

router.post('/clients/supprimer/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
        res.redirect('/clients');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour recharger le solde
router.post('/clients/recharger/:id', async (req, res) => {
    const { montant } = req.body;
    try {
        await pool.query(
            'UPDATE clients SET solde = solde + ? WHERE id = ?',
            [montant, req.params.id]
        );
        res.redirect('/clients');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;