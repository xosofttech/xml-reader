const express = require('express');
const route = express.Router();
var AllEvents = require('../Model/allevents');
var Shows = require('../Model/shows');
var Users = require('../Model/users')
var DeletedData = require('../Model/BlockedData')
const Module = require("../Modules/general");
const fs = require("fs");
const URL = require('url');
const bcrypt = require('bcrypt');
const session = require('express-session');


// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true
// }));


route.post('/authentication', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await Users.findOne({email});
        if (user && password === user.password) {

            const userJSON = JSON.stringify(user);

            userEmail = user.email;
            userName = user.username;
            res.cookie("userEmail", userEmail, {
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
                httpOnly: true,
            });
            res.cookie("userName", userName, {
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
                httpOnly: true,
            });
            res.json({success: true});
        } else {
            res.status(401).json({success: false, message: 'Invalid email or password'});
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({success: false, message: 'Database error'});
    }
});


// New route for logging out and clearing cookies
route.post('/userLogout', (req, res) => {
    const msg = req.body;
    console.log("msg is ", msg.action)
    if (msg.action == "logout") {
        res.clearCookie("userEmail");
        res.clearCookie("userName");
    }
    res.json({success: true});
});

function isLoggedIn(req, res, next) {
    const userName = req.cookies.userName;
    console.log("Cookies values", userName);
    if (userName) {
        next();
    } else {
        res.redirect('/login');
    }
}


// main route
route.get('/', function (req, res) {
    const userName = req.cookies.userName;
    if (userName) {
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
    } else {
        res.redirect('app/login');
    }

});


route.get('/edit-cities', (req, res) => {
    const userName = req.cookies.userName;
    if (userName) {
        try {
            Shows.aggregate([
                {
                    $unwind: "$showLocations"
                },
                {
                    $group: {
                        _id: "$showLocations.city",
                        count: {$sum: 1}
                    }
                },
                {
                    $sort: {_id: 1}
                }], (err, shows) => {
                if (err) {
                    console.error('Error fetching data from "shows" table:', err);
                    res.status(500).send('Error fetching data from "shows" table');
                    return;
                }

                // Get an array of unique cities from the "DeletedData" collection
                DeletedData.find({type: "City"}, {value: 1, _id: 0}, (err, deletedDataCities) => {
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
    } else {
        res.redirect('/app/login');
    }
});


route.get('/edit-halls', (req, res) => {
    const userName = req.cookies.userName;
    if (userName) {
        try {
            Shows.aggregate([
                {
                    $unwind: "$showLocations"
                },
                {
                    $group: {
                        _id: "$showLocations.hall",
                        count: {$sum: 1}
                    }
                },
                {
                    $sort: {_id: 1}
                }], (err, shows) => {
                if (err) {
                    console.error('Error fetching data from "shows" table:', err);
                    res.status(500).send('Error fetching data from "shows" table');
                    return;
                }
                DeletedData.find({type: "Hall"}, {value: 1, _id: 0}, (err, deletedDataHalls) => {
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
    } else {
        res.redirect('/app/login');
    }


});


route.get('/login', async function (req, res) {
    res.render("login", {});
});

route.get('/shows', async function (req, res) {
    const userName = req.cookies.userName;
    if (userName) {

        const AllShows = await Shows.find({addedby: "user"}).sort({_id: -1});
        res.render("ListAllshows", {
            response: AllShows
        });
    } else {
        res.redirect('/app/login');
    }
});

route.get('/all-shows', async function (req, res) {
    const userName = req.cookies.userName;
    if (userName) {

        const AllShows = await Shows.find({addedby: {$ne: "user"}}).sort({_id: -1});
        res.render("ListAllconcerts", {
            response: AllShows
        });
    } else {
        res.redirect('/app/login');
    }
});



route.delete('/delete-show/:id', async (req, res) => {
    try {
        const deletedShow = await Shows.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Show deleted successfully', deletedShow });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the show' });
    }
});


route.post('/save-records', (req, res) => {
    const formData = req.body;

    const showLocations = formData.date.map((obj, index) => {
        return {
            date: formData.date[index],
            day: Module.GetDay(formData.date[index]),
            time: formData.time[index],
            hall: formData.hall[index],
            city: formData.city[index],
            location: formData.location[index],
            address: formData.address[index],
            priceMin: formData.priceMin[index],
            priceMax: formData.priceMax[index]

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


route.post('/quick-edit-show', async (req, res) => {
    const formData = req.body;

    try {
        // Define the update object with the fields you want to update
        const updateObject = {
            domain: formData.domain,
            section: formData.section,
            name: formData.name
            // Add other fields as needed...
        };

        await Shows.updateOne(
            {_id: formData.showId},
            {$set: updateObject},
            // Return the updated document
        );

        res.status(200).json({message: 'Show details updated successfully',});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while updating show details'});
    }
});


/*Shows.updateOne({_id: Object('63e62017b41d1ce764b1e402')}, {"$set": {'showLocations.0.day': "Zeeshan"}}, function (err, results) {
    console.log(results);
});*/


route.post('/detail-edit-show', async (req, res) => {
    const formData = req.body;
    const showId = formData.showId;
    const index = formData.index;
    console.log("formData", formData);

    try {
        var updatedFields = {
            [`showLocations.${index}.address`]: formData.address,
            [`showLocations.${index}.hall`]: formData.hall,
            [`showLocations.${index}.city`]: formData.city,
            [`showLocations.${index}.date`]: formData.date,
            [`showLocations.${index}.day`]: Module.GetDay(formData.date),
            [`showLocations.${index}.time`]: formData.time,
            [`showLocations.${index}.priceMin`]: formData.minPrice,
            [`showLocations.${index}.priceMax`]: formData.maxPrice
        };

        await Shows.updateOne(
            { _id: showId },
            { $set: updatedFields }
        );

        res.status(200).json({ message: 'Show location details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating show location details' });
    }
});

// delete location detail
// console.log(show.showLocations[index])

route.delete('/deleteLocationDetail', async (req, res) => {
    const { index, showId } = req.body;
    console.log(" :obj id is : ", showId ," index is", index );

    try {
        const show = await Shows.findById(showId);

        if (!show) {
            return res.status(404).send('Show not found');
        }

        if (index >= 0 && index < show.showLocations.length) {
            console.log('Before deletion:', show.showLocations);

            show.showLocations.splice(index, 1); // Remove the object at the specified index
            // await show.save(); // Save the updated document
            await Shows.updateOne(
                { _id: showId },
                { $set: { showLocations: show.showLocations } } // Update the array
            );

            console.log('After deletion:', show.showLocations);
            
            return res.status(200).send('Location detail deleted');
        } else {
            return res.status(400).send('Invalid index');
        }
    } catch (error) {
        console.error('Error deleting location detail:', error);
        res.status(500).send('Internal Server Error');
    }
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
    DeletedData.findOne({value: concertHall}, (err, deletedEntry) => {
        if (err) {
            console.error('Error finding entry in "deleted_data":', err);
            res.status(500).send('Error finding entry in "deleted_data"');
            return;
        }

        Shows.findOne({concertHall: concertHall}, (err, show) => {
            if (err) {
                console.error('Error finding entry in "shows":', err);
                res.status(500).send('Error finding entry in "shows"');
                return;
            }

            if (deletedEntry && show) {
                DeletedData.findOneAndDelete({value: concertHall}, (err, deletedDoc) => {
                    if (err) {
                        console.error('Error removing entry from "deleted_data":', err);
                        res.status(500).send('Error removing entry from "deleted_data"');
                    } else {
                        console.log('Value deleted from "deleted_data"');
                        res.json({existsInBothCollections: true});
                    }
                });
            } else {
                console.log('Value is not deleted');
                res.json({existsInBothCollections: false});
            }
        });
    });
});

// delete City

route.post('/delete-concert-city', (req, res) => {
    const concertHall = req.body.concertHall;
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
    DeletedData.findOne({value: concertHall}, (err, deletedEntry) => {
        if (err) {
            console.error('Error finding entry in "deleted_data":', err);
            res.status(500).send('Error finding entry in "deleted_data"');
            return;
        }
        Shows.findOne({concertHall: concertHall}, (err, show) => {
            if (err) {
                console.error('Error finding entry in "shows":', err);
                res.status(500).send('Error finding entry in "shows"');
                return;
            }
            if (deletedEntry && show) {
                DeletedData.findOneAndDelete({value: concertHall}, (err, deletedDoc) => {
                    if (err) {
                        console.error('Error removing entry from "deleted_data":', err);
                        res.status(500).send('Error removing entry from "deleted_data"');
                    } else {
                        res.json({existsInBothCollections: true});
                    }
                });
            } else {
                res.json({existsInBothCollections: false});
            }
        });
    });
});


module.exports = route;