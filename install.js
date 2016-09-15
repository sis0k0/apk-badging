'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const exec = require('child_process').exec;

const AdmZip = require('adm-zip');
const ProgressBar = require('progress');

const toolsDirectory = require('./config/tools').directory;

let DO_CHMOD = true;
let aaptExecutable = 'aapt';

const SUPPORTED_PLATFORMS = {
    Linux: 'linux',
    Darwin: 'macosx',
    Windows_NT: 'windows'
};

(function downloadAapt() {
    let platform = getPlatform()[0];
    let arch = getPlatform()[1];
    let url = getUrl(platform, arch);

    let targetDir = getTargetDir();


    fetchFile(url).then(unzip);
})();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

function getUrl(platform, arch) {
    if (platform === 'macosx') {
        return 'http://dl.google.com/android/adt/22.6.2/adt-bundle-mac-x86_64-20140321.zip'; 
    }
    
    if (arch === 'x64') {
        return `http://dl.google.com/android/adt/22.6.2/adt-bundle-${platform}-x86-20140321.zip`;
    } else {
        return `http://dl.google.com/android/adt/22.6.2/adt-bundle-${platform}-x86_64-20140321.zip`;
    }
}

function getPlatform() {
    let platform = SUPPORTED_PLATFORMS[os.type()];
    let arch = os.arch();

    if (typeof platform === 'undefined') {
        throw new Error('Unknown OS!');
    }
    
    if (platform === 'windows') {
        DO_CHMOD = false;
        aaptExecutable += '.exe';
    }

    return [platform, arch];
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
        let request = http.get(url, function (response) {
            let len = parseInt(response.headers['content-length'], 10);
            let bar = new ProgressBar('Downloading Android ADT Bundle [:bar] :percent :current of :total', {
                complete: '=',
                incomplete: ' ',
                width: 20,
                total: len
            });

            response.pipe(data);
            response.on('data', chunk => bar.tick(chunk.length));
            response.on('error', error => reject(error));
            response.on('end', () => resolve(file));
        });
    });
}

function getTemporaryFileLocation() {
    let tmpDir = path.join(__dirname, 'tmp');
    try {
        fs.statSync(tmpDir);
    } catch (e) {
        fs.mkdirSync(tmpDir);
    } 
    
    return `./tmp/platform-tools-${new Date().getTime()}.zip`;
}

function unzip(file) {
    return new Promise(function(resolve, reject) { 
        let zip = new AdmZip(file);

        try {
            let zipEntries = zip.getEntries();
            let entryName = false;
            
            zipEntries.forEach(function(zipEntry) {
                if (zipEntry.entryName.match(/aapt/)) {
                entryName = zipEntry.entryName;
                }
            });
            if (!entryName) {
                reject(new Error('Couldn\'t locate aapt application.'));
            }
            
            zip.extractEntryTo(entryName, toolsDirectory, false, true);
            
            if (DO_CHMOD) {
                let filePath = path.join(toolsDirectory, aaptExecutable);
                fs.chmodSync(filePath, '755');
            }
            
            fs.unlinkSync(file);
            resolve();
        } catch(error) {
            fs.unlinkSync(file);
            reject(error);
        }
    });
}