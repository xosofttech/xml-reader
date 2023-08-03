// Data Models
const fs = require('fs');
var Shows = require('../Model/shows');
var BlockedData = require('../Model/BlockedData');
var dir = 'public';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

exports.FetchDetails = async function () {
    var CitiesArr = [], HallArr = [],
        SectionsArr = [`הרצאות`, `תערוכות`, `אופרה`, `מחול ובלט`, `מחזמר`, `הצגות ילדים`, `סטנדאפ`, `הצגות`, `הופעות`],
        DelCityArr = [], DelHallArr = [];

    BlockedCities = await BlockedData.find({type: "City"}, {_id: 0, value: 1});
    if (BlockedCities !== undefined && BlockedCities.length !== 0)
        BlockedCities.map(function (obj) {
            DelCityArr.push(obj.value);
        })

    CitiesList = await Shows.aggregate([
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
            $match: {
                _id: {$nin: DelCityArr}
            }
        },
        {
            $sort: {_id: 1}
        }]);

    CitiesList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "" && obj._id !== "0")
            CitiesArr.push(obj._id);
    });


    BlockedHalls = await BlockedData.find({type: "Hall"}, {_id: 0, value: 1});
    if (BlockedHalls !== undefined && BlockedHalls.length !== 0)
        BlockedHalls.map(function (obj) {
            DelHallArr.push(obj.value);
        })

    HallList = await Shows.aggregate([
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
            $match: {
                _id: {$nin: DelHallArr}
            }
        },
        {
            $sort: {_id: 1}
        }]);


    HallList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "" && obj._id !== "0")
            HallArr.push(obj._id);
    });

    /*SectionsList = await Shows.aggregate([
        {
            $group: {
                _id: "$section",
                count: {$sum: 1}
            }
        }]);

    SectionsList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "")
            SectionsArr.push(obj._id);
    });*/
    Object_Array = {'cities': CitiesArr, 'sections': SectionsArr, 'hall': HallArr};
    let json = JSON.stringify(Object_Array);
    fs.writeFileSync('public/data.txt', json);
}