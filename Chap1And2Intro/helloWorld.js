var http = require ('http');

http.createServer(function(req, res) {
    //normalize url by removing querystring, optional trailing slash, and making it lower case
    var path = req.url.replace('/\/?(?:\?.*)?$/', '').toLowerCase();
    switch(path) {
        case '/':
            res.writeHead(200, {
                'ContentType' : 'text/plain'
            });
            res.end('Homepage');
            break;
        case '/about':
            res.writeHead(200, {
                'ContentType' : 'text/plain'
            });
            res.end('About');
            break;
        default:
            res.writeHead(404, {
                'ContentType' : 'text/plain'
            });
            res.end('Page not found');
            break;
    }
    
    
}).listen(3000);

console.log('Server started on localhost:3000');