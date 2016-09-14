'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

const formidable = require('formidable');

function parse(req) {
    return new Promise(function(resolve, reject) {
        let form = new formidable.IncomingForm();
        form.uploadDir = getUploadDir();
        form.multiples = false;

        form.parse(req, function(error, fields, files) {
        
            if (Object.keys(files).length !== 1) {
                return reject({
                    statusCode: 400,
                    statusMessage: 'Bad Request. Cannot upload multiple files'
                });
            }

            for (let [name, file] of entries(files)) {
                if (file.type !== 'application/vnd.android.package-archive') {
                    return reject({
                        statusCode: 415,
                        statusMessage: `Unsupported file type: ${file.type}`
                    });
                }
                
                resolve(file);
            }
        });        
    });
}

function getUploadDir() {
    let targetDir = path.join(__dirname, 'tmp');

    try {
        fs.statSync(targetDir);
    } catch (e) {
        fs.mkdirSync(targetDir);
    }

    return targetDir;
}

            
function* entries(object) {
    for (let key of Object.keys(object)) {
        yield [key, object[key]];
    }
}

module.exports = parse;