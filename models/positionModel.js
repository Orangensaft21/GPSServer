var mongoose = require('mongoose');

let PositionSchema = new mongoose.Schema({
  id: {
    type:String,
    required:true,
    unique:true
  },
  lat:Number,
  lon:Number,
  time:Number
})

const Position = module.exports = mongoose.model("Position",PositionSchema)
