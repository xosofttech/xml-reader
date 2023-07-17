const express = require('express');
const route = express.Router();
var AllEvents = require('../Model/allevents');

route.get('/', function (req, res) {
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

module.exports = route;