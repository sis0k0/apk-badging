'use strict';

const request = require('request');
const fs = require('fs');
const async = require('async');

const testFiles = require('../files').valid;
const url = require('../config').url;

describe(`POST '/' with valid file`, () => {
    let expectedbadgingsProperties = ['name', 'icon', 'version'];
    let httpErrors = new Map();
    let badgings = new Map();

    beforeAll(done => {
        let requests = [];
        for (let filename of testFiles.keys()) {
            let formData = {
                uploadedFile: fs.createReadStream(filename)
            };

            let currentRequest = cb => {
                request.post({url, formData}, (error, httpResponse, body) => {
                    if (error) {
                        httpErrors.set(filename, error);
                    }
                    
                    badgings.set(filename, JSON.parse(body));
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


    it('should not return error', () => {
        expect(httpErrors.size).toBe(0);
    });

    it('should return the badgings', () => {
        expect(badgings.size).toBe(testFiles.size);

        for (let badging of badgings.values()) {
            expect(Object.keys(badging)).toEqual(expectedbadgingsProperties);
        }

        for (let [filename, badging] of badgings.entries()) {
            delete badging.icon;
            expect(badging).toEqual(testFiles.get(filename));
        }
    });
});
