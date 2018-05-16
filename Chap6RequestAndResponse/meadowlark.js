//this is the "app file," the project's entry point

//require is a node function which imports modules
var express = require('express');

var app = express();
var fortune = require('./lib/fortune.js');


//setup handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections={};
            this._sections[name] = options.fn(this);
            return null;
        }
    }});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//if env.PORT exists, use that.  If not, use 3000
app.set('port', process.env.PORT || 3000);

//add the public directory to serve it to client:
app.use(express.static(__dirname+'/public'));

/**
 * setup testing 
 */
app.use(function(req,res,next) {
    res.locals.showTests = app.get('env')!=='production' && req.query.test==='1';
    next();
});

/**
 * Routes
 * app.VERB ignores trailing slashes, things after ? for query strings, etc.  it just works
 */
app.get('/', function(req, res) {
    //render is what renders a whole page and uses template engines and other advanced functionality.  this is used most often.  
    res.render('home');
});
app.get('/test', function(req, res) {
    //send sends the content explicitly, such as raw text.  Not usually used since not template processing is done.
    res.type('text/plain');
    res.send('this is a test');
});
app.get('/greeting', function(req, res) {
    //passing context to a view
    res.render('about', {
        message: 'welcome',
        style: req.query.style,
        userid: req.cookies.userid,
        username: req.session.username,
    });
});

//the layout file views/layouts/custom.handlebars would be used here
app.get('/custom-layout', function(req, res) {
    res.render('custom-layout', {
        layout: 'custom'
    });
});

app.get('/tours/hood-river', function(req, res) {
    res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res) {
    res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate');
});

//Basic form processing (from POST)
//body-parser middleware must be linked in
app.post('/process-contact', function(req, res) {
    console.log('Received contact from ' + req.body.name + '<' + req.body.email + '>');
    try {
        //save to a database goes here
        //is this AJAX?  if so, do not redirect, return success JSON
        return res.xhr ? res.render({success: true}) : res.redirect(303, '/thank-you');
    } catch(ex) {
        return res.xhr ? res.render({error: 'Databae error.'}) : res.redirect(303, '/database-error');
    }
    
});

/**
 * Basic APIs
 */

 //simple GET endpoint returning only JSON
 app.get('/api/tours-simple', function(req, res) {
    var tours = {};
    tours.someEvent = 'San Francisco';
    tours.someDate = new Date();
    res.json(tours);
 });

 //this example uses the the res.format method to respond according to client preferences
 app.get('/api/tours', function(req, res) {
    var toursXml = 'some xml';
    var toursText = 'some text';
    res.format({
        'application/json': function() {
            res.json(tours);
        },
        'application/xml': function() {
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function() {
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function() {
            res.type('text/plain');
            res.send(toursXml);
        }
    });
 });

 //this example of a PUT to update uses an id field in the param path
 app.put('/api/tour/:id', function(req, res) {
    var p = tours.filter(function(p) {
        return p.id ===req.params.id;
    })[0];
    if (p) {
        //update fields are contained in the query string
        if (req.query.name) p.name = req.query.name;
        if (req.query.price) p.price = req.query.price;
        res.json({success: true});
    } else {
        res.json({
            error: "no such tour exists;"
        });
    }
 });

 //This example shows DEL removing a record
 app.delete('api/tour/:id', function(req, res) {
    var i;
    for (var i=tours.length-1; i>=0; i--) {
        if (tours[i].id==req.params.id) break;
    }
    if (i>=0) {
        tours.splice(i, 1);
        res.json({success:true});
    } else {
        res.json({
            error: "no such tour exists;"
        });
    }
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
//the next function must be included for epress to recognize this as an error handler, even if it's not used
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on localhost:' + app.get('port')+ '; press Ctrl-C to terminate.');
});


