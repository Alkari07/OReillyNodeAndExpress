module.exports = {
    setup: function(app) {
        var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');

        app.get('/notify-me-when-in-season', function(req, res) {
            res.render('notify-me-when-in-season', {sku: req.query.sku});
        });

        app.post('/notify-me-when-in-season', function(req, res) {
            //the 'upsert' option is a combo insertion/update, depending on if the record already exists.
            VacationInSeasonListener.update(
                {
                    email: req.body.email
                },
                {$push: {skus: req.body.sku}},
                {upsert: true},
                function(err) {
                    if (err) {
                        console.error(err.stack);
                        req.session.flash = {
                            type: 'danger',
                            intro: 'Ooops!',
                            message: 'There was an error'
                        };
                        return res.redirect(303, '/vacations');
                    }
                    req.session.flash = {
                        type: 'success',
                        intro: 'Thank you!',
                        message: 'You will be notified when the vacation is in season'
                    };
                    return res.redirect(303, 'vacations');
                }
                
            )
        });

        app.get('/set-currency/:currency', function(req, res) {
            req.session.currency = req.params.currency;
            return res.redirect(303, '/vacations');
        });

        function convertFromUSD(value, currency) {
            switch (currency) {
                case 'USD': return value;
                case 'GBP': return value*0.6;
                case 'BTC': return value*0.00237;
                default: return NaN;
            }
        }

        app.get('/vacations', function(req, res) {
            Vacation.find({available: true}, function(err, vacations) {
                var context = {
                    vacations: vacations.map(function(vacation) {
                        return {
                            sku: vacation.sku,
                            name: vacation.name,
                            description: vacation.description,
                            price: vacation.getDisplayPrice(),
                            inSeason: vacation.inSeason
                        }
                    })
                };
                res.render('vacations', context);
            });
        });

        app.get('/vacations-with-mongoose-store', function(req, res) {
            Vacation.find({available: true}, function(err, vacations) {
                var currency = req.session.currency || 'USD';
                var context = {
                    currency: currency,
                    vacations: vacations.map(function(vacation) {
                        return {
                            sku: vacation.sku,
                            name: vacation.name,
                            description: vacation.description,
                            inSeason: vacation.inSeason,
                            price: convertFromUSD(vacation.priceInCents/100, currency),
                            qty: vacation.qty
                        }
                    })
                };
                switch(currency) {
                    case 'USD': context.currencyUSD = 'selected'; break;
                    case 'GBP': context.currencyGBP = 'selected'; break;
                    case 'BTC': context.currencyBTC = 'selected'; break;
                }
                res.render('vacations', context);
            });
        });
    }
};