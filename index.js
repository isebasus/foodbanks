const express = require('express');
const path = require('path');
const cheerio = require("cheerio");
const axios = require('axios');
var bodyParser = require("body-parser");
const app = express();
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();

var search = "https://www.bing.com/";
var query = "search?q=";

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

router.get('/result', function(req, res) {
    var location = req.query.location;
    var searchQuery = search + query + "food+banks+" + location;

    axios(searchQuery)
        .then(response => {
            const html = response.data;
            const text = html.text();

            const $ = cheerio.load(text);
            $('a').each((i, id) => {
                const href = link.attribs.href;
                console.log(href);
            });
            console.log(text);
        })
        .catch(console.error);



 

});

app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});