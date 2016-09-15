'use strict';

const path = require('path');
const exec = require('child_process').execFile;
const fs = require('fs');
const AdmZip = require('adm-zip');

const aapt = require('../config/aapt')();

const MAX_BUFFER = 1024 * 1024;

function extractBadging(apkFilePath) {
    return new Promise(function(resolve, reject) {
        exec(aapt, ['dump', 'badging', apkFilePath], {
            MAX_BUFFER
        }, function (error, out) {
            if (error) {
                fs.unlinkSync(apkFilePath);

                return reject({
                    statusCode: 503,
                    statusMessage: 'Service unavailable'
                });
            }

            let properties = parseDump(out, apkFilePath);
            fs.unlinkSync(apkFilePath);

            resolve(properties);
        });
    });
}

function parseDump(out, apkPath) {
    let lines = out.split('\n');

    let properties = {
        name: getApplicationLabel(lines),
        icon: getApplicationIcon(lines, apkPath),
        version: getApplicationVersion(lines)
    };

    return properties;
}

function getApplicationVersion(lines) {
    const SEPARATOR = '=';

    let packageConfiguration = getPackage(lines);
    let properties = packageConfiguration.split(' ');

    let versionLabel = properties.filter(property => property.startsWith('versionName'))[0];
    return extractValueFromLabel(versionLabel, SEPARATOR);
}

function getPackage(lines) {
    return getProperty(lines, 'package');
}

function getApplicationLabel(lines) {
    return getProperty(lines, 'application-label');
}

function getApplicationIcon(lines, apkPath) {
    let iconPath = getApplicationIconPath(lines);
    let iconBuffer = extractFile(apkPath, iconPath);
    let iconBase64 = iconBuffer.toString('base64');

    return iconBase64;
}

function getApplicationIconPath(lines) {
    return getProperty(lines, 'application-icon');
}

function getProperty(lines, propertyName) {
    const SEPARATOR = ':';

    let matchingLines = lines.filter(line => line.startsWith(propertyName));

    if (!matchingLines.length) {
        return;
    }

    let label = matchingLines[0];
    return extractValueFromLabel(label, SEPARATOR);
}

function extractValueFromLabel(label, separator) {
    let separatorIndex = label.indexOf(separator);
    let value = label.substring(separatorIndex + 1);

    return trimQuotes(value);
}

function trimQuotes(text) {
    const quoteChar = "\'";

    if (text.startsWith(quoteChar)) {
        text = text.substring(1);
    }

    if (text.endsWith(quoteChar)) {
        text = text.substring(0, text.length - 1);
    }

    return text;
}

function extractFile(apkPath, filePath) {
    const zip = new AdmZip(apkPath);
    const file = zip.readFile(filePath);

    return file;
}

module.exports = extractBadging;
