// https://book-catalog-proxy.herokuapp.com/book?isbn=0596805527

var express = require('express');
var router = express.Router();

var goodGuy = require('good-guy-http');
var request = goodGuy({
    maxRetries: 3
});
var jp = require('jsonpath');

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
        .then((response) => response.body);
};

router.get('/:isbn', function(req, res, next) {
    getBook(req.params.isbn)
        .then((json) => {
            var book = {
                title: jp.value(json, '$..title'),
                subtitle: jp.value(json, '$..subtitle'),
                image: jp.value(json, '$..thumbnail')
            };
            res.render('book', { title: 'BFF for books', book: book });
        })
        .catch(next);
});

module.exports = router;
