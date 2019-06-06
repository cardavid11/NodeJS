var express = require('express');
var app = express();

// app.use(express.static('public'));

// app.get('/', function (req, res) {
//     res.send('Hello World!');
// });

// app.post('/', function (req, res) {
//     res.send('Got a POST request');
// });

// app.put('/user', function (req, res) {
//     res.send('Got a PUT request at /user');
// });

// app.delete('/user', function (req, res) {
//     res.send('Got a DELETE request at /user');
// });



var cb0 = function (req, res, next) {
    console.log('CB0');
    next();
}

var cb1 = function (req, res, next) {
    console.log('CB1');
    next();
}

app.get('/example/d', [cb0, cb1], function (req, res, next) {
    console.log('the response will be sent by the next function ...');
    next();
}, function (req, res) {
    res.send('Hello from D!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});