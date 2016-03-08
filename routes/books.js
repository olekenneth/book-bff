// https://book-catalog-proxy.herokuapp.com/book?isbn=0596805527

var express = require('express');
var router = express.Router();

var goodGuy = require('good-guy-http');
var request = goodGuy({
    maxRetries: 3
});

var proxies = [
    'https://book-catalog-proxy.herokuapp.com/book?isbn=',
    'https://book-catalog-proxy-1.herokuapp.com/book?isbn=',
    'https://book-catalog-proxy-2.herokuapp.com/book?isbn=',
    'https://book-catalog-proxy-3.herokuapp.com/book?isbn=',
    'https://book-catalog-proxy-4.herokuapp.com/book?isbn='
];

router.get('/', function(req, res, next) {
    res.redirect('/books/0596805527');
});

var getBook = (isbn) => {
    return request({
        url: proxies[Math.floor(Math.random() * proxies.length)] + isbn,
        json: true
    })
        .then((response) => response.body)
        .then((response) => {
            console.log(response);
            if (response && response.items && response.items.length > 0) {
                return response.items;
            }
            throw new Error('No book found with that isbn: ' + isbn);
        });
};

router.get('/:isbn', function(req, res, next) {
    getBook(req.params.isbn)
        .then((items) => {
            var item = items[0];
            var book = {
                title: item.volumeInfo.title,
                subtitle: item.volumeInfo.subtitle,
                image: item.volumeInfo.imageLinks.thumbnail
            };
            res.render('book', { title: 'Express', book: book });
        })
        .catch(next);
});

module.exports = router;
