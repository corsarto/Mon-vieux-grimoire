const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
const Book = require('./models/Book');

mongoose.connect('mongodb+srv://clercloic3:ELNUcvXSWzlaWg5f@cluster0.7kwhtfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const data = require('../frontend/public/data/data.json')

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.get('/api/books', (req, res, next) => {
    res.status(200).json(data);
});

app.get('/api/books/bestrating', (req, res, next) => {
    const ratingBooks = [...data].sort((a, b) => b.averageRating - a.averageRating);
    const bestBooks = ratingBooks.slice(0, 3);
    res.status(200).json(bestBooks);
    
});

app.get('/api/books/:id', (req, res, next) => {
  console.log('Requête reçue pour le livre avec id :', req.params.id);

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(400).json({ error }));
});


app.post('/api/auth/signup', async (req, res, next) => {
    const { password } = req.body;
    const saltOrRounds = 15;
    try {
        const hash = await bcrypt.hash(password, saltOrRounds);
        res.status(201).json({ hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', (req, res, next) => {
    next();
});

app.post('/api/auth/books', (req, res, next) => {
    next();
});

app.post('/api/auth/books/:id/rating', (req, res, next) => {
    next();
});

module.exports = app;