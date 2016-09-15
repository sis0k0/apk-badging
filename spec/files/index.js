'use strict';

const path = require('path');

let valid = new Map();
valid.set(filePath('test.apk'), {
    name: 'APKPure',
    version: '1.1.10'
});

valid.set(filePath('whatsapp.apk'), {
    name: 'WhatsApp',
    version: '2.16.262'
});

valid.set(filePath('mystical-cave.apk'), {
    name: 'Mystical Cave VR',
    version: '1.2'
});

let invalidMimetype = ['text.txt', 'script.js'].map(filename => filePath(filename));
let invalidApk = ['invalid.apk'].map(filename => filePath(filename));

function filePath(filename) {
    return path.join(__dirname, filename);
}

module.exports = {
    valid,
    invalidMimetype,
    invalidApk
};
