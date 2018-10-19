module.exports= {
    //some random string
    //TODO: I am currently having problems proving out the connection, and I suspect the problem is the esri firewall.
    cookieSecret: 'growing milk doctor camp',
    mongo: {
        development: {
            connectionString: 'mongodb://Alkari:ZAQ!xsw2mlab@ds121262.mlab.com:21262/orilly_node_db'
        },
        production: {
            connectionString: 'mongodb://Alkari:ZAQ!xsw2mlab@ds121262.mlab.com:21262/orilly_node_db'
        }
    }
};