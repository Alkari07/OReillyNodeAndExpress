var Browser = require('zombie'),
assert = require('chai').assert;

var browser;

suite('Cross-Page Tests', function() {
    setup(function() {
        browser = new Browser();
        //workaround for zombie not setting the referrer field
        browser.on('request', function (req) {
            if (req.headers.get('referer')) {
                browser.referrer= req.headers.get('referer');
            }
        });
    });

    
    test('requesting a group rate quote from the hood river tour page' + 
        'should populate the referrer field', function(done) {
            var referrer = "http://localhost:3000/tours/hood-river";
            browser.visit(referrer, function() {
                browser.clickLink('.requestGroupRate', function() {
                    assert(browser.referrer===referrer);
                    done();
                });
            });
        });

    test('requesting a group rate from the oregon coast tour page should ' +
        'populate the referrer field', function(done) {
        var referrer = "http://localhost:3000/tours/oregon-coast";
        browser.visit(referrer, function() {
            browser.clickLink('.requestGroupRate', function() {
                assert(browser.referrer===referrer);
                done();
            });
        });
    });    

    test('requesting a group rate directly should result in an empty referrer field', function(done) {
        browser.visit("http://localhost:3000/tours/request-group-rate", function() {
                assert(browser.field('referrer').value==='');
                done();
        });
    });    
});