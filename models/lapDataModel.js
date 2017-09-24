var mongoose = require('mongoose')

let lapDataSchema = mongoose.Schema({
  routeName:{                     //wird für spätere Zwecke vielleicht noch benötigt
    type:String,
    required:true
  },
  nickName:{
    type:String,
    required:true
  },
  lapTime:{
    type:Number,
    required:true
  },
  checkTimes: [ ],            //bitte nicht einfach mit zahlen füllen, sondern mit JSONObjects
  timeStamp:Date              // Bsp: {check1:1245ms}
})


const LapData = module.exports = mongoose.model('LapData', lapDataSchema);
