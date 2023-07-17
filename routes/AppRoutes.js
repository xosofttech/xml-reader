const express = require('express');
const route = express.Router();
var AllEvents = require('../Model/allevents');

route.get('/', function (req, res) {
    res.render("index");
});

route.post('/save-records', (req, res) => {
    const formData = req.body;

    const showLocations = formData.date.map((obj, index) => {
        //console.log(formData.date[index]);
        return {
            date: formData.date[index],
            time: formData.time[index],
            priceMin: formData.priceMin[index],
            priceMax: formData.priceMax[index],
            hall: formData.hall[index],
            city: formData.city[index],
            location: formData.location[index],
            address: formData.address[index]
        };
    });

    //console.log(showLocations);

    // Create a new instance of the Show modal and populate it with the form data
    const newShow = {
        show_id: formData.showID,
        domain: formData.domain,
        section: formData.section,
        link: formData.link,
        name: formData.name,
        date: formData.maindate,
        tickets: formData.Tickets,
        priceMin: formData.minPrice,
        priceMax: formData.maxPrice,
        dateTo: formData.dateTo,
        dateFrom: formData.dateFrom,
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