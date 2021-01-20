var fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');
var connect = require('connect');
var serveStatic = require('serve-static');
var privateKey  = fs.readFileSync('./Cert/cert.key');
var certificate = fs.readFileSync('./Cert/cert.crt');
var credentials = {key: privateKey, cert: certificate};


connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);


