const express = require('express');
const path = require('path');
var bodyParser = require("body-parser")
const https = require('https');
const http = require('http');
const axios = require('axios');
const app = express();
var EventEmitter = require('events').EventEmitter;
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();

app.set('view engine', 'ejs');

app.set("views", __dirname+"/views");

app.use(express.static(path.join(__dirname, '/public')));

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

router.get('/', function(req, res) {
    res.render("index", {error: ""});
});

router.get('/map', function(req, res) {
    res.render("map");
});

router.get('/banks', function(req, res) {
    var location = req.query.location;
    var check = location.split("");

    var isZip = false;
    for(var i = 0; i < check.length; i++){
        if(/^\d+$/.test(check[i])){
            isZip = true;
        }
        else{
            isZip = false;
        }
    }

    if(isZip && check.length == 5){
        setTimeout(() => {
            var responseData = new EventEmitter();
    
            var query = "http://localhost:8080/result?location=" + location;
    
            let request = http.get(query, {json: true}, function(response){
                let jsResponse = '';
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
    
        }, 1000);
    }
    else{
        res.render("index", {error: "Please enter a zip code"});
    }

});

router.get('/result', function(req, res) {
    var location = req.query.location;

    var parseLocation = location.substring(0, 2);

    queryA = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
    queryB = '&key=AIzaSyChcI4CFgqLT1w-kmzJXotlA03pPHKjiqI';
    var query = queryA + 'food+banks+' + location + queryB;
    
    let request = https.get(query, {json: true}, function(response){
        let jsonResponse = '';
        response.on('data', function(chunk) {
            jsonResponse += chunk;
        });
        response.on('end', function() {
            var obj = JSON.parse(jsonResponse);
            var event = new EventEmitter();
    
            var output = [];
    
            var result = [];
            for(var i in obj){
                result.push(obj['results']);
            }
           
            var dataArr = [];
            for (var i = 0; i < result.length; i++){
                dataArr = result[i];
            }
    
            var index = 0;
            for (var i = 0; i < dataArr.length; i++){
    
                var types = dataArr[i].types;
                var address = dataArr[i].formatted_address;
                var placeId = dataArr[i].place_id;
    
                if(types.includes("atm") || types.includes("convenience_store") || types.includes("finance")){
                    dataArr.splice(index, 1);
                } else if (address.includes(parseLocation) && address.includes("United States")){
    
                    var query = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + placeId + "&fields=name,website,formatted_phone_number&key=secret 0_0";
                        
                    var object = {};
                    var open = [];
    
                    object["type"] = types[0];
                    object["address"] = address;
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
                        
                    axios.get(query).then(response => {
                        var getData = [];
                        getData.push(response.data['result']);
                        event.getData = getData;
                        event.emit('update');
                    }).catch(error => {
                        console.log(error);
                    });
                    
                    output.push(object);
    
                }
                index++;
            }
            var increment = 0;
            var index = 1;
            event.on('update', function(){
                var dataResponse = event.getData;
                var details = dataResponse[0];
    
                for(var i = 0; i < output.length; i++){    
                    if(output[i].name == details.name){
                        try{ output[i]['website'] = details.website; }
                        catch (e){ output[i]['website'] = ""; }
            
                        try{ output[i]['phoneNumber'] = details.formatted_phone_number; }
                        catch (e){ output[i]['phoneNumber'] = ""; }
                    }
                    
                }
                if (output.length == index){
                    res.send(output);
                }
    
                increment++;
                index++;
            });
    
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
