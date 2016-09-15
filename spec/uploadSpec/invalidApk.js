'use strict';

const request = require('request');
const fs = require('fs');
const async = require('async');

const testFiles = require('../files').invalidApk;
const url = require('../config').url;

describe(`POST '/' with invalid apk file`, () => {
    let httpErrors = new Map();
    let statusCodes = new Map();
    let statusMessages = new Map();

    beforeAll(done => {
        let requests = [];
        for (let filename of testFiles) {
            let formData = {
                uploadedFile: fs.createReadStream(filename)
            };
            
            let currentRequest = cb => {
                request.post({url, formData}, (error, httpResponse, body) => {
                    if (error) {
                        httpErrors.set(filename, error);
                    }
                    
                    statusCodes.set(filename, httpResponse.statusCode);
                    statusMessages.set(filename, httpResponse.statusMessage);
                    
                    cb();
                });
            };
            
            requests.push(currentRequest);
        }

        async.parallel(requests, (error, results) => {
            if (error) {
                fail(error);
            }
            done();
        });
    });

    it('should return not http error', () => {
    expect(httpErrors.size).toBe(0);
    });
    
    it('should return proper status code', () => {
        for (let code of statusCodes.values()) {
            expect(code).toEqual(503);
        }
    });
    
    it('should return error message', () => {
        for (let message of statusMessages.values()) {
            expect(message).toBeDefined();
        }
    });
});