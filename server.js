const http = require('http');
const app = require('./app');
const database = require('./database');

const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server is up and running on ' + port);
});
