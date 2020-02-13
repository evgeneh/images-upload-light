const express = require('express');
const config = require('./config');

const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(config.PORT, () => {
    console.log('index listening on port ' + config.PORT);
});