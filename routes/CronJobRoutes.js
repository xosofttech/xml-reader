const TIMEZONE = "UTC";
var CronJob = require('cron').CronJob;
var FN = require('../CronFunctions/functions');
var {CONFIG} = require('../config');

if (CONFIG.CRON === "offfff") {
    var PullXMLToMongoObject = new CronJob('01 */3 * * *', function () {
        console.log("Getting XML TO Mongo Cron Running Start");
        FN.XMLToMongo();
    }, null, true, TIMEZONE);
    PullXMLToMongoObject.start();

    var ScrapBarbie = new CronJob('20 */3 * * *', function () {
        console.log("Scrap Barbie Cron Running Start");
        FN.ScrapBarbie();
    }, null, true, TIMEZONE);
    ScrapBarbie.start();

    var ScrapComy = new CronJob('35 */3 * * *', function () {
        console.log("Scrap Comy Cron Running Start");
        FN.ScrapComy();
    }, null, true, TIMEZONE);
    ScrapComy.start();

    var ScrapMevalim = new CronJob('40 */3 * * *', function () {
        console.log("Scrap Mevalim Cron Running Start");
        FN.ScrapMevalim();
    }, null, true, TIMEZONE);
    ScrapMevalim.start();


    var ScrapSportsEvents = new CronJob('50 */3 * * *', function () {
        console.log("Scrap Sports Cron Running Start");
        FN.ScrapSportSiteMap();
    }, null, true, TIMEZONE);
    ScrapSportsEvents.start();


    /*var ScrapEvenTim = new CronJob('50 *!/3 * * *', function () {
        console.log("Scrap EvenTim Cron Running Start");
        FN.ScrapEvenTim();
    }, null, true, TIMEZONE);
    ScrapEvenTim.start();*/
}

/*Test Funtions to check Crons*/
// FN.PullXMLObject();
// FN.XMLToMongo();
// FN.ScrapBarbie();
// FN.ScrapComy();
// FN.ScrapEvenTim();
// FN.LoopAllLinks();
// FN.smartTicket();
// FN.ScrapTmisrael();
// FN.ScrapTicketIngo();
// FN.ScrapMevalim();
// FN.ScrapSiteMap();
// FN.ScrapSportSiteMap();

