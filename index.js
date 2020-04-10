const express = require('express');
const fs = require('fs');
const path = require('path');
var bodyParser = require("body-parser");
const app = express();
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();

var search = "https://www.bing.com/";
var query = "search?q=";

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

router.get('/result', function(req, res) {
    var location = req.query.location;
    var searchQuery = search + query + "food+banks+" + location;

    
});

app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});