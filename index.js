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

let coordsKinheimWolf = [[49.977376, 7.081916],
                         [49.973386, 7.068648],
                         [49.970373, 7.054338],
                         [49.981314, 7.102976],
                         [49.983609, 7.095602]]
//change

var CheckPoint = require('./models/checkPointModel')
var Route = require('./models/routeModel')
var Position = require('./models/positionModel')

function createRoute(rname,coords,callback){
  let route = new Route({name:rname, checkpoints:[]})
  coords.forEach((coord,i)=>{
    let checkPoint = new CheckPoint({lat:coord[0], lon:coord[1],spot:(i+1)})
    route.checkpoints.push(checkPoint)
  })
  //console.log(route);
  //route.save()
  console.log('ROUTE' + rname + 'CREATED!!!!');
  callback(route);
}
function saveRouteFromJSON(routeData){
  let route = new Route(routeData)
  console.log("new route")
  console.log(route)

  route.save()
}

/*createRoute("Robert-Schuman-Route",coordsRobSchum,(ro)=>{
  //saveRouteFromJSON(ro);
});
*/
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

//für unit test
for (i=1;i<1;i++){

  let times = [15,199989,35,993,1354979,1578008]
  times = times.map((t)=>Math.round(Math.random()*t))
  finish(  { times: 'mock,'+times.join(),
      routeName: 'Robert-Schuman-Route',
      name: 'mock3' } )
}
/*setInterval(function () {
  let times = [10000,20000,30000,40000,50000,10000]
  times = times.map((t)=>Math.round(Math.random()*t))
  finish(  { times: 'mock,'+times.join(),
      routeName: 'Robert-Schuman-Route',
      name: 'eprStefan' } )
}, 50)*/

function finish(msg){
  console.log(msg)
  row=`${msg.times}`
  fs.appendFile(`${msg.routeName}-Rekorde.csv`,
    row+'\n',()=>{})
  row = row.split(",")
  let LapTime = row[row.length-1];
  //schicke an server 2 die Lapdaten
  Route.addTime(msg.routeName, msg.name, row)

  console.log(row)

  /*emitRank(LapTime,msg.routeName,(erg)=>{
    console.log(erg)
    if (erg === 1){
      io.emit("zieldurchsage","New World Record")
    }
    socket.emit("zieldurchsage","You finished with Rank "+erg)
    socket.broadcast.emit("zieldurchsage", row[0]+ " finished with Rank "+erg)
  })*/
}
console.log("server started")
io.on('connection', (socket) => {


  socket.on('test1', (msg) =>{
    /*console.log(`${msg.id} ${msg.location.lat} ${msg.location.lon} ${new Date().toISOString()}`)
    fs.appendFile(`${msg.id} ${new Date().toISOString().slice(0,10)}`,
      `${msg.id} ${msg.location.lat} ${msg.location.lon} ${new Date().toISOString().slice(11,-1)}\n`,()=>{})
    */
  })

  socket.on('requestcheckpoints', (msg) => {

    //msg wird route als String beinhalten

    //msg wird route beinhalten

    console.log(msg + ' requested')
    Route.loadRoute(msg,(createdRoute)=>{
      socket.emit('route',createdRoute)
    })
    Route.getFastestLap(msg,(err,stats)=>{
      if (err){
        console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
        socket.emit('statistics',"NOTIMES")
      }

      else {
        console.log("fastest lap\n"+stats)
        socket.emit('statistics',stats)
      }
    })


  })

  socket.on('finish', (msg) => {
    finish(msg);
  });

  socket.on('route', (route) =>{
    console.log(route)
    saveRouteFromJSON(route)
  })

  socket.on('getRouteNames',()=>{
    //Route.find({},{_id:0,name:1})
    let r = Route.find({},{_id:0,name:1},(err,names)=>{

      // Supergeile Methode ©Hermes
      /*s = names.reduce(function(accumulator,entry){
        return accumulator+entry.name+","
      },"").slice(0,-1)*/

      //easykacke, toString macht das mit dem javascript object was ich immer haben wollte :(
      test= names.map(entry => entry.name).join()
      console.log(test)
      socket.emit("routeNames", test);
    })
  })

  console.log('client connected')
  socket.on('disconnect', ()=>{
    //stream.end() //add listener for button
  })
})

//175,70€
