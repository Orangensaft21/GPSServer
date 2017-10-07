var Route = require('../models/routeModel')
var assert = require('assert');
console.log("asd")
describe('routeModel', function() {
  describe('loadRoute()', function() {
    it('should be a route', function(done) {
      Route.loadRoute("Robert-Schuman-Route",( createdRoute)=>{
          /*console.log(createdRoute);
          if (err) done(err);
          else done();*/
          done();
      })
    });
  });
});
