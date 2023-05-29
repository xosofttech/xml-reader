var express = require('express');
var Config = require('./config');
//var CronJobRoutes = require('./routes/CronJobRoutes');
const path = require("path");
const bodyParser = require("body-parser");

var {dburl} = require('./config');
var mongoose = require('mongoose');
mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

// console.log(dburl)


var app = express();


app.use(express.static('public'));
app.use('*/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// var CronJobRoute = require('./routes/CronRoutes');

app.use('/', require('./routes/AppRoutes'));


app.listen(Config.PORT, () => console.log(`Cron Jobs server currently running on port ${Config.PORT}`));
