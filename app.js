var express = require('express');
var Config = require('./config');
//var CronJobRoutes = require('./routes/CronJobRoutes');
const path = require("path");
const bodyParser = require("body-parser");
const cookiesParser  = require('cookie-parser');

var {dburl} = require('./config');
var mongoose = require('mongoose');
mongoose.connect(dburl, {sslValidate: false, useNewUrlParser: true, useUnifiedTopology: true});

// console.log(dburl)


var app = express();
app.use(cookiesParser());


app.use(express.static('public'));
app.use('*/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'twig');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var LocalCronJobRoute = require('./routes/LocalCronJobRoutes');
var CronJobRoute = require('./routes/CronJobRoutes');

app.use('/', require('./routes/ApiRoutes'));
app.use('/mobile', require('./routes/MobileApiRoutes'));
app.use('/app', require('./routes/AppRoutes'));


app.listen(Config.PORT, () => console.log(`Cron Jobs server currently running on port ${Config.PORT}`));
