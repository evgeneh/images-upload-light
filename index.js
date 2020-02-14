const express = require('express');
const config = require('./config');

const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json());

const UploadUpdateResize = require('./upload')



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/error.html');
});

app.post('/upload', (req, res, next) => {

     UploadUpdateResize(req, res, function (error) {
            if (error) {
                console.log("ERROR WAS: " + error);
                return res.redirect("/error");
            }
            console.log('File uploaded successfully.');
            return res.redirect("/");
    });

});

app.listen(config.PORT, () => {
    console.log('index listening on port ' + config.PORT);
});