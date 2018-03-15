var http = require ('http');

http.createServer(function(req, res) {
    res.writeHead(200, {
        'ContentType' : 'text/plain'
    });
    res.end('Hello World!');
}).listen(3000);

console.log('Server started on localhost:3000');