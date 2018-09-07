module.exports = {
    setup: function(app) {
        var staff = {
            mitch: {bio: 'Mitch is the man in the bar'},
            madeline : {bio: "maddy is the oregon expert"},
            walt: {bio: 'walt loves the coast'}
        };

        app.get('/staff/:name', function(req, res) {
            var info = staff[req.params.name];
            if (!info) return next();
            res.render('staffer', info);
        });
    }
};