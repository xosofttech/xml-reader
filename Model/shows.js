//var {dburl} = require('../config');
var mongoose = require('mongoose');
const Module = require('../Modules/general');
var Schema = mongoose.Schema;

var ShowSchema = new Schema({
    show_id: {
        type: "String",
        default: "",
    },
    domain: {
        type: "String",
        default: "",
    },
    section: {
        type: "String",
        default: "",
    },
    link: {
        type: "String",
        default: "",
    },
    name: {
        type: "String",
        default: "",
    },
    date: {
        type: Date,
        default: "",
    },
   /* time: {
        type: "String",
        default: "",
    },
    city: {
        type: "String",
        default: "",
    },
    address: {
        type: "String",
        default: "",
    },
    hall: {
        type: "String",
        default: "",
    },*/
    tickets: {
        type: Number,
        default: "",
    },
    priceMin: {
        type: Number,
        default: "",
    },
    priceMax: {
        type: Number,
        default: "",
    },
    dateTo: {
        type: Date,
        default: "",
    },
    dateFrom: {
        type: Date,
        default: "",
    },
    pubDate: {
        type: Date,
        default: "",
    },
    showLocations: {
        type: Object,
        default: {}
    },
    showObj: {
        type: Array,
        default: []
    },
    Created: {
        type: Date,
        default: Module.NOW()
    }
}, {versionKey: false});

module.exports = mongoose.model('shows', ShowSchema);
