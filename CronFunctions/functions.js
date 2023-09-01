// Data Models
const TIMEZONE = "Asia/Jerusalem";
var exec = require('child_process').exec;
const async = require("async");
const https = require("https");
const xml2js = require("xml2js");
const axios = require("axios");
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const moment = require('moment');
const request = require('request');
const {JSDOM} = jsdom;
const {
    Scraper,
    Root,
    OpenLinks,
    CollectContent,
    DownloadContent
} = require('nodejs-web-scraper');
const {Builder, Browser, By} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let profile = new firefox.Options();

profile.setPreference('permissions.default.stylesheet', 2);
profile.setPreference('permissions.default.image', 2);
profile.setPreference("dom.ipc.plugins.enabled.libflashplayer.so", false);
profile.setPreference('network.proxy.Kind', 'Direct')


global.DOMParser = new JSDOM().window.DOMParser

var Shows = require('../Model/shows');
var AllEvents = require('../Model/allevents');
const fs = require("fs");
const {start} = require('repl');
const {Console} = require('console');
// var Barbie = require('../Model/barbie');
// var Zappa = require('../Model/zappa');
// var EvenTim = require('../Model/eventim');
// var Comy = require('../Model/comy');

var execute = function (command, callback) {
    exec(command, {
        maxBuffer: Infinity
    }, function (error, stdout, stderr) {
        callback(error, stdout, stderr);
    });
};

exports.PullXMLObject = function () {
    try {
        execute(`node get-xml.js`, function (err, data, outerr) {
            if (err)
                throw err;


            console.log(data);
        });
    } catch (e) {
        console.log(`Not Working`);
    }
}

exports.ScrapBarbie = async function () {

    var ArrData = [];

    const pages = [0];
    // All ad pages.

    // pageObject will be formatted as {title,phone,images}, becuase these are the names we chose for the scraping operations below.
    // Note that each key is an array, because there might be multiple elements fitting the querySelector.
    // This hook is called after every page finished scraping.
    // It will also get an address argument.
    const getPageObject = (pageObject, address) => {
        pages.push({URL: address, Data: pageObject})
    }

    const config = {
        baseSiteUrl: `https://barby.co.il/`,
        startUrl: `https://barby.co.il/`,
        filePath: './images/'
    }

    const scraper = new Scraper(config);

    const root = new Root(); // Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).

    const jobAds = new OpenLinks('.defShowListMain a', {
        name: 'Link',
        getPageObject
    });
    // Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

    // const links = new CollectContent('.defShowListMain a.href', {name: 'link'});
    const titles = new CollectContent('h1', {name: 'title'});
    // const images = new DownloadContent('.showCatRightDiv img', {name: 'images'})
    const category = new CollectContent('.showCatLeftShowTitel span', {name: 'category'});
    const day = new CollectContent('.showCatDivLbl #ctl00_ContentPlaceHolder1_lblDay', {name: 'day'});
    const date = new CollectContent('.showCatDivLbl #ctl00_ContentPlaceHolder1_lblDate', {name: 'date'});
    const price = new CollectContent('.showCatDivLbl #ctl00_ContentPlaceHolder1_lblPrice', {name: 'price'});
    const showType = new CollectContent('.showCatDivLbl #ctl00_ContentPlaceHolder1_lblSeatType', {name: 'showType'});
    const description = new CollectContent('.divDescMainYL #ctl00_ContentPlaceHolder1_lblDescription', {name: 'description'});
    // const day = new CollectContent('.showCatDivLbl span', { day: 'day' });

    root.addOperation(jobAds);
    // jobAds.addOperation(links);
    // jobAds.addOperation(images);
    jobAds.addOperation(titles);
    jobAds.addOperation(category);
    jobAds.addOperation(day);
    jobAds.addOperation(date);
    jobAds.addOperation(price);
    jobAds.addOperation(showType);
    jobAds.addOperation(description);

    await scraper.scrape(root);
    // console.log(pages)

    for ([index, object] of pages.entries()) {
        var obj = object.Data;
        var pageAddress = object.URL || '';


        var convertSlug = pageAddress.substring(pageAddress.lastIndexOf('=') + 0);
        var showID = convertSlug.replace("=", "")


        // var convImg = (obj.images)
        // convImg = "" + convImg;

        if (obj?.title) {
            var convTitle = obj.title
            convTitle = "" + convTitle;
            // console.log(convTitle)
            var convCategory = obj.category
            convCategory = "" + convCategory;
            var convDay = obj.day
            convDay = "" + convDay;
            var convDate = obj.date
            convDate = "" + convDate;
            var convPrice = obj.price
            convPrice = "" + convPrice;
            var convPrice = convPrice.replace(/[^0-9]/g, '');

            var convDescription = obj.description
            convDescription = "" + convDescription;

            var timePattern = /[0-9][0-9]:[0-9][0-9]/gi;
            var datePattern = /(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/[0-9]{4}/gi;
            var myDate = convDate.match(datePattern)
            var convTime = convDate.match(timePattern)

            convDate = myDate[0];

            var dateParts = convDate.split("/");
            if (dateParts[0] >= 13) {
                var convDate = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
            } else {
                convDate = new Date(Date.parse(convDate))
            }
            convTime = convTime[0];


            // Show Locations
            var myDate = new Date(convDate);

            year = myDate.getFullYear();
            month = myDate.getMonth() + 1;
            dt = myDate.getDate();

            if (dt < 10) {
                dt = '0' + dt;
            }
            if (month < 10) {
                month = '0' + month;
            }

            myDate = year + '-' + month + '-' + dt;

            var locations = {};
            var showLocations = [];

            //locations.day = convDay;
            locations.date = myDate;
            locations.day = GetDay(locations.date);
            locations.time = convTime;
            locations.priceMin = convPrice;
            locations.priceMax = convPrice;
            locations.hall = "ברבי";
            locations.city = "תל אביב";
            locations.location = "Barbie";
            locations.address = "ברבי תל אביב Barbie";
            showLocations.push(locations);

            // Show Locations


            var response = {};
            response.show_id = showID;
            response.domain = 'www.barby.co.il';
            response.section = '';
            response.link = pageAddress;
            // response.image = convImg;
            response.name = convTitle;
            response.category = convCategory;
            //response.day = convDay;
            response.date = convDate;
            response.time = convTime;
            response.price = convPrice;
            response.description = convDescription;
            response.showLocations = showLocations;

            DBResponse = await Shows.findOne({show_id: showID});
            if (DBResponse === null) {
                ArrData.push(response);
            } else {
                await Shows.updateOne({show_id: showID}, response);
                console.log(showID, "Already Exist & Updated");
            }


        }
    }

    // console.log(ArrData)

    Shows.insertMany(ArrData).then(async function () {
        console.log("done");
        /*        rimraf("./images", function () {
                    console.log("done");
                });*/
    }).catch(function (error) {
        console.log(error)
    });


    // fs.writeFile('./pages.json', JSON.stringify(pages), () => { });//Produces a
}

exports.ScrapComy = async function () {

    var ArrData = [];

    const pages = []; // All ad pages.

    const getPageObject = (pageObject, address) => { // pageObject.URL=address;
        pages.push({URL: address, Data: pageObject})
    }

    const config = {
        baseSiteUrl: `https://comy.co.il/`,
        startUrl: `https://comy.co.il/`
    }

    const scraper = new Scraper(config);

    const root = new Root(); // Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).

    const jobAds = new OpenLinks('#home-page-events .event a', {
        name: 'Link',
        getPageObject
    });
    // Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

    // const links = new CollectContent('.defShowListMain a.href', {name: 'link'});
    const titles = new CollectContent('h1', {name: 'title'});
    const category = new CollectContent('h2', {name: 'category'});
    const showDescription = new CollectContent('#the-event p', {name: 'showDescription'});
    const date = new CollectContent('.te-date', {name: 'date'});
    const price = new CollectContent('.ticket-price', {name: 'price'});

    // Event List
    const eventName = new CollectContent('.single-place-string p', {name: 'eventName'});
    const eventHall = new CollectContent('.single-place-string p:nth-child(1)', {name: 'eventHall'});
    const eventCity = new CollectContent('.single-place-string p:nth-child(2)', {name: 'eventCity'});
    const eventDate = new CollectContent('.single-date-details .date', {name: 'eventDate'});
    const eventTime = new CollectContent('.single-date-details .single-light', {name: 'eventTime'});
    // const eventTitle = new CollectContent('.single-edt-left-new p', {name: 'eventTitle'});

    root.addOperation(jobAds);
    // jobAds.addOperation(links);
    jobAds.addOperation(titles);
    jobAds.addOperation(category);
    jobAds.addOperation(showDescription);
    jobAds.addOperation(date);
    jobAds.addOperation(price);
    // Event List
    jobAds.addOperation(eventName);
    jobAds.addOperation(eventHall);
    jobAds.addOperation(eventCity);
    jobAds.addOperation(eventDate);
    jobAds.addOperation(eventTime);
    // jobAds.addOperation(eventTitle);
    // jobAds.addOperation(showType);
    // jobAds.addOperation(description);

    await scraper.scrape(root);
    // console.log(pages)


    for ([index, object] of pages.entries()) {
        var obj = object.Data;
        var pageAddress = object.URL
        let slug = url => new URL(url).pathname.match(/[^\/]+/g)
        convertSlug = slug(pageAddress);
        var showID = convertSlug[1];

        var convTitle = (obj.title)
        convTitle = "" + convTitle;
        // console.log(convTitle)
        var convCategory = (obj.category)
        convCategory = "" + convCategory;
        var convshowDescription = (obj.showDescription)
        convshowDescription = "" + convshowDescription;
        var convDate = (obj.date)
        convDate = "" + convDate;
        var convPrice = (obj.price)
        convPrice = "" + convPrice;

        let ArreventDate = obj.eventDate;
        let ArreventTime = obj.eventTime;
        let ArreventName = obj.eventName;
        let ArreventHall = obj.eventHall;
        let ArreventCity = obj.eventCity;

        var parts = convDate.split('-');
        var startDate = new Date(parts[0]);
        var endDate = new Date(parts[1]);
        var startDateYear = "";
        var endDateYear = "";
        if (!isNaN(startDate.getTime())) {
            startDate = startDate.toISOString();
            startDateYear = parseInt(startDate);
        } else {
            startDate = null;
            startDateYear = null;
        }

        if (!isNaN(endDate.getTime())) {
            endDate = endDate.toISOString();
            endDateYear = parseInt(endDate);
        } else {
            endDate = null;
            endDateYear = null;
        }
        // console.log(startDateYear + " _____ " + endDateYear)

        var myObjArray = [];
        if (typeof ArreventDate !== "undefined" && typeof ArreventTime !== "undefined" && typeof ArreventName !== "undefined") {
            ArreventDate.forEach((num1, index) => {
                const num2 = ArreventTime[index];
                const num3 = ArreventName[index];
                const num4 = ArreventHall[index];
                const num5 = ArreventCity[index];
                var sDate = ""
                if (startDate !== null) {
                    sDate = startDateYear;
                }

                var myObj = {};
                const today = new Date(num1 + "." + 2023);

                const todayTest = num1 + "." + "2023";

                var datearray = todayTest.split(".");
                var newdate = datearray[2] + '-' + datearray[1] + '-' + datearray[0];
                myObj.date = newdate;
                myObj.day = GetDay(newdate);

                var parts = num2.split("'");
                var time = parts[1];

                myObj.time = (time && time != null && time != undefined) ? time.trim().replace(/ /g, '') : time;
                myObj.hall = (num4 !== '') ? num4 : num5;
                myObj.city = (num5 !== '') ? num5 : num4;
                myObj.address = num3;
                myObjArray.push(myObj);
                console.log("Title: ", convTitle, "Date", num1, "Converted Date", newdate)
            });
        }


        // console.log(myObjArray)


        var response = {};
        response.show_id = showID;
        response.domain = 'comy.co.il';
        response.section = '';
        response.link = pageAddress;
        response.name = convTitle;
        response.category = convCategory;
        // response.date = convDate;
        response.price = convPrice;
        response.showDescription = convshowDescription;
        response.showLocations = myObjArray;
        DBResponse = await Shows.findOne({show_id: showID});
        if (DBResponse === null) {
            ArrData.push(response);
        } else {
            await Shows.updateOne({show_id: showID}, response);
            console.log(showID, "Already Exist & Updated");
        }


    }

    // console.log(ArrData)

    Shows.insertMany(ArrData).then(async function () { // addComyObj()
        console.log("done")
    }).catch(function (error) {
        console.log(error)
    });


    // fs.writeFile('./pages.json', JSON.stringify(pages), () => { });//Produces a
}

exports.XMLToMongo = function () {
    try {
        execute(`curl https://buytickets.kartisim.co.il/xml/partner/shows.xml`, function (err, data, outerr) {
            if (err) throw err;
            console.log(`Result Fetched`);
            var parser = new xml2js.Parser({explicitArray: false});
            parser.parseString(data, function (err, result) {
                var Result = result.bravo.shows.show;

                console.log(`Total Result Found: ${Result.length}`);
                (async function () {
                    for await (var [key, val] of Result.entries()) {
                        //if (val.link === '/announce/75463') {
                        show_domain = "buytickets.kartisim.co.il";
                        show_name = val.name;
                        show_anounce = val.announce;
                        show_link = `https://performances.kartisim.co.il${val.link}`;
                        show_pubDate = val.pubDate;
                        show_section = val.section;
                        show_discount = (val.discount !== undefined) ? val.discount : 0;
                        show_superprice = (val.superprice !== undefined) ? val.superprice : 0;

                        //console.log("Discount: ", show_discount, "Superprice: ", show_superprice);

                        if (val.priceMin === undefined) {
                            show_priceMin = null;
                        } else {
                            show_priceMin = val.priceMin;
                        }
                        if (val.priceMax === undefined) {
                            show_priceMax = null;
                        } else {
                            show_priceMax = val.priceMax;
                        }
                        if (val.dateFrom === undefined) {
                            show_dateFrom = null;
                        } else {
                            show_dateFrom = val.dateFrom;
                        }
                        if (val.dateTo === undefined) {
                            show_dateTo = null;
                        } else {
                            show_dateTo = val.dateTo;
                        }

                        show_location = [];
                        if (val.seances?.seance !== undefined) {
                            show_location = val.seances?.seance;
                            if (!(show_location instanceof Array)) {
                                show_location = [show_location];
                            }
                            show_location.map((obj) => {
                                obj.link = (obj.link !== undefined) ? `https://performances.kartisim.co.il${obj.link}` : "";
                                obj.day = GetDay(obj.date);
                            });
                        }

                        if (val.seances?.seance === undefined) {
                            show_date = null;
                            show_time = null;
                            show_hall = null;
                            show_address = null;
                            show_city = null;
                            show_tickets = null;
                        } else {
                            show_date = val.seances.seance.date;
                            show_time = val.seances.seance.time;
                            show_hall = val.seances.seance.hall;
                            show_address = val.seances.seance.address;
                            show_city = val.seances.seance.city;
                            show_tickets = val.seances.seance.tickets;
                        }

                        show_object = val;

                        var parts = show_link.split('/');
                        show_id = parts.pop() || parts.pop();
                        // console.log(Result)
                        response = {
                            show_id: show_id,
                            domain: show_domain,
                            name: show_name,
                            anounce: show_anounce,
                            link: show_link,
                            pubDate: show_pubDate,
                            section: show_section,
                            discount: show_discount,
                            superprice: show_superprice,
                            priceMin: show_priceMin,
                            priceMax: show_priceMax,
                            dateFrom: show_dateFrom,
                            dateTo: show_dateTo,
                            hall: show_hall,
                            address: show_address,
                            date: show_date,
                            time: show_time,
                            city: show_city,
                            tickets: show_tickets,
                            showLocations: show_location,
                            showObj: show_object
                        };

                        ShowExist = await Shows.findOne({"show_id": show_id});
                        if (ShowExist != null) {
                            console.log("ShowID => ", show_id, " Exist already Found & Updated");
                            PageResult = await Shows.updateOne({
                                "show_id": show_id
                            }, {
                                link: show_link,
                                discount: show_discount,
                                superprice: show_superprice,
                                $set: {
                                    "showLocations": show_location
                                }
                            });
                        } else {
                            console.log("Show ID - ", show_id, "Inserted");
                            obj = new Shows(response);
                            await obj.save();
                        }
                        //}
                    }
                    console.log('Done.');
                })();
            });
        });
    } catch (e) {
        console.log(`Not Working`);
    }
}
let driver = "";
exports.ScrapEvenTim = async function () {
    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(profile).build();
    data = await GetBrowserURL(`https://www.eventim.co.il`);
    const $ = cheerio.load(data);

    const pokemons = $('.swiper-slide').map((_, pokemon) => {
        const $pokemon = $(pokemon);
        const link = $pokemon.find('a').attr("href");
        return {'link': link}
    }).toArray();
    EvenTimFunc(pokemons)
}


exports.LoopAllLinks = async function () {
    const links = [
        'https://2207.kupat.co.il/show/oshercohen',
        'https://2207.kupat.co.il/show/matilda',
        'https://2207.kupat.co.il/show/hananbenari',
        'https://2207.kupat.co.il/show/eyalgolan',
        'https://2207.kupat.co.il/show/shlomo-artzi',
        'https://2207.kupat.co.il/show/ozuna',
        'https://2207.kupat.co.il/show/static',
        'https://2207.kupat.co.il/show/avivgeffen',
        'https://2207.kupat.co.il/show/peertasi',
        'https://2207.kupat.co.il/show/sarit-hadad',
        'https://2207.kupat.co.il/show/idan-amedi',
        'https://2207.kupat.co.il/show/nasreenqadri',
        'https://2207.kupat.co.il/show/nathangoshen',
        'https://2207.kupat.co.il/show/revivoproject',
        'https://2207.kupat.co.il/show/knesiyathasechel',
        'https://2207.kupat.co.il/show/circus',
        'https://2207.kupat.co.il/show/krovim',
        'https://2207.kupat.co.il/show/echoes',
        'https://2207.kupat.co.il/show/elai-botner-outsidekids',
        'https://2207.kupat.co.il/show/shirimaimon',
        'https://2207.kupat.co.il/show/avi-aburomi',
        'https://2207.kupat.co.il/show/benaiabarabi',
        'https://2207.kupat.co.il/show/ishayribo',
        'https://2207.kupat.co.il/show/agambuhbut',
        'https://2207.kupat.co.il/show/dylendror',
        'https://2207.kupat.co.il/show/itay-levi-motzkin',
        'https://2207.kupat.co.il/show/sarit-hadad-motzkin',
        'https://2207.kupat.co.il/show/tuna',
        'https://2207.kupat.co.il/show/oshercohen-motzkin',
        'https://2207.kupat.co.il/show/dani-tislam',
        'https://2207.kupat.co.il/show/avivgefen-motzkin',
        'https://2207.kupat.co.il/show/avivgefen-motzkin',
        'https://2207.kupat.co.il/show/revivo',
        'https://2207.kupat.co.il/show/ran-elai',
        'https://2207.kupat.co.il/show/mia',
        'https://2207.kupat.co.il/show/yasso-time',
        'https://2207.kupat.co.il/show/dannysanderson',
        'https://2207.kupat.co.il/show/mati-caspi',
    ];

    async function scrapeEvents(links) {
        const eventsArray = [];

        for (const link of links) {
            await new Promise((resolve, reject) => {
                request(link, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        const $ = cheerio.load(body);
                        const showLocations = [];
                        // const name = $('.order_btn_wrap a').text();
                        const title = $('title').text();
                        var name = title.split(" - ")[0];
                        const domain = "2207.kupat.co.il";
                        const description = $('.about-content p').text();

                        $('.days.alldays li').each((index, element) => {
                            const $element = $(element);
                            const str = $element.find('.date').text().trim();
                            const formattedDate = str.match(/\d{2}\/\d{2}/)[0];
                            const date = new Date().getFullYear() + '-' + formattedDate.split('/').reverse().join('-');
                            const time = $element.find('.starts').text().trim();
                            const city = $element.find('.city').text().trim();
                            const hall = $element.find('.hall').text().trim();
                            const orderLink = $element.find('a.order_show').attr('href');

                            showLocations.push({
                                date,
                                time,
                                city,
                                hall,
                                orderLink
                            });
                        });

                        eventsArray.push({
                            name,
                            domain,
                            link,
                            description,
                            showLocations
                        });
                        resolve();
                    } else {
                        console.error('Error:', error);
                        reject(error);
                    }
                });
            });
        }
        console.log(eventsArray)
        AllEvents.insertMany(eventsArray).then(async function () {
            console.log("done");
        }).catch(function (error) {
            console.log(error)
        });

    }

    // scrapeEvents(links);

}

exports.smartTicket = async function () {
    const links = [
        'https://afula.smarticket.co.il/',
        'https://t-hazafon.smarticket.co.il/',
    ];

    async function scrapeTickets(links) {
        const eventsArray = [];
        const showLocations = [];

        for (const link of links) {

            console.log('scrapping', link)
            await new Promise((resolve, reject) => {
                request(link, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        const $ = cheerio.load(body);

                        $('.show_cube').each((index, element) => {
                            const $element = $(element);
                            const name = $element.find(`#show_name_${index}`).text().trim();
                            const date = $element.find('.show_date').text().trim();
                            var extractedDate = date.split(',')[1].trim();
                            const category = $element.find('.category').text().trim();
                            const hall = $element.find('.theater_name').text().trim();
                            const time = $element.find('.event-time').text().trim();
                            var timeRegex = /\b(\d{1,2}:\d{2})\b/;
                            var extractedTime = time.match(timeRegex)[1];

                            showLocations.push({
                                name: name,
                                showLocations: {
                                    name: name,
                                    date: extractedDate,
                                    category: category,
                                    hall: hall,
                                    time: extractedTime,
                                }
                            });
                        });

                        resolve();
                    } else {
                        console.error('Error:', error);
                        reject(error);
                    }
                });
            });
        }

        AllEvents.insertMany(showLocations).then(async function () {
            console.log("done");
        }).catch(function (error) {
            console.log(error)
        });

    }

    // scrapeTickets(links);

}


async function EvenTimFunc(pokemons) {

    var ArrData = [];
    var EventData = [];
    var eventDetails = [];
    var showID = "";
    console.log("Total:", pokemons.length);
    for await([index, object] of pokemons.entries()) {
        var pageAddress = object.link || '';

        var parts = object.link.split("/");
        if (parts[parts.length - 1].length == 0) {
            showID = parts[parts.length - 2];
        } else {
            showID = parts[parts.length - 1];
        }

        console.log("Calling Here", index);
        if (pageAddress.includes("https", "cities", "artist") == false) {
            pageAddress = ('https://www.eventim.co.il' + pageAddress);


            data = await GetBrowserURL(pageAddress);

            //console.log(data);

            try {
                const $ = cheerio.load(data);
                eventDetails = [];
                EventData = [];
                const $pokemon = $('.main-content');
                //const name = $pokemon.find('.event-listing-city').text();
                var name = $pokemon.find('.stage-headline:nth(0)').text();
                name = (name != null && name != undefined) ? name.replace(/(\r\n|\n|\r)/gm, " ").trim() : name;
                //console.log(name)

                const dateStr = $pokemon.find('.artwork-content-text .stage-content-text-item').text();
                var parts = dateStr.split('/');
                var formattedDate = parts[2].trim() + '-' + parts[1].trim() + '-' + parts[0].trim();
                const address = $pokemon.find('.stage-content-text-item address').text();
                const description = $pokemon.find('.moretext-teaser').text();
                $pokemon.find('.listing-item-wrapper-inside-card script').toArray().forEach((elem) => {
                    eventDetails.push(JSON.parse($(elem).text()));
                });

                if (eventDetails.length > 0) {

                    for await ([index, object] of eventDetails.entries()) {
                        var startDate = new Date(object.startDate).toISOString().slice(0, 10);
                        var eventTime = moment(object.startDate).tz(TIMEZONE).format("HH:mm");
                        EventData.push({
                            address: (object.location.name != null && object.location.name != undefined) ? object.location.name.trim() : object.location.name,
                            hall: (object.location.name != null && object.location.name != undefined) ? object.location.name.trim() : object.location.name,
                            city: (object.location.address.addressLocality != null && object.location.address.addressLocality != undefined) ? object.location.address.addressLocality.trim() : object.location.address.addressLocality,
                            date: startDate,
                            day: GetDay(startDate),
                            time: eventTime
                        });
                    }
                } else {

                    const $listing = $('.listing-item-wrapper-inside-card');
                    const address = $listing.find('.event-listing-venue').text().trim();
                    const city = $listing.find('.event-listing-info-wrapper .event-listing-venue').text().trim();
                    const hall = $listing.find('.event-listing-info-wrapper .event-listing-event').text().trim();
                    const day = $listing.find('.event-listing-date').text().trim();
                    const time = $listing.find('.event-listing-time').text().trim();


                    EventData.push({
                        address: address,
                        hall: hall,
                        city: city,
                        date: formattedDate,
                        day: GetDay(formattedDate),
                        time: time
                    });
                }


                console.log('Total Event Found', eventDetails.length);
                //console.log('eventDetails', EventData);


                /*for await([index, object] of eventDetails.entries()) {
                    var startDate = new Date(object.startDate).toISOString().slice(0, 10);
                    var eventTime = moment(object.startDate).tz(TIMEZONE).format("HH:mm");
                    EventData.push({
                        address: (object.location.name != null && object.location.name != undefined) ? object.location.name.trim() : object.location.name,
                        hall: (object.location.name != null && object.location.name != undefined) ? object.location.name.trim() : object.location.name,
                        city: (object.location.address.addressLocality != null && object.location.address.addressLocality != undefined) ? object.location.address.addressLocality.trim() : object.location.address.addressLocality,
                        date: startDate,
                        day: GetDay(startDate),
                        time: eventTime
                    });
                }*/


                var response = {};
                response.show_id = showID;
                response.domain = 'www.eventim.co.il';
                response.section = '';
                response.link = pageAddress;
                response.name = name;
                response.category = "";
                response.day = "";
                response.date = "";
                response.time = "";
                response.price = "";
                response.description = description;
                response.showLocations = EventData;
                response.showObj = eventDetails;

                // ArrData.push(response);

                // console.log(ArrData)


                const result = await Shows.findOne({show_id: showID});
                if (result == null) {
                    console.log(showID, "Not Found Pushing in Array");
                    ArrData.push(response);
                    await Shows.create(response);
                } else {
                    await Shows.updateOne({show_id: showID}, response);
                    console.log(showID, "Already Exist & Updated");
                }
            } catch (e) {
                console.log(`Error Cherio laod`);
            }
        }
    }
    console.log("Total New Added", ArrData.length);
    console.log("Updated, Execution Completed!!!");
    driver.close();
}

exports.ScrapTicketIngo = async function () {
    console.log("ScrapTmisrael")
    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(profile).build();
    data = await GetBrowserURL(`https://www.ticketingo.co.il/dock/team/barcelona-fc`);
    const $ = cheerio.load(data);
    const extractedData = [];


    $('.noBgColor .tableRow').each((index, element) => {
        const $eventInfo = $(element).find('.eventInfo');
        const $priceCell = $(element).find('.tableCell').eq(2);
        const $dateCell = $(element).find('.tableCell').eq(1); // Select the second .tableCell

        // Extract name
        const name = $eventInfo.find('a').text().trim();
        const price = $priceCell.find('.ticket-price').text().trim();
        const date = $dateCell.find('span').eq(1).find('font').text().trim(); // Extract the text of the font element inside the second span

        // Print the extracted data
        console.log('Name:', name);
        console.log('Price:', price);
        console.log('Date:', date);

        console.log('---'); // Separator for readability
    });
}

exports.ScrapSiteMap = async function () {
    const siteMaps = [
        'https://www.mevalim.co.il/page-sitemap.xml',
        'https://www.mevalim.co.il/page-sitemap2.xml'
    ];
    const allLinks = [];
    for (const siteMapUrl of siteMaps) {
        const response = await axios.get(siteMapUrl);
        const $ = cheerio.load(response.data);

        // Extract and console the links from the sitemap
        $('loc').each((index, element) => {
            allLinks.push($(element).text());
        });
    }

    await ScrapSiteMapFunc(allLinks);
}

async function ScrapSiteMapFunc(allLinks) {
    const excludedKeywords = [
        '#',
        'kartisim',
        'mevalim',
        'eventer',
        'barby',
        'comy',
        'eventim',
        'kupat',
        'smarticket',
        'tmisrael',
        'ticketingo'
    ];

    var ArrData = [];

    for await (const link of allLinks) {
        const Htmlresponse = await axios.get(link);
        const $ = cheerio.load(Htmlresponse.data);
        const eventItems = $('.rgbcode_table_shortcode_table_item');
        var DemoLink = link;
        for await (var element of eventItems) {
            const eventItem = $(element);

            const Unfromatteddate = eventItem.find('.rgbcode_table_shortcode_table_date').text().trim();
            const Fromattedyear = new Date().getFullYear(); // Get the current year
            const [Fromattedday, Fromattedmonth] = Unfromatteddate.split('.');
            const date = `${Fromattedyear}-${Fromattedmonth}-${Fromattedday}`;
            const dayAndTime = eventItem.find('.rgbcode_table_shortcode_table_when').eq(0).text().trim().split('\n');
            const time = dayAndTime[1].trim();
            const eventName = eventItem.find('.rgbcode_table_shortcode_table_event_name').text().trim();
            const secondTdText = eventItem.find('td:nth-child(2)').text().trim();
            const link = eventItem.find('td:nth-child(3) a').attr('href');
            var thirdSlashIndex = link.indexOf('/', link.indexOf('/', link.indexOf('/') + 1) + 1);
            var tempDomain = link.substring(0, thirdSlashIndex + 1);
            var domain = tempDomain.replace('https://www.', '').replace('/', '');
            var showID = link.substring(thirdSlashIndex + 1);
            // we are saving link instead of showID
            const cleanedSecondTdText = secondTdText.replace(eventName, '').trim();
            const parts = cleanedSecondTdText.split('\n');

            // Check if there are at least two parts
            if (parts.length >= 2) {
                // Extract and assign the values to the 'hallName' variable
                const value1 = parts[1].trim();
                const value2 = parts.length > 2 ? parts[2].trim() : ''; // Check if parts[2] exists
                const hall = value1 + ' ' + value2;
                const day = GetDay(date);
                // Check if the link contains any of the excluded keywords
                const isExcluded = excludedKeywords.some(keyword => link.includes(keyword));

                if (!isExcluded) {
                    var response = {};
                    response.show_id = link;
                    response.name = eventName;
                    response.link = link;
                    response.domain = domain;
                    response.showLocations = [{
                        //DemoLink: DemoLink,
                        date: date,
                        day: day,
                        time: time,
                        hall: (hall && hall != null && hall != undefined) ? hall.trim() : ""
                    }];

                    const result = await Shows.findOne({show_id: response.show_id});
                    if (result == null) {
                        console.log(response.show_id, "New Added");
                        await Shows.create(response);
                        //console.log(response.show_id, "New Found Pushed in Arr");
                        //ArrData.push(response);
                    } else {
                        await Shows.updateOne({show_id: response.show_id}, response);
                        console.log(response.show_id, "Already Exist & Updated");
                    }
                }
            }
        }
    }

    /*if (ArrData.length > 0) {
        console.log(`New scraped from link: ${ArrData.length}`);
        await Shows.insertMany(ArrData);
    }*/
    console.log(`New scraped from link: ${ArrData.length}`);
    console.log(`Execution Completed`);
}


exports.ScrapTmisrael = async function () {
    console.log("ScrapTmisrael")
    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(profile).build();
    data = await GetBrowserURL(`https://www.tmisrael.co.il/homepage/ALL/iw`);
    const $ = cheerio.load(data);

    const hrefArray = [];
    const ulElement = $('ul.v2');
    const links = ulElement.find('a');

// Iterate through each 'a' element and extract the href value
    links.each((index, element) => {
        const href = $(element).attr('href');
        hrefArray.push(href);
    });

    // console.log(hrefArray);

    const filteredHrefs = hrefArray.filter(href =>
        !href.includes('https://') && !href.includes('event-group')
    );
    // console.log(filteredHrefs)
    await TmisraelFunc(filteredHrefs, driver);

}


async function TmisraelFunc(pokemons, driver) {
    const baseURL = 'https://www.tmisrael.co.il'; // Base URL
    var productDetails = [];
    var showID = "";
    console.log("Total:", pokemons.length);

    for await (const link of pokemons) {
        const pageAddress = `${baseURL}${link}`;
        console.log(pageAddress);
        data = await GetBrowserURL(pageAddress, driver);
        // console.log(data)

        try {
            const $ = cheerio.load(data);
            eventDetails = [];
            EventData = [];
            const $pokemon = $('.ContentWrapperInner');
            const name = $pokemon.find('#eventnameh1 span[itemprop="name"]').text();
            const startDate = $('h2[itemprop="startDate"]').attr('content');
            const date = $('h2 span:nth-child(1)').text().trim();
            const month = $('h2 span:nth-child(2)').text().trim();
            const year = $('h2 span:nth-child(3)').text().trim();
            const day = $('h2 span:nth-child(5)').text().trim();
            const time = $('h2 span:nth-child(6)').text().trim();
            const location = $('#hidablelocation span[itemprop="name"]').text().trim();

            var locations = {};
            var showLocations = [];
            locations.name = name;
            locations.startDate = startDate;
            locations.month = month;
            locations.year = year;
            locations.day = day;
            locations.time = time;
            locations.hall = location;
            showLocations.push(locations);

            var response = {};
            response.name = name;
            response.showLocations = showLocations;

            console.log(response)


            // const result = await AllEvents.findOne({name: name});
            // if (result == null) {
            //     console.log(showID, "Not Found Pushing in Array");
            //     await AllEvents.create(response);
            // } else {
            //     await AllEvents.updateOne({name: name}, response);
            //     console.log(showID, "Already Exist & Updated");
            // }

        } catch (e) {
            console.log(`Error Cheerio load`, e);
        }
    }


    console.log(`Execution Completed`);

}


async function GetBrowserURL(url) {
    try {
        console.log(url);
        await driver.get(url);
        html = await driver.findElement(By.tagName("html")).getAttribute("innerHTML");
        return html;
    } catch (e) {
        console.log(e);
    }
}

function Delete_Shows() {
    Shows.deleteMany({domain: /buytickets.kartisim.co.il/}, function (err, resp) {
        console.log(resp);
    });
}

//Delete_Shows();

// async function PullDataToShows() {

//     Events = await AllEvents.find()

//     Shows.insertMany(Events).then(async function () {
//         console.log(`Execution Comleted`);
//     }).catch(function (error) {
//         console.log(error)
//     });


// }

// PullDataToShows();

//console.log(GetDay("2023-06-12"));

function GetDay(DateStr) {
    try {
        const data = new Date(DateStr);
        const day = data.getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[day];
    } catch (e) {
        return "";
    }
}