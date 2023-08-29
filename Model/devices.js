const mongoose = require("mongoose");
const Module = require('../Modules/general');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    deviceID: {
        type: "String",
        default: "",
        //unique: true
    },
    deviceIP: {
        type: "String",
        default: ""
    },
    NotificationStatus: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Module.NOW()
    },
}, {versionKey: false});

module.exports = mongoose.model('device', DeviceSchema);

