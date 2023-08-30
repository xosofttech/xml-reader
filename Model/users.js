const mongoose = require("mongoose");
const Module = require('../Modules/general');
var Schema = mongoose.Schema;



var UserSchema = new Schema({
  email: {
    type: "String",
    default: "",
     unique: true
  },

  username: { 
    type: "String",
    default: ""
   },
  password: { 
    type: "String",
    default: ""
   },
  createdAt: {
    type: Date,
    default: Module.NOW()
  },
}, { versionKey: false });

module.exports = mongoose.model('user', UserSchema);

