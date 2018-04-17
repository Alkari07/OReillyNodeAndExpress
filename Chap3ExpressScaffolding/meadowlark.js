//this is the "app file," the project's entry point

var express = require('express');

var app = express();

//if env.PORT exists, use that.  If not, use 3000
app.set('port', process.env.PORT || 3000);

/**
 * Routes
 */
app.get('/', function(req, res) {
    res.type('text/plain');
    res.send('Meadowlark Travel');
});
app.get('/about', function(req, res) {
    res.type('text/plain');
    res.send('About Meadowlark Travel');
});

/**
 * Handlers
 */
//custom 404 page
app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});

//custom 500 page
app.use(function(err, req, res, next) {
    console.err(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server error');
});

app.listen(app.get('port'), function() {
    console.log('Express started on localhost:' + app.get('port')+ '; press Ctrl-C to terminate.');
});

