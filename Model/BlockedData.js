var mongoose = require('mongoose');
const Module = require('../Modules/general');
var Schema = mongoose.Schema;

var DataSchema = new Schema({
    value: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "",
    },
    Created: {
        type: Date,
        default: Module.NOW()
    }
}, {versionKey: false});

module.exports = mongoose.model('deleted_data', DataSchema, 'deleted_data');
