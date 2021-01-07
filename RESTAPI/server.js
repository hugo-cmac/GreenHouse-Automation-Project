const http = require('http');
const app = require('./app');
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8000, function(){
    console.log('Server running on 8080...');
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);


