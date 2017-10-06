let mongoose = require('mongoose')
let LapData = require('./lapDataModel')

const RouteSchema = mongoose.Schema({
  name: {
    type: String,
    required:true,
    unique:true
  },
  checkpoints: []
})

const Route = module.exports = mongoose.model("Route",RouteSchema);

module.exports.loadRoute = function(rname, callback){
  Route.findOne({name:rname},(err,route)=>{
    if (err) return console.log("route nicht geladen")
    console.log(route)
    callback(route)
  })
}
module.exports.getFastestLap=function(rname,callback){
  Route.getFastestXLaps(rname,(err,cb)=>{
    if (err) {
      callback(new Error("keine bestzeit gefunden"))
      return;
    }
    callback(null,cb.checkTimes.toString());
  })
  Route.findOne({name:rname},(err,result)=>{
    if (err) return console.log("route nicht geladen")
    console.log(result)
    callback(result);
  })
}
//export Route without laptime data
module.exports.exportRoute = function(route, callback){
  route.times = []
}

module.exports.addTime = function(routeName,nickName,time){

  time=time.slice(1,time.length-1)
  console.log(time[0])

  let lapEintrag = new LapData({
    routeName:routeName,
    lapTime:time[0],
    nickName:nickName,
    checkTimes:time.map((t)=>parseInt(t))
    //checkTimes:time.slice(1,time.length)
  })
  lapEintrag.save()
    //route.lapdata.push(lapEintrag)
    //console.log('loop')

    //irgendwie besser updaten plz!
    //und nur referenz auf lapeintrag speichern!


    //route.save()
}

module.exports.getFastestXLaps = function(routeName,callback){
  selectedCheck=0                 //0=laptime, 1=check1 usw.
  //check if lapentry exists
  //geht vielleicht besser im aggregate
  LapData.findOne({"routeName":routeName},(err,obj)=>{
    if (err || !obj){
      callback (new Error("kacke"))
      console.log("error: " + err + ", obj: " + obj);
      return;
    }

    LapData.aggregate([
      {$match:{"routeName":routeName}},
      {$project:{"name":"$nickName",
                 "checkTimes":"$checkTimes",
                 "suchCheckValue":{$arrayElemAt:["$checkTimes",selectedCheck]}}
      },
      {$sort:{"suchCheckValue":1}},
      {$limit:2},
    ],(err, erg)=>{
      if (err) return
      console.log(erg)
      callback(null,erg[0])
    })

  })


  /*LapData.aggregate([
    {$match:{"routeName":routeName}},
    {$project:{
               "suchCheck":{$arrayElemAt:["$checkTimes",selectedCheck]}}
    },
    {$group:  {
                _id:"suchCheck",
                min_element:{$min:"$suchCheck"}}
    }
  ],(err, erg)=>{
    console.log(erg)
  })*/
  /*LapData.aggregate([
    {$match:{"routeName":routeName}},
    {$unwind:{path:"$checkTimes",includeArrayIndex:"arrayIndex"}},
    //{$sort:{"checkTimes":1}}, //dirty trick! part 1
    {$group:  {
                _id:"$arrayIndex",
                //data: { $push: "$$ROOT" },
                //name: { $first: "$nickName" }, //dirty trick! part 2
                //data: { $push: {nickName:"$nickName",data:"$checkTimes" }},
                min_element:{$min:"$checkTimes"} },
    }
    //{$match:{"$min_element":"$data.data"}}
  ],(err,erg)=>{
    //console.log(erg)
    console.log(erg)
  })*/




}
module.exports.addTime = function(routeName,time){

  Route.findOneAndUpdate({name:routeName},{$push:{times:time}},(err)=>{
    if (err)
      console.log("kann zeiten nicht eintragen")
  })


}


/*
Route.aggregate([
      {
          $group: {
              _id: 2,  //mongo db result always needs an _id
              min: {$min: "$name"}
          }
      }
  ], function (err, result) {
      if (err) {
          next(err);
      } else {
          console.log(result);
      }
  });
*/
