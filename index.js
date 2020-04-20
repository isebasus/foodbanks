const express = require('express');
const path = require('path');
var bodyParser = require("body-parser")
const https = require('https');
const http = require('http');
const app = express();
var EventEmitter = require('events').EventEmitter;
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();


app.set('view engine', 'ejs');

app.set("views", __dirname+"/views");

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

router.get('/', function(req, res) {
    res.render("index");
});

router.get('/banks', function(req, res) {
    var location = req.query.location;

    setTimeout(() => {
        var responseData = new EventEmitter();

        var query = "http://localhost:8080/result?location=" + location;

        var request = http.get(query, {json: true}, function(response){
            var jsResponse = '';
            response.on('data', function(chunk) {
                jsResponse += chunk;
            });
            response.on('end', function(){
                var obj = JSON.parse(jsResponse);
                responseData.obj = obj;
                responseData.emit('update');
            });
        });
        request.on('error', function(error) {
            console.log(error)
        });
        request.end();

        responseData.on('update', function(){
            var dataResponse = JSON.stringify(responseData.obj);
            res.render("result", {loc: location, data: dataResponse});
        });

    }, 2800);

});

router.get('/result', function(req, res) {
    var location = req.query.location;
    
    queryA = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
    queryB = '&key=AIzaSyChcI4CFgqLT1w-kmzJXotlA03pPHKjiqI';
    var query = queryA + 'food+banks+near+' + location + queryB;

    var request = https.get(query, {json: true}, function(response){
        var jsonResponse = '';
        response.on('data', function(chunk) {
            jsonResponse += chunk;
        });
        response.on('end', function() {
            const obj = JSON.parse(jsonResponse);

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

                output.push(object);
            }
            res.send(output);
        })
    });
    request.on('error', function(error) {
        console.log(error)
    })
    request.end();

});


app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});