const express = require('express');
const app = express();
const hostname = '127.0.0.1';
const port = 8080;
const router = express.Router();

app.set("view engine", "ejs");

app.set("views", __dirname+"/views");

app.listen(port, hostname, () => {
    console.log(`App running at http://${hostname}:${port}/`);
});