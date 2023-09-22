const express = require('express');
const route = express.Router();
const Module = require('../Modules/general');
const Shows = require('../Model/shows');
const Devices = require('../Model/devices');
const fs = require('fs');

var ShowsResult = [];
route.post('/fetch-shows', async function (req, res) {

    let isoDate = new Date();
    gteDate = isoDate.toISOString().substring(0, 10);

    filterParams = req.body.filter;
    pageParams = req.body.page;

    var perPage = (pageParams.limit !== undefined && pageParams.limit !== null && pageParams.limit <= 100) ? pageParams.limit : 10; //10docs in single page
    var page = pageParams.page - 1; //1st page

    if (isNaN(parseFloat(page)) || page === undefined) {
        perPage = 10;
        page = 0;
    }
    TodayDate = Module.parseDate(Module.NOW());
    Query = {};
    main_query = {};

    ShowsResult = [];

    if (filterParams.city)
        main_query["showLocations.city"] = new RegExp(filterParams.city, "i");

    if ((filterParams.area && filterParams.area === 'גוש דן') || (filterParams.name && filterParams.name === 'גוש דן')) {
        main_query["showLocations.city"] = {
            $in: [`גריי בר ת"א - פתיחת דלתות 20:00`, `רמת גן`, `תיאטרון חולון`, `תל אביב יפו`, `פתח תקווה`, `איירפורט סיטי היכל התרבות`, `תיאטרון גבעתיים`, `גריי תל אביב -פתיחת דלתות 19:30`, `מוזיאון תל אביב-אסיא-סטריאוטיפי`, `יהוד`, `תיאטרון רמת-גן`, `היכל התרבות ת"א`, `המשכן לאומנויות נס ציונה`, `צוותא תל אביב`, `היכל אומנויות הבמה הרצליה`, `קרית שדה התעופה`, `היכל התרבות ראש העין`, `הרצליה`, `איירפורט סיטי`, `נס ציונה`, `נתניה`, `גריי ת"א- טו באב- פתיחת דלתות 19:30`, `גריי בר יהוד-פתיחת דלתות 12:30`, `ראשון לציון`, `היכל התרבות -ספי ריבלין-נתניה`, `גריי בר-תל אביב - פתיחת דלתות 20:00`, `גריי בר- יהוד - פתיחת דלתות 20:00`, `תל אביב-יפו`, `חולון`, `היכל התרבות ראשון לציון -מופע מצולם`, `מוזיאון תל אביב-אסיא-עקיצה טבעית`, `קרית אונו`, `היכל התרבות ראשון לציון`, `היכל התרבות נתניה`, `בת ים`, `שוהם`, `תל אביב`, `ראש העין`, `היכל התרבות כפר סבא`, `היכל התרבות פתח תקווה`, `גבעת שמואל`, `בית יד לבנים רעננה`, `מועדון הקלצ'ר-פתיחת דלתות שעה 20:00`, `בית העם - רחובות`, `תל מונד `, `רמת השרון`, `המשכן למוסיקה ואומנויות רעננה`, `גריי בר יהוד - פתיחת דלתות 11:00`, `גני תקווה`, `המרכז לאומנויות הבמה שוהם`, `דרום השרון - צומת הירקון`, `כפר סבא-אודיטוריום ספיר`, `מתנ"ס גבעת שמואל`, `גבעת ברנר`, `גריי בר יהוד-פתיחת דלתות 12:30`, `גבעתיים`, `מוזיאון תל אביב-רקנאטי התקפת לב`, `גריי ת"א- טו באב- פתיחת דלתות 19:30`, `בית החייל ת"א -טו באב`, `קיבוץ חולדה`, `רעננה - בית יד לבנים`, `כפר סבא`, `לוד`, `רעננה`, `גריי בר-מודיעין - פתיחת דלתות 20:00`, `גריי בר-יהוד– פתיחת דלתות 19:30`, `רחובות`, `מוזיאון תל אביב-רקאנטי-עקיצה טבעית`, `אולם המופעים-גבעת ברנר`, `היכל התרבות אור יהודה`, `בית ציוני אמריקה – טו באב`, `אלומה הוד השרון`, `קיבוץ גבעת ברנר`, `אוזן בר - פתיחת דלתות 20:00`, `היכל התרבות ת"א-אורחת מיוחדת : אירנה`, `בית ציוני אמריקה-מופע מצולם`, `צומת גלילות`, `קדימה`, `גגרין ת"א - פתיחת דלתות 12:30`, `צוותא 1`, `בית יד לבנים - רמת השרון`]
        }
    } else if ((filterParams.area && filterParams.area === 'ירושלים והסביבה') || (filterParams.name && filterParams.name === 'ירושלים והסביבה')) {
        main_query["showLocations.city"] = {
            $in: [`היכל התרבות-בית העם ירושלים`, `גריי בר מודיעין - פתיחת דלתות 11:00`, `היכל התרבות מודיעין-מכבים רעות`, `לטרון`, `מושב שילת`, `ירושלים`, `בית שמש`, `צומת לטרון`, `מודיעין`, `תיאטרון ירושלים`, `גריי בר מודיעין-פתיחת דלתות 12:30`, `היכל התרבות מודיעין`, `מנזר בית ג'מל`, `היכל התרבות אריאל`, `בית העם ירושלים-פסטיבל הקומדיה ע"ש קישון`, `פסגת זאב`, `מעלה אדומים`, `תיאטרון ירושלים-רבקה קראון`]
        }
    } else if ((filterParams.area && filterParams.area === 'דרום') || (filterParams.name && filterParams.name === 'דרום')) {
        main_query["showLocations.city"] = {
            $in: [`המשכן לאומנויות באר שבע`, `מרכז קהילתי אלוני ציון-אשקלון`, `מונארט אשדוד`, `עומר`, `היכל התרבות אופקים`, `היכל התרבות FRIENDS דימונה`, `גן יבנה`, `אשקלון`, `היכל התרבות אשקלון`, `אשדוד`, `באר שבע`, `יד לבנים - אשדוד`, `מתנס גן יבנה`, `יבנה`, `קיבוץ חצור`, `אולם דולב ערד`, `אופקים`, `היכל התרבות קרית גת`, `קרית גת`, `היכל התרבות יבנה`, `נתיבות`, `קיבוץ כפר מנחם`, `מועצה אזורית גדרות`]
        }
    } else if ((filterParams.area && filterParams.area === 'אילת') || (filterParams.name && filterParams.name === 'אילת')) {
        main_query["showLocations.city"] = {
            $in: [`אילת`]
        }
    } else if ((filterParams.area && filterParams.area === 'חיפה והסביבה') || (filterParams.name && filterParams.name === 'חיפה והסביבה')) {
        main_query["showLocations.city"] = {
            $in: [`קריית מוצקין`, `בנימינה`, `חדרה`, `קיסריה`, `אזור תעשייה עמק חפר`, `בית נגלר קרית חיים-חיפה`, `אודיטוריום חיפה`, `תיאטרון חיפה`, `חיפה`, `מועצה האזורית חוף הכרמל`, `עין הוד`, `קיבוץ יגור`, `היכל התיאטרון-קרית מוצקין`, `אור עקיבא`, `קרית מוצקין`, `טבעון - אולם זוהר`, `תיאטרון הצפון`]
        }
    } else if ((filterParams.area && filterParams.area === 'צפון (צפון + חיפה)') || (filterParams.name && filterParams.name === 'צפון')) {
        main_query["showLocations.city"] = {
            $in: [`בית לחם הגלילית`, `נוף הגליל (נצרת עילית)`, `קיבוץ מזרע`, `בית גבריאל`, `קיבוץ יפעת`, `מושב מנוף`, `צפת`, `קיבוץ כברי`, `מעלות`, `כרמיאל`, `היכל התרבות כרמיאל`, `מושב שבי ציון`, `קיבוץ כנרת`, `היכל התרבות מעלות תרשיחא`, `זכרון יעקב`, `קיבוץ מעיין צבי`, `יוקנעם`, `בית שאן`, `היכל התרבות קריית שמונה`, `כינרת`, `טבריה`, `עפולה`, `היכל התרבות יקנעם`, `נהריה`, `מרכז תרבות מגידו`, `כפר ויתקין`, `כפר בלום - בית העם`, `זכרון יעקב-בית התותחן`, `מועצה אזורית חוף כרמל`, `כפר בלום`, `עכו`, `קיבוץ גן שמואל`, `רנה שני חדרה- טו באב`, `מרכז אומנויות הבמה מתנס פרדס חנה כרכור`, `היכל התרבות מנשה - גן שמואל`, `אולם מופעים קיבוץ כברי`]
        }
    }

    if (filterParams.hall)
        main_query["showLocations.hall"] = new RegExp(filterParams.hall, "i");

    if (filterParams.address)
        main_query["showLocations.address"] = new RegExp(filterParams.address, "i");


    var dateFilter = {};
    if (filterParams.start_date)
        dateFilter.$gte = filterParams.start_date;
    else
        dateFilter.$gte = TodayDate;

    if (filterParams.end_date)
        dateFilter.$lte = filterParams.end_date;

    if (!Module.Empty(dateFilter))
        main_query["showLocations.date"] = dateFilter;


    if (filterParams.name) {
        /*** If Search value mach with any Area then city Arr Fetchd ****/
        var CityRequest;
        if (main_query['showLocations.city'] !== undefined) {
            CityRequest = main_query['showLocations.city'];
            delete main_query['showLocations.city'];
        }
        /*** Else Check in City ****/
        else {
            CityRequest = new RegExp(filterParams.name, "i");
        }
        /*** End ****/
        main_query.$or = [
            {
                name: new RegExp(filterParams.name, "i"),
            },
            {
                section: new RegExp(filterParams.name, "i"),
            },
            {
                "showLocations.city": CityRequest,
            },
            {
                "showLocations.hall": new RegExp(filterParams.name, "i"),
            },
            {
                "showLocations.location": new RegExp(filterParams.name, "i"),
            }
        ]

    }


    if (filterParams.show_id)
        main_query.show_id = new RegExp(filterParams.show_id, "i");

    if (filterParams.isDiscount && filterParams.isDiscount === 1)
        main_query.discount = 1;

    if (filterParams.issuperprice && filterParams.issuperprice === 1)
        main_query.superprice = 1;

    SectionArr = (filterParams.section = undefined && filterParams.section !== "" && filterParams.section.length != 0) ? splitStr(filterParams.section, ',') : "";

    console.log(filterParams.section)
    console.log(SectionArr)

    if (filterParams.section && Array.isArray(SectionArr)) {
        var SectionSearchArr = [];

        if (filterParams.section.includes("הרצאות")) {
            SectionSearchArr.push(new RegExp(`הרצאות`, "i"));
        }
        if (filterParams.section.includes("תערוכות")) {
            SectionSearchArr.push(new RegExp(`תערוכות`, "i"));
        }
        if (filterParams.section.includes("אופרה")) {
            SectionSearchArr.push(new RegExp(`אופרה`, "i"));
        }
        if (filterParams.section.includes("מחול ובלט")) {
            SectionSearchArr.push(new RegExp(`הופעות מחול ובלט,`, "i"));
        }
        if (filterParams.section.includes("מחזמר")) {
            SectionSearchArr.push(new RegExp(`מחזמר`, "i"));
        }
        if (filterParams.section.includes("הצגות ילדים")) {
            SectionSearchArr.push(new RegExp(`הצגות ילדים`, "i"));
            SectionSearchArr.push(new RegExp(`קרקס`, "i"));
            SectionSearchArr.push(new RegExp(`מוסיקה לילדים`, "i"));
        }
        if (filterParams.section.includes("סטנדאפ")) {
            SectionSearchArr.push(new RegExp(`סטנדאפ`, "i"));
            SectionSearchArr.push(new RegExp(`סטנד אפ`, "i"));
        }
        if (filterParams.section.includes("הצגות")) {
            SectionSearchArr.push(new RegExp(`הצגות`, "i"));
        }
        if (filterParams.section.includes("הופעות")) {
            SectionSearchArr.push(new RegExp(`הופעות מוזיקה`, "i"));
            SectionSearchArr.push(new RegExp(`הופעות רוק`, "i"));
            SectionSearchArr.push(new RegExp(`הופעות מוזיקה קלאסית`, "i"));
            SectionSearchArr.push(new RegExp(`הופעות ג'אז ובלוז`, "i"));
        }

        if (SectionSearchArr.length !== 0)
            main_query.section = {$in: SectionSearchArr};
    }

    //console.log(SectionSearchArr);

    if (filterParams.Not_in_Shabath && filterParams.Not_in_Shabath === true) {
        main_query.$or = [
            {
                "showLocations.day": {$in: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"]},
            },
            {
                "showLocations.day": "Friday",
                "showLocations.time": {$lt: "16:00"}
            },
            {
                "showLocations.day": "Saturday",
                "showLocations.time": {$gt: "18:00"}
            }
        ];
    }

    ShowsResult = await Shows.aggregate([
        {
            $unwind: "$showLocations"
        },
        {
            $project: {
                _id: 0,
                showObj: 0
            }
        },
        {
            $match: main_query
        },
        {
            $sort: {"showLocations.date": 1, "showLocations.time": 1}
        },
        {
            $skip: perPage * page
        },
        {
            $limit: perPage
        }
    ]);


    Rows = await Shows.aggregate([
        {
            $unwind: "$showLocations"
        },
        {
            $project: {
                _id: 0,
                showObj: 0
            }
        },
        {
            $match: main_query
        },
        {
            $group: {
                _id: null,
                count: {$sum: 1}
            }
        }
    ]);

    TotalRows = (Rows !== undefined && Rows.length !== 0) ? Rows[0].count : 0

    console.log('Mobile Req:', req.body);
    console.log('Mobile:', main_query);

    res.send({
        "result": ShowsResult,
        "TotalRecords": TotalRows,
        "CurrPage": pageParams.page,
        "Totalpages": (Math.ceil(TotalRows / perPage))
    });

});

route.post('/register-device', async function (req, res) {
    try {
        var deviceID = req.body.deviceID;
        var deviceIP = req.body.deviceIP;
        var deviceType = req.body.device;
        var NotificationStatus = req.body.NotificationStatus;
        var TokenAccess = req.body.tokenAccess;

        Devices.findOne({deviceID: deviceID}, async function (err, deviceData) {
            if (deviceData === null) {
                var obj = new Devices({
                    deviceID: deviceID,
                    deviceIP: deviceIP,
                    deviceType: deviceType,
                    tokenAccess: TokenAccess,
                    NotificationStatus: NotificationStatus
                });
                await obj.save();
            } else {
                await Devices.updateOne({deviceID: deviceID}, {
                    deviceID: deviceID,
                    deviceIP: deviceIP,
                    tokenAccess: TokenAccess,
                    NotificationStatus: NotificationStatus
                })
            }
            res.send({"error": false, "message": "Updated Successfully"});
        });
    } catch (err) {
        res.send({"error": true, "message": "Failed", "Required Fields": "deviceID, deviceIP & NotificationStatus"});
    }
});

/*route.post('/fetch-data', async function (req, res) {
    try {
        if (fs.existsSync('public/data.txt')) {
            const data = fs.readFileSync('public/data.txt', 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        } else {
            res.send({"cities": [], "sections": []});
        }
    } catch (err) {
        res.send({"cities": [], "sections": []});
    }
});*/


function splitStr(str, separator) {
    // Function to split string
    return str.split(separator);
}

module.exports = route