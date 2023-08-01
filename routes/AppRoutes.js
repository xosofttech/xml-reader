const express = require('express');
const route = express.Router();
var AllEvents = require('../Model/allevents');
var Shows = require('../Model/shows');
var DeletedData = require('../Model/BlockedData')
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


        res.render("EditHalls", {
            data: jsonArr
        });
    }
});


route.get('/edit-cities', (req, res) => {
    try {
        Shows.find({}, (err, shows) => {
            if (err) {
                console.error('Error fetching data from "shows" table:', err);
                res.status(500).send('Error fetching data from "shows" table');
                return;
            }

            // Get an array of unique cities from the "DeletedData" collection
            DeletedData.find({}, { value: 1, _id: 0 }, (err, deletedDataCities) => {
                if (err) {
                    console.error('Error fetching data from "deleted_data" table:', err);
                    res.status(500).send('Error fetching data from "deleted_data" table');
                    return;
                }

                const uniqueDeletedDataCities = [...new Set(deletedDataCities.map(item => item.value))];

                res.render("EditCities", {
                    data: shows,
                    deletedDataCities: uniqueDeletedDataCities,
                });
            });
        });
    } catch (err) {
        console.error('Error rendering "EditCities" template:', err);
        res.status(500).send('Error rendering "EditCities" template');
    }
});



// route.get('/edit-cities', (req, res) => {
//     try {
//         Shows.find({}, (err, shows) => {
//             if (err) {
//                 console.error('Error fetching data from "shows" table:', err);
//                 res.status(500).send('Error fetching data from "shows" table');
//                 return;
//             }
//             console.log('Data from "shows" table:', shows);
//             res.render("EditCities", {
//                 data: shows
//             });
//         });
//     } catch (err) {
//         console.error('Error rendering "EditCities" template:', err);
//         res.status(500).send('Error rendering "EditCities" template');
//     }
// });




route.get('/edit-halls', (req, res) => {
    try {
        Shows.find({}, (err, shows) => {
            if (err) {
                console.error('Error fetching data from "shows" table:', err);
                res.status(500).send('Error fetching data from "shows" table');
                return;
            }

            // Get an array of unique cities from the "DeletedData" collection
            DeletedData.find({}, { value: 1, _id: 0 }, (err, deletedDataHalls) => {
                if (err) {
                    console.error('Error fetching data from "deleted_data" table:', err);
                    res.status(500).send('Error fetching data from "deleted_data" table');
                    return;
                }

                const uniqueDeletedDataHalls = [...new Set(deletedDataHalls.map(item => item.value))];

                res.render("EditHalls", {
                    data: shows,
                    deletedDataHalls: uniqueDeletedDataHalls,
                });
            });
        });
    } catch (err) {
        console.error('Error rendering "EditCities" template:', err);
        res.status(500).send('Error rendering "EditCities" template');
    }
});



// route.get('/edit-halls', (req, res) => {
//     try {
//         let dataArr = [];

//         if (fs.existsSync('public/data.txt')) {
//             dataArr = fs.readFileSync('public/data.txt', 'utf8');
//             jsonArr = JSON.parse(dataArr);

//             res.render("EditHalls", {
//                 data: jsonArr
//             });
//         } else {
//             dataArr = [];
//             res.render("EditHalls", {
//                 data: dataArr
//             });
//         }
//     } catch (err) {
//         dataArr = [];
//         res.render("EditHalls", {
//             data: dataArr
//         });
//     }
// });

route.get('/shows', async function (req, res) {
    const AllShows = await Shows.find({addedby: "user"}).sort({_id: -1});
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
    Shows.create(newShow)
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


// delete Hall

route.post('/delete-concert-hall', (req, res) => {
    const concertHall = req.body.concertHall;

    console.log('concertHall:', concertHall);
    const DeletedData = require('../Model/BlockedData'); 

    const deletedRecord = new DeletedData({
        value: concertHall,
        type: 'Hall'
    });

    deletedRecord.save()
        .then(() => {
            console.log('Record successfully saved');
            res.send({
                success: true,
                message: 'Record successfully deleted'
            });
        })
        .catch((error) => {
            console.error('Error saving the record:', error);
            res.status(500).send({
                success: false,
                message: 'Error saving the record'
            });
        });
});


// Recover Hall

route.post('/recover-concert-hall', (req, res) => {
    const concertHall = req.body.concertHall;
  
    // Perform MongoDB queries to check if the value exists in both "deleted_data" and "shows"
    DeletedData.findOne({ value: concertHall }, (err, deletedEntry) => {
      if (err) {
        console.error('Error finding entry in "deleted_data":', err);
        res.status(500).send('Error finding entry in "deleted_data"');
        return;
      }
  
      Shows.findOne({ concertHall: concertHall }, (err, show) => {
        if (err) {
          console.error('Error finding entry in "shows":', err);
          res.status(500).send('Error finding entry in "shows"');
          return;
        }
  
        if (deletedEntry && show) {
            DeletedData.findOneAndDelete({ value: concertHall }, (err, deletedDoc) => {
              if (err) {
                console.error('Error removing entry from "deleted_data":', err);
                res.status(500).send('Error removing entry from "deleted_data"');
              } else {
                console.log('Value deleted from "deleted_data"');
                res.json({ existsInBothCollections: true });
              }
            });
          } else {
            console.log('Value is not deleted');
            res.json({ existsInBothCollections: false });
          }
      });
    });
  });

// delete City

route.post('/delete-concert-city', (req, res) => {
    const concertHall = req.body.concertHall;

    console.log('concertHall:', concertHall);
    const DeletedData = require('../Model/BlockedData'); 

    const deletedRecord = new DeletedData({
        value: concertHall,
        type: 'City'
    });

    deletedRecord.save()
        .then(() => {
            console.log('Record successfully saved');
            res.send({
                success: true,
                message: 'Record successfully deleted'
            });
        })
        .catch((error) => {
            console.error('Error saving the record:', error);
            res.status(500).send({
                success: false,
                message: 'Error saving the record'
            });
        });
});


// Recover City

route.post('/recover-concert-city', (req, res) => {
    const concertHall = req.body.concertHall;
  
    // Perform MongoDB queries to check if the value exists in both "deleted_data" and "shows"
    DeletedData.findOne({ value: concertHall }, (err, deletedEntry) => {
      if (err) {
        console.error('Error finding entry in "deleted_data":', err);
        res.status(500).send('Error finding entry in "deleted_data"');
        return;
      }
  
      Shows.findOne({ concertHall: concertHall }, (err, show) => {
        if (err) {
          console.error('Error finding entry in "shows":', err);
          res.status(500).send('Error finding entry in "shows"');
          return;
        }
  
        if (deletedEntry && show) {
            DeletedData.findOneAndDelete({ value: concertHall }, (err, deletedDoc) => {
              if (err) {
                console.error('Error removing entry from "deleted_data":', err);
                res.status(500).send('Error removing entry from "deleted_data"');
              } else {
                console.log('Value deleted from "deleted_data"');
                res.json({ existsInBothCollections: true });
              }
            });
          } else {
            console.log('Value is not deleted');
            res.json({ existsInBothCollections: false });
          }
      });
    });
  });





module.exports = route;