const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();
const booksCtrl = require('../controllers/book');

router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, multer, booksCtrl.createBooks);
router.get('/bestrating', booksCtrl.getBestRatingBooks);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.ratingBooks);

module.exports = router;


