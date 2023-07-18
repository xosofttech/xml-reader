// Data Models
const fs = require('fs');
var Shows = require('../Model/shows');
var dir = 'public';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

exports.FetchDetails = async function () {
    var CitiesArr = [], HallArr = [],
        SectionsArr = [`הרצאות`, `תערוכות`, `אופרה`, `מחול ובלט`, `מחזמר`, `הצגות ילדים`, `סטנדאפ`, `הצגות`, `הופעות`];
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
            $sort: {_id: 1}
        }]);

    CitiesList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "" && obj._id !== "0")
            CitiesArr.push(obj._id);
    });


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