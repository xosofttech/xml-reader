var express = require('express');
var Config = require('./config');
//var CronJobRoutes = require('./routes/CronJobRoutes');
const path = require("path");
const bodyParser = require("body-parser");
const cookiesParser = require('cookie-parser');

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
// var CronJobRoute = require('./routes/CronJobRoutes');
var LocalCronJobRoute = require('./routes/LocalCronJobRoutes');

app.use('/', require('./routes/ApiRoutes'));
app.use('/mobile', require('./routes/MobileApiRoutes'));
app.use('/app', require('./routes/AppRoutes'));


var admin = require("firebase-admin");

var serviceAccount = require("./firebase/performances-e941f-firebase-adminsdk-wku7i-540d208811.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

const registrationToken = "emQoCBAJSkWRuB4Yl1wYdX:APA91bHlCosSzSEQGz6r7CnrUFO8YP-57MHORSQPZnypMummVgjQODLwdgaTcqghrGi3VI5FiCJPRdmpz8V6tkjN-XzL-1jsRUSka-UpoKY-elZV3bA-4NS2JJaYVrelkXHC3C4XTjFt"
const message = {
    notification: {
        title: "Perfomaces",
        body: "Yo Hello"
    }
};
const options = notification_options

admin.messaging().sendToDevice(registrationToken, message, options)
    .then(response => {
        console.log(response.results);
        console.log("Notification sent successfully");
        //res.status(200).send("Notification sent successfully")

    })
    .catch(error => {
        console.log(error);
    });


app.listen(Config.PORT, () => console.log(`Cron Jobs server currently running on port ${Config.PORT}`));
