// https://book-catalog-proxy.herokuapp.com/book?isbn=0596805527

var express = require('express');
var router = express.Router();
var ESI = require('nodesi');

var esi = new ESI({
    onError: function(src, error) {
        if(error.statusCode === 404) {
            return 'Not found';
        }
        return '';
    }
});

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
    console.log(process.env);
    return getBook(req.params.isbn)
        .then((json) => {
            var book = {
                stockUrl: (process.env.STOCK_URL || 'http://localhost:3000/stock/') + req.params.isbn,
                title: jp.value(json, '$..title'),
                subtitle: jp.value(json, '$..subtitle'),
                image: jp.value(json, '$..thumbnail')
            };
            return new Promise((resolve, reject) => {
                req.app.render('book', { title: 'BFF for books', book: book }, function(err, html) {
                    if (!err) {
                        return resolve(html);
                    }
                    return reject(err);
                });
            });
        })
        .then((html) => esi.process(html))
        .then((html) => res.send(html))
        .catch(next);
});

module.exports = router;
