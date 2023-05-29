//var {dburl} = require('../config');
var mongoose = require('mongoose');
const Module = require('../Modules/general');
var Schema = mongoose.Schema;

var ComySchema = new Schema({
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
    category: {
        type: "String",
        default: "",
    },
    day: {
        type: "String",
        default: "",
    },
    price: {
        type: "String",
        default: "",
    },
    date: {
        type: "String",
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
    showDescription: {
        type: "String",
        default: "",
    },
    description: {
        type: "String",
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
    objStatus: {
        type: Boolean,
        default: true
    },
    Created: {
        type: Date,
        default: Module.NOW()
    }
}, {versionKey: false});

module.exports = mongoose.model('Comy', ComySchema);
