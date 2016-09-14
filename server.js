'use strict';

const http = require('http');

const parseForm = require('./util/parseForm');

http.createServer(function(req, res) {
    if (req.url === '/' && req.method === 'POST') {
        parseForm(req, res);
    }
}).listen(8080);

