const TIMEZONE = "UTC";
var CronJob = require('cron').CronJob;
var FN = require('../CronFunctions/local-functions');
var {CONFIG} = require('../config');

if (CONFIG.CRON === "offff") {
    var PullFetchCities = new CronJob('01 */1 * * *', function () {
        console.log("Getting City Running Start");
        FN.FetchDetails();
    }, null, true, TIMEZONE);
    PullFetchCities.start();
}

/*Test Funtions to check Crons*/
//FN.FetchDetails();