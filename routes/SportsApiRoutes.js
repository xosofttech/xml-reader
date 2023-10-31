const express = require('express');
const route = express.Router();
var SportSiteMap = require('../Model/SportSiteMap');


route.get('/healthcheck', function (req, res) {
    res.send(res.statusCode.toString());
});


// Define a POST route to list events based on filters
route.post('/sports-events', async (req, res) => {
    try {
        const {
            leagueName,
            gameType,
            teamNames,
            city,
            country,
            stadium,
            date,
            price,
            link,
            startDate,
            endDate,
            page,
        } = req.body;

        const filterCriteria = {};

        if (leagueName) {
            filterCriteria.leagueName = leagueName;
        }
        if (gameType) {
            filterCriteria.gameType = gameType;
        }
        if (teamNames) {
            filterCriteria.teamNames = teamNames;
        }
        if (city) {
            filterCriteria.city = city;
        }
        if (country) {
            filterCriteria.country = country;
        }
        if (stadium) {
            filterCriteria.stadium = stadium;
        }
        if (price) {
            filterCriteria.price = price;
        }
        if (link) {
            filterCriteria.link = link;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        if (!startDate && !endDate) {
            filterCriteria.date = { $gte: currentDate };
        } else {
            filterCriteria.date = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const allEvents = await SportSiteMap.find(filterCriteria);

        const { limit, pageno } = page || { limit: 10, pageno: 1 };

        const startIndex = (pageno - 1) * limit;
        const endIndex = pageno * limit;

        const events = allEvents.slice(startIndex, endIndex);

        const totalRecords = allEvents.length;
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            result: events,
            TotalRecords: totalRecords,
            CurrPage: pageno,
            Totalpages: totalPages,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = route