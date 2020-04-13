const express = require('express');
const path = require('path');
const request = require('request');
const cheerio = require("cheerio");
const parseString = require('xml2js').parseString;
const app = express();
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

router.get('/result', function(req, res) {
    var location = req.query.location;
    queryA = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
    queryB = '&key=KEY';
    var query = queryA + 'food+banks+' + location + queryB;


    request(query, {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        const json = JSON.stringify(body);
        const obj = JSON.parse(json);

        var output = '';


        for (var i = 0; i < obj['results'].length; i++){
            var bit = obj['results'][i];
            output += '[formatted_address: "' + bit['formatted_address'] +
            '" name: "' + bit['name'] +
            '" rating: "' + bit['rating'] +
            '" location : "' + bit['geometry'] +
        '   ]\n';
        };

        console.log(output);

    })

});


app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});