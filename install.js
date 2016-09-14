'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const exec = require('child_process').exec;

const toolsDirectory = require('./config/tools').directory;

const SUPPORTED_PLATFORMS = {
    Linux: 'linux',
    Darwin: 'macosx',
    Windows_NT: 'windows'
};

(function downloadAapt() {
    let platform = getPlatformType();
    let targetDir = getTargetDir();

    let url = getUrl(platform);

    fetchFile(url).then(unzip);
})();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

function getUrl(platform) {
    return `http://dl-ssl.google.com/android/repository/platform-tools_r16-${platform}.zip`;
}

function getPlatformType() {
    let platform = SUPPORTED_PLATFORMS[os.type()];

    if (typeof platform === 'undefined') {
        throw new Error('Unknown OS!');
    }

    return platform;
}

function getTargetDir() {
    let targetDir = path.join(__dirname, toolsDirectory);

    try {
        fs.statSync(targetDir);
    } catch (e) {
        fs.mkdirSync(targetDir);
    }

    return targetDir;
}

function fetchFile(url) {
    let file = getTemporaryFileLocation();
    let data = fs.createWriteStream(file);

    return new Promise(function(resolve, reject) {
        http.get(url, function (response) {
            response.pipe(data);
            response.on('error', error => reject(error));
            response.on('end', () => resolve(file));
        });
    });
}

function getTemporaryFileLocation() {
    return `/tmp/platform-tools-${new Date().getTime()}.zip`;
}

function unzip(file) {
    return new Promise(function(resolve, reject) {
        let command = `unzip -j -o ${file} platform-tools/aapt -d ${toolsDirectory}`;

        exec(command, error => {
            if (error) {
                reject(error);
            }

            let filePath = path.join(toolsDirectory, 'aapt');
            fs.chmodSync(filePath, '755');
            fs.unlinkSync(file);
            resolve();
        });
    });
}