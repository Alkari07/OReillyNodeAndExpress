var http = require('http');

//module takes an address and asks the google api what the geo coords are
//if there are multiple matches, it just uses the first one
module.exports = function(query, cb){
    var options = {
        hostname: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&sensor=false'
    };

    http.request(options, function(rest) {
        var data = '';
        res.on('data', function(chunk) {
            data+=chunk;
        });
        res.on('end', function() {
            data = JSON.parse(data);
            if (data.results.length) {
                cb(null, data.results[0].geoetry.location);
            } else {
                cb('No results found.', null);
            }
        });
    }).end();
};