module.exports = {
    setup: function(app, credentials) {
        var mongoose = require ('mongoose');
        var opts = {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            },
            useNewUrlParser: true
        };
        switch(app.get('env')) {
            case 'development':
                mongoose.connect(credentials.mongo.development.connectionString, opts);
                break;
            case 'production':
                mongoose.connect(credentials.mongo.development.connectionString, opts);
                break;
            default:
                throw new Error('Unknown execution environment: ' + app.get('env'));
        }
    }
};