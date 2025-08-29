const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

exports.createBooks = async (req, res, next) => {
    try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const inputPath = req.file.path;
    const outputFilename = `${req.file.filename.split('.')[0]}.webp`;
    const outputPath = path.join('images', outputFilename);

    await sharp(inputPath)
        .resize({ width: 206, height: 260, fit: 'cover'})
        .toFile(outputPath);

    fs.unlinkSync(inputPath);

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        } catch(error) { 
            res.status(400).json({ error });
        }
};

exports.getAllBooks =  (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getBestRatingBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestBooks => res.status(200).json(bestBooks))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
   const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
   
   delete bookObject.userId;
   Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized'});
        } else {
            Book.updateOne({ _id:req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({ message: 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Objet supprimé!'}))
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
};

exports.ratingBooks = (req, res, next) => {
    const rating = req.body.rating;
    const validRating = rating >= 0 && rating <= 5;
    Book.findOne({ _id: req.params.id })
        .then(book => {
            const userRating = book.ratings.find(e => e.userId === req.auth.userId);
            if (userRating) {
                userRating.grade = rating;
            } if (validRating && !userRating) {
                book.ratings.push({ userId: req.auth.userId, grade: rating });
            }
            const averageRating = book.ratings.reduce(( acc, val) => acc + val.grade, 0);
            book.averageRating = (averageRating / book.ratings.length).toFixed(1);
            book.save()
                .then(() => res.status(200).json(book))
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
    
};