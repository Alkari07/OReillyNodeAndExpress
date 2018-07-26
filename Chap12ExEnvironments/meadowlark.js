//this is the "app file," the project's entry point

//require is a node function which imports modules
var express = require('express');

var app = express();
var fortune = require('./lib/fortune.js');
var testContext = require('./lib/templatingExample.js');
var dummyWeatherData = require('./lib/weatherDummy.js');
var formidable = require('formidable');
var credentials = require('./credentials.js');
var cartValidation = require('./lib/cartValidation.js');

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

//setup execution context to trap uncontrolled exceptions
app.use(function (req, res, next) {
    //create a domain for this request
    var domain = require('domain').create();
    //handle errors on this domain
    domain.on('error', function(err) {
        console.error('DOMAIN CAUGHT ERROR\n', err.stack);
        try {
            //failsafe shutodwn in 5 seconds
            setTimeout(function() {
                console.error('failsafe shutdown.');
                process.exit(1);
            }, 5000);

            //disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) {
                worker.disconnect();
            }

            //stop taking new requests
            server.close();
            try {
                //attempt to use Express error route
                next(err);
            } catch(err) {
                //if epress error route failed, try plain Node response
                console.error('Express error mechanism failed.\n', err.stack);
                res.statusCode=500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server Error');
            }
        } catch(err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }
    });

    //add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    //execute the rest of the request chain in the domain
    domain.run(next);
});

//set up cookie based session
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session') ({
    resave: false,
    saveUnitialized: false,
    secret: credentials.cookieSecret
}));
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
 * setup loggig
 */
switch(app.get('env')) {
    case 'development':
        //compact, colorful logging
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        //module express logger supports daily log rotation
        app.use(require('express-logger') ({
            path: __dirname + '/log/requrests.log'
        }));
}

 //This middleware injects the weather data into the res.locals.partials object

 app.use(function(req, res, next) {
    if (!res.locals.partials) {
        res.locals.partials={};
    }
    res.locals.partials.weatherContext = dummyWeatherData.getDummyWeather();
    next();
});

//this middleware helps to parse forms for form POST operations
app.use(require('body-parser').urlencoded({extended: true}));

//set up flash message
app.use(function(req, res, next) {
    //if there's a flash message, transfer it to the context then clear it
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

//shows how routing and middleware can be encapsulated
//in this case, the validation pipe will run every time the user tries to navigate around the site
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);
/**
 * Routes
 * app.VERB ignores trailing slashes, things after ? for query strings, etc.  it just works
 */
app.get('/', function(req, res) {
    //render is what renders a whole page and uses template engines and other advanced functionality.  this is used most often.  
    res.cookie('monster', 'nom nom');
    req.session.userName='Rob';
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
app.get('/jqueryTest', function(req, res) {
    //uses a different layout than the default
    res.render('jquery-test', {
        layout: 'jqueryTest'
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
app.get('/testTemplate', function(req, res) {
    res.render('testTemplates/testTemplate', testContext.getContext());
});

app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme', {
        layout: 'jqueryTest'
    });
});
app.get('/data/nursery-rhyme', function(req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});
app.get('/newsletter', function(req, res) {
    res.render('newsletter', {csrf: 'CSRF token goes here'});
});
app.get('/newsletter2', function(req, res) {
    res.render('newsletter2', {csrf: 'CSRF token goes here', layout: 'jqueryTest'});
});
app.get('/thank-you', function(req, res) {
    res.render('thankYou', {csrf: 'CSRF token goes here'});
});

//file uploads
app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.get('/fail', function(req, res) {
    throw new Error('Nope!');
});

app.get('/epicFail', function(req, res) {
    //this will crash the server
    process.nextTick(function() {
        //this waits until the server is idle and no longer has a context to understand why the error occured
        //(ie, the request has alredy been resolved)
        //can be solved using a domain, which provides a context to do a graceful shutdown
        throw new Error ('Kaboom!');
    });
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

app.post('/process', function(req, res) {
    console.log('Form (from query string: ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name:' + req.body.name);
    console.log('Email:' + req.body.email);
    if (req.xhr || req.accepts('json,html')==='json') {
        res.send({
            success: true
        });
    } else {
        res.redirect(303, '/thank-you');
    }
    
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    console.log('POST endpoint hit');
    form.parse(req, function(err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields: ', fields);
        console.log('received files: ');
        console.log(files);
        res.redirect(303, '/thank-you')
    });
});

//flash message
var VALID_EMAIL_REGEX = new RegExp('/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/');

app.post('/newsletter', function(req, res) {
    var name = req.body.name || '', email = req.body.email || '';
    //input validation
    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) {
            return res.json({
                error: 'Invalid name email address.'
            });
        }
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'the email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    //newletter signup is an example of an object you might create
    new NewsletterSignup({
        name: name, email: email
    }).save(function(err) {
        if (err) {
            if (req.xhr) {
                return res.json({error: 'Database Error'});
                req.session = flash = {
                    type: 'danger',
                    intro: 'Database error',
                    message: 'there was a database error, please try again later'
                }
                return res.redirect(303, '/newsletter/archive');
            }
        }
        if (req.xhr) {
            req.session = flash = {
                type: 'success',
                intro: 'Thank You',
                message: 'You have been signed up'
            }
        }
        return res.redirect(303, '/newsletter/archive');
    });
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

function startServer() {
    app.listen(app.get('port'), function() {
        console.log('Express started in ' + app.get('env')+ ' mode on localhost:' + app.get('port')+ '; press Ctrl-C to terminate.');
    });
}

if (require.main===module) {
    // application run directly; start app server
    startServer();
} else {
    //application imported as module via require: export function to start server
    module.exports = startServer;
}




