const express = require('express');
const route = express.Router();
var AllEvents = require('../Model/allevents');
var Shows = require('../Model/shows');
const Module = require("../Modules/general");
const fs = require("fs");
const URL = require('url');

route.get('/', function (req, res) {
    try {
        let dataArr = [];

        if (fs.existsSync('public/data.txt')) {
            dataArr = fs.readFileSync('public/data.txt', 'utf8');
            // res.setHeader('Content-Type', 'application/json');
            jsonArr = JSON.parse(dataArr);
            res.render("NewShowForm", {
                data: jsonArr
            });
        }
    } catch (err) {
        dataArr = [];
        res.render("NewShowForm", {
            data: dataArr
        });
    }
});

route.get('/shows', async function (req, res) {
    const AllShows = await AllEvents.find({addedby: "user"}).sort({_id: -1});
    res.render("ListAllshows", {
        response: AllShows
    });
});


route.post('/save-records', (req, res) => {
    const formData = req.body;

    const showLocations = formData.date.map((obj, index) => {
        return {
            date: formData.date[index],
            day: Module.GetDay(formData.date[index]),
            time: formData.time[index],
            // priceMin: formData.priceMin[index],
            // priceMax: formData.priceMax[index],
            hall: formData.hall[index],
            city: formData.city[index],
            location: formData.location[index],
            address: formData.address[index]
        };
    });

    // console.log(URL.parse(formData.link).hostname);
    let DomainName = "";
    if (formData.link !== undefined && formData.link !== "") {
        try {
            DomainName = URL.parse(formData.link).hostname;
        } catch (e) {
            DomainName = "";
        }
    }

    //console.log(formData.link);

    // Create a new instance of the Show modal and populate it with the form data
    const newShow = {
        show_id: formData.showID,
        domain: DomainName,
        section: formData.section,
        link: formData.link,
        name: formData.name,
        tickets: formData.Tickets,
        addedby: "user",
        showLocations: showLocations
    };

    //console.log(newShow);
    AllEvents.create(newShow)
        .then(() => {
            res.send({
                error: false,
                message: "success"
            });
        })
        .catch((error) => {
            console.error('Error inserting form data:', error);
            res.status(500).send('Error inserting form data');
        });
});

module.exports = route;