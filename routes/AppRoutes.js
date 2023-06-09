const express = require('express');
const route = express.Router();
const Module = require('../Modules/general');
var Config = require('../config');
const {JSON} = require('../Modules/allowed-Extensions');
var Shows = require('../Model/shows');


route.get('/', function (req, res) {
    res.send(`<center style="margin-top: 10%;"><h1> XML Shows</h1></center>`);
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

    const notInShabathFilter = filterParams.Not_in_Shabath;
    const isWeekendFilter = filterParams.isWeekend;

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
        main_query["showLocations.date"] = {$gte: filterParams.date}
    else
        main_query["showLocations.date"] = {$gte: TodayDate}

    // if (!filterParams.date)
    //     Query.date = {$gte: gteDate};


    if (filterParams.date)
        main_query["showLocations.date"] = { $gte: filterParams.date };
    else if (!filterParams.Not_in_Shabath)
        main_query["showLocations.date"] = { $gte: TodayDate };

    if (filterParams.name)
        main_query.name = new RegExp(filterParams.name, "i");

    if (filterParams.show_id)
        main_query.show_id = new RegExp(filterParams.show_id, "i");

    if (filterParams.section)
        main_query.section = new RegExp(filterParams.section, "i");

    if (filterParams.Not_in_Shabath) {
        main_query["showLocations.day"] = { $nin: ["Friday", "Saturday"] };
    }

    if (filterParams.isWeekend) {
        main_query["showLocations.day"] = { $in: ["Friday", "Saturday"] };
    }

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
            $sort: {"showLocations.date": 1}
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
                count: {$sum: 1}
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