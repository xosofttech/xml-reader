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

        // Construct the filter criteria for the query
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

        // Get the current date in ISO format (e.g., "2023-10-02")
        const currentDate = new Date().toISOString().split('T')[0];

        // Add a filter to include only upcoming events if no date range is specified
        if (!startDate && !endDate) {
            filterCriteria.date = {$gte: currentDate};
        } else {
            // If startDate and endDate are specified, filter events within the date range
            filterCriteria.date = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        // Perform the query using the filter criteria
        const allEvents = await SportSiteMap.find(filterCriteria);
        
        // const { limit, pageno } = page || { limit: 10, pageno: 1 }; // Default to limit 10, page 1
        const { limit, pageno } = page; // Default to limit 10, page 1

        // Calculate start and end indices for pagination
        const startIndex = (pageno - 1) * limit;
        const endIndex = pageno * limit;

        // Slice the events array to return only the desired page
        const events = allEvents.slice(startIndex, endIndex);

        res.status(200).json({ events });

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = route