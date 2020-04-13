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
    queryB = '&key=AIzaSyChcI4CFgqLT1w-kmzJXotlA03pPHKjiqI';
    var query = queryA + 'food+banks+' + location + queryB;


    request(query, {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        const json = JSON.stringify(body);
        const obj = JSON.parse(json);

        var output = [];

        var result = [];
        for(var i in obj){
            result.push(obj['results']);
        }
       
        var dataArr = [];
        for (var i = 0; i < result.length; i++){
            dataArr = result[i];
        }

        for (var i = 0; i < dataArr.length; i++){
            var makeAr = [];
            var open = [];

            var object = {}
            object["address"] = dataArr[i].formatted_address;
            object["name"] = dataArr[i].name;
            object["rating"] = dataArr[i].rating;
            object['latitude'] = dataArr[i].geometry.location.lat;
            object['longitude'] = dataArr[i].geometry.location.lng;

            open.push(dataArr[i].opening_hours);
            for(var z = 0; z < open.length; z++){
                try{
                    object["open"] = open[0].open_now;
                }
                catch (e) {object["open"] = "no information"}
            }

            makeAr.push(object);
            output.push(makeAr);

        }
    
       console.log(output)

    })

});


app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});