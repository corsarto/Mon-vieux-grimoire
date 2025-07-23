const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const booksCtrl = require('../controllers/book');

router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, booksCtrl.createBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.getBestRatingBooks);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;


