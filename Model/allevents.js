//var {dburl} = require('../config');
var mongoose = require('mongoose');
const Module = require('../Modules/general');
var Schema = mongoose.Schema;

var AllEventsSchema = new Schema({
    show_id: {
        type: "String",
        default: "",
    },
    domain: {
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
    showDescription: {
        type: "String",
        default: "",
    },
    showLocations: {
        type: Object,
        default: {}
    },
    Created: {
        type: Date,
        default: Module.NOW()
    }
}, {versionKey: false});

module.exports = mongoose.model('AllEvents', AllEventsSchema);
