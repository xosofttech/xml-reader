// Data Models
const fs = require('fs');
var Shows = require('../Model/shows');
var dir = 'public';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

exports.FetchDetails = async function () {
    var CitiesArr = [], SectionsArr = [];
    CitiesList = await Shows.aggregate([
        {
            $unwind: "$showLocations"
        },
        {
            $group: {
                _id: "$showLocations.city",
                count: {$sum: 1}
            }
        }]);

    CitiesList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "")
            CitiesArr.push(obj._id);
    });


    SectionsList = await Shows.aggregate([
        {
            $group: {
                _id: "$section",
                count: {$sum: 1}
            }
        }]);

    SectionsList.map((obj) => {
        if (obj._id !== undefined && obj._id !== null && obj._id !== "")
            SectionsArr.push(obj._id);
    });
    Object_Array = {'cities': CitiesArr, 'sections': SectionsArr};
    let json = JSON.stringify(Object_Array);
    fs.writeFileSync('public/data.txt', json);
}