var io = require('socket.io')(3002)
var serverIo = require('socket.io')(3003)
var fs = require('fs')
var {user,pwd} = require('./config.json')
var mongoose = require('mongoose')
var d3 = require('d3')
const path = require('path');




/*
  Mainclass, hier sollten noch einige Funktionen ausgelagert werden
  TODO:
   - COORDS in Datenbank/Extradatei
*/

let conn = `mongodb://${user}:${pwd}@localhost:27017/gpsapp`
mongoose.connect(conn)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

let coordsRobSchum = [[ 49.977376, 7.081916],
              [ 49.977498, 7.082554],
              [ 49.977127, 7.082847],
              [ 49.975834, 7.080333],
              [ 49.976496, 7.079528]]

let coordsNorma = [[ 49.977376, 7.081916],
              [ 49.976496, 7.079528],
              [ 49.975093, 7.076811],
              [ 49.974331, 7.077028],
              [ 49.975093, 7.076811],
              [ 49.976496, 7.079528]]

let coordsSportplatz = [[49.957243, 7.104543],
                        [49.957997, 7.103231]]

let coordsNeukauf =  [[49.977376, 7.081916],
                      [49.983611, 7.095585],
                      [49.978286, 7.108306],
                      [49.957351, 7.105065],
                      [49.951377, 7.122239]]
//change

var CheckPoint = mongoose.model("CheckPoint", {lat:Number, lon:Number, spot:Number, time:Number})
var Route = mongoose.model("Route", {name: {type: String, unique:true, required:true}, checkpoints:[]})
var Position = mongoose.model("Position", {id: String, lat:Number, lon: Number, time: Number}) // time in milliseconds


function createRoute(rname,coords,callback){
  let route = new Route({name:rname, checkpoints:[]})
  coords.forEach((coord,i)=>{
    let checkPoint = new CheckPoint({lat:coord[0], lon:coord[1],spot:(i+1)})
    route.checkpoints.push(checkPoint)
  })
  //console.log(route);
  //route.save()
  console.log(route);
  callback(route);
}
function saveRouteFromJSON(routeData){
  let route = new Route(routeData)
  console.log("new route")
  console.log(route)

  route.save()
}

function loadRoute(rname,callback){
  Route.findOne({name:rname},(err,route)=>{
    if (err) return console.log("route nicht geladen")
    console.log(route);
    callback(route);
  })
}

function emitRank(lapTime,routeName,callback){
  d3.csv('file://'+path.join(__dirname,`${routeName}-Rekorde.csv`), function(data){
    let rank=1
    for (x of data){
      if (x["Laptime"]-lapTime<0){
        rank+=1
      }
    }
    callback(rank)
  });
}

io.on('connection', (socket) => {


  socket.on('test1', (msg) =>{
    /*console.log(`${msg.id} ${msg.location.lat} ${msg.location.lon} ${new Date().toISOString()}`)
    fs.appendFile(`${msg.id} ${new Date().toISOString().slice(0,10)}`,
      `${msg.id} ${msg.location.lat} ${msg.location.lon} ${new Date().toISOString().slice(11,-1)}\n`,()=>{})
    */
  })

  socket.on('reqcheck', (msg) => {
    //msg wird route beinhalten
    switch (msg) {
      case "RobSchumRoute":
        loadRoute("Robert-Schuman-Route",(createdRoute)=>{
          socket.emit('route',createdRoute);
        })
        /*createRoute("Robert-Schuman-Route",coordsRobSchum,(createdRoute) =>{
          socket.emit('route',createdRoute);
        })*/
        break;
      case "NormaRoute":
        createRoute("Norma Route",coordsNorma,(createdRoute) =>{
          socket.emit('route',createdRoute);
        })
        break;
      case "Sportplatz":
        createRoute("Sportplatz Lap",coordsSportplatz,(createdRoute) =>{
          socket.emit('route',createdRoute);
        })
        break;
      case "Neukauf":
        createRoute("Neukauf Hin",coordsNeukauf,(createdRoute) =>{
          socket.emit('route',createdRoute);
        })
        break;
    }
  })

  socket.on('finish', (msg) => {
    row=`${msg.times}`
    fs.appendFile(`${msg.routeName}-Rekorde.csv`,
      row+'\n',()=>{})
    row = row.split(",")
    let LapTime = row[row.length-1];
    //schicke an server 2 die Lapdaten

    emitRank(LapTime,msg.routeName,(erg)=>{
      console.log(erg)
      if (erg === 1){
        io.emit("zieldurchsage","New World Record")
      }
      socket.emit("zieldurchsage","You finished with Rank "+erg)
      socket.broadcast.emit("zieldurchsage", row[0]+ " finished with Rank "+erg)
    })
  });

  socket.on('route', (route) =>{
    console.log(route)
    saveRouteFromJSON(route)
  })

  socket.on('getRouteNames',()=>{

    let r = Route.find({},{_id:0,name:1})
    console.log(r)
  })

  console.log('client connected')
  socket.on('disconnect', ()=>{
    //stream.end() //add listener for button
  })
})

//175,70€
