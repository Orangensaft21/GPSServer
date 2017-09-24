var mongoose = require('mongoose')

const CheckPointSchema = mongoose.Schema({
  lat:Number,
  lon:Number,
  spot:Number,
  timeDelta:Number
})

const CheckPoint = module.exports = mongoose.model("CheckPoint",CheckPointSchema);
