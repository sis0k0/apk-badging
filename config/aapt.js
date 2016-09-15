'use strict';

const path = require('path');

const toolsDirectory = require('./tools').directory;

module.exports = function() {
    return path.join(__dirname, `/../${toolsDirectory}/aapt`);
};
