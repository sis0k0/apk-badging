'use strict';

const request = require('request');
const fs = require('fs');

const testFiles = require('../files').valid;
const url = require('../config').url;

describe(`POST '/' with multiple files`, () => {
    let httpError;
    let statusCode;
    let statusMessage;

    beforeAll(done => {
        let formData = {};
        for (let filename of testFiles.keys()) {
            formData[filename] = fs.createReadStream(filename);
        }

        request.post({url, formData}, (error, httpResponse, body) => {
            if (error) {
                httpError = error;
            }
            
            statusCode = httpResponse.statusCode;
            statusMessage = httpResponse.statusMessage;
            done();
        });
    });

    it('should return not http error', () => {
        expect(httpError).not.toBeDefined();
    });
    
    it('should return proper status code', () => {
        expect(statusCode).toBe(400);
    });
    
    it('should return error message', () => {
        expect(statusMessage).toBeDefined();
    });
});