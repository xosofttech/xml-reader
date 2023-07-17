const express = require('express');
const route = express.Router();
const Module = require('../Modules/general');
var Config = require('../config');
const { JSON } = require('../Modules/allowed-Extensions');
var AllEvents = require('../Model/allevents');


route.get('/', function (req, res) {
    res.send(`<center style="margin-top: 10%;"><h1> XML Shows</h1></center>`);
});



route.get('/add-shows', function (req, res) {
    res.render("index");
});


route.post('/insert', (req, res) => {
    const formData = req.body;


    const showLocations = formData.showLocations.map(locationArray => {
        return {
            day: locationArray[0],
            date: locationArray[1],
            priceMin: locationArray[2],
            priceMax: locationArray[3],
            hall: locationArray[4],
            city: locationArray[5],
            location: locationArray[6],
            address: locationArray[7]
        };
    });

    // Create a new instance of the Show modal and populate it with the form data
    const newShow = {
        show_id: formData.showID,
        domain: formData.domain,
        section: formData.section,
        link: formData.link,
        name: formData.name,
        date: formData.date,
        tickets: formData.Tickets,
        priceMin: formData.minPrice,
        priceMax: formData.maxPrice,
        dateTo: formData.dateTo,
        dateFrom: formData.dateFrom,
        pubDate: formData.pubDate,
        showLocations: showLocations
    };

    AllEvents.create(newShow)
        .then(() => {
            res.send('Form data inserted successfully');
        })
        .catch((error) => {
            console.error('Error inserting form data:', error);
            res.status(500).send('Error inserting form data');
        });
});



route.get('/healthcheck', function (req, res) {
    res.send(res.statusCode.toString());
});

var ShowsResult = [];
route.post('/fetch-shows', async function (req, res) {

    let isoDate = new Date();
    gteDate = isoDate.toISOString().substring(0, 10);

    filterParams = req.body.filter;
    pageParams = req.body.page;

    var perPage = (pageParams.limit !== undefined && pageParams.limit !== null) ? pageParams.limit : 10; //10docs in single page
    var page = pageParams.page - 1; //1st page

    if (isNaN(parseFloat(page)) || page === undefined) {
        perPage = 10;
        page = 0;
    }
    TodayDate = Module.parseDate(Module.NOW());
    Query = {};
    main_query = {};

    ShowsResult = [];

    if (filterParams.city)
        main_query["showLocations.city"] = new RegExp(filterParams.city, "i");

    if (filterParams.hall)
        main_query["showLocations.hall"] = new RegExp(filterParams.hall, "i");

    if (filterParams.address)
        main_query["showLocations.address"] = new RegExp(filterParams.address, "i");

    if (filterParams.date)
        main_query["showLocations.date"] = { $gte: filterParams.date }
    else
        main_query["showLocations.date"] = { $gte: TodayDate }

    if (!filterParams.date)
        Query.date = { $gte: gteDate };

    if (filterParams.name)
        main_query.name = new RegExp(filterParams.name, "i");

    if (filterParams.show_id)
        main_query.show_id = new RegExp(filterParams.show_id, "i");

    if (filterParams.section)
        main_query.section = new RegExp(filterParams.section, "i");


    ShowsResult = await Shows.aggregate([
        {
            $unwind: "$showLocations"
        },
        {
            $project: {
                _id: 0,
                showObj: 0
            }
        },
        {
            $match: main_query
        },
        {
            $sort: { "showLocations.date": 1 }
        },
        {
            $skip: perPage * page
        },
        {
            $limit: perPage
        }
    ]);


    Rows = await Shows.aggregate([
        {
            $unwind: "$showLocations"
        },
        {
            $project: {
                _id: 0,
                showObj: 0
            }
        },
        {
            $match: main_query
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);

    TotalRows = (Rows !== undefined && Rows.length !== 0) ? Rows[0].count : 0


    res.send({
        "result": Object.assign({}, ShowsResult),
        "TotalRecords": TotalRows,
        "CurrPage": pageParams.page,
        "Totalpages": (Math.ceil(TotalRows / perPage))
    });

});

module.exports = route