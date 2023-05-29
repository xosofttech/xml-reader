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

    var perPage = (pageParams.limit !== undefined && pageParams.limit !== null) ? pageParams.limit : 10; //10docs in single page
    var page = pageParams.page - 1; //1st page

    // console.log(perPage)
    // console.log(page)

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
    //main_query["showLocations.date"]= new RegExp(filterParams.date, "i")

    if (!filterParams.date)
        Query.date = {$gte: gteDate};

    // if (Object.entries(Query).length !== 0)
    //     main_query.showLocations = {$elemMatch: Query};

    if (filterParams.name)
        main_query.name = new RegExp(filterParams.name, "i");

    if (filterParams.show_id)
        main_query.show_id = new RegExp(filterParams.show_id, "i");

    if (filterParams.section)
        main_query.section = new RegExp(filterParams.section, "i");

    console.log(main_query)

    /*if (pageParams.limit <= 0) {
        ShowsResult = await Shows.find(main_query).sort({_id: 1});
    } else {
        ShowsResult = await Shows.find(main_query).skip(perPage * page).limit(perPage).sort({_id: 1});
    }*/

    //ShowsResult = await Shows.find(main_query).skip(perPage * page).limit(perPage).sort({_id: 1});


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


    Rows = await Shows.find(main_query).sort({_id: 1});
    TotalRows = Rows.length

    /*ShowsResult.map(elem => {
        const {showObj, ...newObj} = elem;
        delete newObj._doc.showObj;
        return newObj._doc;
    });*/


    /*filteredShows = [];
    var AlldatesObj = (ShowsResult[0].showLocations !== undefined) ? ShowsResult[0].showLocations : []
    AlldatesObj.forEach(function (arrayItem) {
        var x = arrayItem
        if (new Date(x.date) > isoDate) {
            // AlldatesObj.push(x)
            filteredShows.push(x)
        }
    });
    ShowsResult[0].showLocations = null;
    ShowsResult[0].showLocations = filteredShows;*/
    // console.log(ShowsResult)

    ShowsResultObj = Object.assign({}, ShowsResult);
    res.send({
        "result": ShowsResultObj,
        "TotalRecords": TotalRows,
        "CurrPage": pageParams.page,
        "Totalpages": (Math.ceil(TotalRows / perPage))
    });

});

module.exports = route