//this is the "app file," the project's entry point

var express = require('express');

var app = express();

/**
 * demonstration of putting dynamic content in views
 */

var fortunes = [
    'Red future',
    'Blue future',
    'Green future',
    'Yellow future'
];

//setup handlebars view engine
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//if env.PORT exists, use that.  If not, use 3000
app.set('port', process.env.PORT || 3000);

//add the public directory to serve it to client:
app.use(express.static(__dirname+'/public'));

/**
 * Routes
 * app.VERB ignores trailing slashes, things after ? for query strings, etc.  it just works
 */
app.get('/', function(req, res) {
    res.render('home');
});
app.get('/about', function(req, res) {
    res.type('text/html');
    var randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)];
    res.render('about', {fortune: randomFortune});
});

/**
 * Handlers
 * express has more robust methods and attributes for handling responses and requests
 */

//custom 404 page
//app.use is the method by which express adds middleware, which is used for error handling
//in this case, it acts as a catchall for anything that doesn't match a route
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next) {
    console.err(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on localhost:' + app.get('port')+ '; press Ctrl-C to terminate.');
});


