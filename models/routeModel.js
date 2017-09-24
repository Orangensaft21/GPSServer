let mongoose = require('mongoose');

const RouteSchema = mongoose.Schema({
  name: {
    type: String,
    required:true,
    unique:true
  },
  checkpoints: [],
  times: []
})

const Route = module.exports = mongoose.model("Route",RouteSchema);

module.exports.loadRoute = function(rname, callback){
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

module.exports.addTime = function(routeName,time){

  Route.findOneAndUpdate({name:routeName},{$push:{times:time}},(err)=>{
    if (err)
      console.log("kann zeiten nicht eintragen")
  })


}

module.exports.getFastest = function(routeName){
  Route.findOne({name:routeName})
  Route.aggregate([
        {
          $match: {
              name: {$eq: routeName}
          }
        },
        {
          $unwind:"$times"
        },
        {
            $group: {
                _id: "$_id",  //mongo db result always needs an _id
                data_min: {$min: "$times"}
            }
        },
        {
            $group: {
                _id: 1,  //mongo db result always needs an _id
                min: {$min: "$data_min"}
            }
        },
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            console.log(result[0].min);
        }
    });
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
