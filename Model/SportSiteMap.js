var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Module = require('../Modules/general');


var SportSiteMapSchema = new Schema({
    show_id: {
        type: String,
        default: "",
        index: true
    },
    domain: {
        type: String,
        default: "",
    },
    leagueName: {
        type: String,
        default: "",
    },
    gameType: {
        type: String,
        default: "",
    },
    teamNames: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    stadium: {
        type: String,
        default: "",
    },
    date: {
        type: String, // You can change this to a Date type if date is in a specific format
        default: "",
    },
    price: {
        type: String, // You can change this to a Number type if price is numeric
        default: "",
    },
    link: {
        type: String,
        default: "",
    },
    Created: {
        type: Date,
        default: Module.NOW()
    },
    Updated: {
        type: Date,
        default: Module.NOW()
    }
}, {versionKey: false});

module.exports = mongoose.model('SportSiteMap', SportSiteMapSchema);
