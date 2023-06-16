const express = require('express');
const route = express.Router();
const Module = require('../Modules/general');
var Config = require('../config');
const {JSON} = require('../Modules/allowed-Extensions');
var Shows = require('../Model/shows');
var ObjectId = require('mongodb').ObjectId;


route.get('/', function (req, res) {
    res.send(`<center style="margin-top: 10%;"><h1> XML Shows</h1></center>`);
});

route.get('/healthcheck', function (req, res) {
    res.send(res.statusCode.toString());
});

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

    if (filterParams.area && filterParams.area === 'גוש דן') {
        main_query["showLocations.city"] = {
            $in: [`גריי בר ת"א - פתיחת דלתות 20:00`, `רמת גן`, `תיאטרון חולון`, `תל אביב יפו`, `פתח תקווה`, `איירפורט סיטי היכל התרבות`, `תיאטרון גבעתיים`, `גריי תל אביב -פתיחת דלתות 19:30`, `מוזיאון תל אביב-אסיא-סטריאוטיפי`, `יהוד`, `תיאטרון רמת-גן`, `היכל התרבות ת"א`, `המשכן לאומנויות נס ציונה`, `צוותא תל אביב`, `היכל אומנויות הבמה הרצליה`, `קרית שדה התעופה`, `היכל התרבות ראש העין`, `הרצליה`, `איירפורט סיטי`, `נס ציונה`, `נתניה`, `גריי ת"א- טו באב- פתיחת דלתות 19:30`, `גריי בר יהוד-פתיחת דלתות 12:30`, `ראשון לציון`, `היכל התרבות -ספי ריבלין-נתניה`, `גריי בר-תל אביב - פתיחת דלתות 20:00`, `גריי בר- יהוד - פתיחת דלתות 20:00`, `תל אביב-יפו`, `חולון`, `היכל התרבות ראשון לציון -מופע מצולם`, `מוזיאון תל אביב-אסיא-עקיצה טבעית`, `קרית אונו`, `היכל התרבות ראשון לציון`, `היכל התרבות נתניה`, `בת ים`, `שוהם`, `תל אביב`, `ראש העין`, `היכל התרבות כפר סבא`, `היכל התרבות פתח תקווה`, `גבעת שמואל`, `בית יד לבנים רעננה`, `מועדון הקלצ'ר-פתיחת דלתות שעה 20:00`, `בית העם - רחובות`, `תל מונד `, `רמת השרון`, `המשכן למוסיקה ואומנויות רעננה`, `גריי בר יהוד - פתיחת דלתות 11:00`, `גני תקווה`, `המרכז לאומנויות הבמה שוהם`, `דרום השרון - צומת הירקון`, `כפר סבא-אודיטוריום ספיר`, `מתנ"ס גבעת שמואל`, `גבעת ברנר`, `גריי בר יהוד-פתיחת דלתות 12:30`, `גבעתיים`, `מוזיאון תל אביב-רקנאטי התקפת לב`, `גריי ת"א- טו באב- פתיחת דלתות 19:30`, `בית החייל ת"א -טו באב`, `קיבוץ חולדה`, `רעננה - בית יד לבנים`, `כפר סבא`, `לוד`, `רעננה`, `גריי בר-מודיעין - פתיחת דלתות 20:00`, `גריי בר-יהוד– פתיחת דלתות 19:30`, `רחובות`, `מוזיאון תל אביב-רקאנטי-עקיצה טבעית`, `אולם המופעים-גבעת ברנר`, `היכל התרבות אור יהודה`, `בית ציוני אמריקה – טו באב`, `אלומה הוד השרון`, `קיבוץ גבעת ברנר`, `אוזן בר - פתיחת דלתות 20:00`, `היכל התרבות ת"א-אורחת מיוחדת : אירנה`, `בית ציוני אמריקה-מופע מצולם`, `צומת גלילות`, `קדימה`, `גגרין ת"א - פתיחת דלתות 12:30`, `צוותא 1`, `בית יד לבנים - רמת השרון`]
        }
    } else if (filterParams.area && filterParams.area === 'ירושלים והסביבה') {
        main_query["showLocations.city"] = {
            $in: [`היכל התרבות-בית העם ירושלים`, `גריי בר מודיעין - פתיחת דלתות 11:00`, `היכל התרבות מודיעין-מכבים רעות`, `לטרון`, `מושב שילת`, `ירושלים`, `בית שמש`, `צומת לטרון`, `מודיעין`, `תיאטרון ירושלים`, `גריי בר מודיעין-פתיחת דלתות 12:30`, `היכל התרבות מודיעין`, `מנזר בית ג'מל`, `היכל התרבות אריאל`, `בית העם ירושלים-פסטיבל הקומדיה ע"ש קישון`, `פסגת זאב`, `מעלה אדומים`, `תיאטרון ירושלים-רבקה קראון`]
        }
    } else if (filterParams.area && filterParams.area === 'דרום') {
        main_query["showLocations.city"] = {
            $in: [`המשכן לאומנויות באר שבע`, `מרכז קהילתי אלוני ציון-אשקלון`, `מונארט אשדוד`, `עומר`, `היכל התרבות אופקים`, `היכל התרבות FRIENDS דימונה`, `גן יבנה`, `אשקלון`, `היכל התרבות אשקלון`, `אשדוד`, `באר שבע`, `יד לבנים - אשדוד`, `מתנס גן יבנה`, `יבנה`, `קיבוץ חצור`, `אולם דולב ערד`, `אופקים`, `היכל התרבות קרית גת`, `קרית גת`, `היכל התרבות יבנה`, `נתיבות`, `קיבוץ כפר מנחם`, `מועצה אזורית גדרות`]
        }
    } else if (filterParams.area && filterParams.area === 'אילת') {
        main_query["showLocations.city"] = {
            $in: [`אילת`]
        }
    } else if (filterParams.area && filterParams.area === 'חיפה והסביבה') {
        main_query["showLocations.city"] = {
            $in: [`קריית מוצקין`, `בנימינה`, `חדרה`, `קיסריה`, `אזור תעשייה עמק חפר`, `בית נגלר קרית חיים-חיפה`, `אודיטוריום חיפה`, `תיאטרון חיפה`, `חיפה`, `מועצה האזורית חוף הכרמל`, `עין הוד`, `קיבוץ יגור`, `היכל התיאטרון-קרית מוצקין`, `אור עקיבא`, `קרית מוצקין`, `טבעון - אולם זוהר`, `תיאטרון הצפון`]
        }
    } else if (filterParams.area && filterParams.area === 'צפון (צפון + חיפה)') {
        main_query["showLocations.city"] = {
            $in: [`בית לחם הגלילית`, `נוף הגליל (נצרת עילית)`, `קיבוץ מזרע`, `בית גבריאל`, `קיבוץ יפעת`, `מושב מנוף`, `צפת`, `קיבוץ כברי`, `מעלות`, `כרמיאל`, `היכל התרבות כרמיאל`, `מושב שבי ציון`, `קיבוץ כנרת`, `היכל התרבות מעלות תרשיחא`, `זכרון יעקב`, `קיבוץ מעיין צבי`, `יוקנעם`, `בית שאן`, `היכל התרבות קריית שמונה`, `כינרת`, `טבריה`, `עפולה`, `היכל התרבות יקנעם`, `נהריה`, `מרכז תרבות מגידו`, `כפר ויתקין`, `כפר בלום - בית העם`, `זכרון יעקב-בית התותחן`, `מועצה אזורית חוף כרמל`, `כפר בלום`, `עכו`, `קיבוץ גן שמואל`, `רנה שני חדרה- טו באב`, `מרכז אומנויות הבמה מתנס פרדס חנה כרכור`, `היכל התרבות מנשה - גן שמואל`, `אולם מופעים קיבוץ כברי`]
        }
    }

    if (filterParams.hall)
        main_query["showLocations.hall"] = new RegExp(filterParams.hall, "i");

    if (filterParams.address)
        main_query["showLocations.address"] = new RegExp(filterParams.address, "i");

    /*if (filterParams.start_date)
        main_query["showLocations.date"] = {$gte: filterParams.start_date}
    else
        main_query["showLocations.date"] = {$gte: TodayDate}

    if (filterParams.end_date)
        main_query["showLocations.date"] = {$lte: filterParams.end_date}*/

    var dateFilter = {};
    if (filterParams.start_date)
        dateFilter.$gte = filterParams.start_date;
    else
        dateFilter.$gte = TodayDate;

    if (filterParams.end_date)
        dateFilter.$lte = filterParams.end_date;

    if (!Empty(dateFilter))
        main_query["showLocations.date"] = dateFilter;

    /*if (!filterParams.date)
        Query.date = {$gte: gteDate};*/

    if (filterParams.name)
        main_query.name = new RegExp(filterParams.name, "i");

    if (filterParams.show_id)
        main_query.show_id = new RegExp(filterParams.show_id, "i");

    if (filterParams.section && Array.isArray(filterParams.section)) {
        var SectionSearchArr = [];
        filterParams.section.map((Section_obj) => {
            SectionSearchArr.push(new RegExp(Section_obj, "i"));
        })
        if (SectionSearchArr.length !== 0)
            main_query.section = {$in: SectionSearchArr};
    }

    if (filterParams.Not_in_Shabath && filterParams.Not_in_Shabath === true) {
        main_query.$or = [
            {
                "showLocations.day": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
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

    console.log(main_query);

    res.send({
        "result": Object.assign({}, ShowsResult),
        "TotalRecords": TotalRows,
        "CurrPage": pageParams.page,
        "Totalpages": (Math.ceil(TotalRows / perPage))
    });

});


function Empty(object) {
    return Object.keys(object).length === 0
}


//checkDatesinShows();

function checkDatesinShows() {
    Shows.aggregate(
        [
            {
                $match: {
                    //show_id: "summerinthecity",
                    "showLocations.day": {$exists: false}, showLocations: {$ne: []}
                }
            }
        ], async function (err, show_result) {
            //console.log(show_result);
            (async function () {
                for ([index, object] of show_result.entries()) {
                    //    console.log(object);
                    for ([index1, object1] of object.showLocations.entries()) {
                        object1.day = GetDay(object1.date);
                        //      console.log(object1);
                    }
                    //console.log(object.show_id);
                    await Shows.updateOne({_id: ObjectId(object._id)}, {showLocations: object.showLocations});
                    console.log(object._id, "Updated");
                }

                //console.log(show_result);
            })();
        });
}

// Shows.deleteMany({showLocations:{ $exists: true, $size: 0}}, function (err, resp) {
//     console.log(resp);
// })


function GetDay(DateStr) {
    try {
        const data = new Date(DateStr);
        const day = data.getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[day];
    } catch (e) {
        return "";
    }
}

module.exports = route