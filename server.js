'use strict';

const http = require('http');

const PORT = process.env.PORT || 8080;

const parseForm = require('./util/parseForm');
const extractBadging = require('./util/extractBadging');

http.createServer(function(req, res) {
    if (req.url === '/' && req.method === 'POST') {
        parseForm(req).then(extractBadging)
            .then(data => sendBadging(res, data))
            .catch(error => handleError(res, error));
    }
}).listen(PORT);

function sendBadging(res, badgingInformation) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    let json = JSON.stringify(badgingInformation);
    res.end(json);
}

function handleError(res, error) {
    res.statusCode = error.statusCode || 500;
    res.statusMessage = error.statusMessage;

    res.end();
}