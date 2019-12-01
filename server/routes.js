/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var RateLimit = require('express-rate-limit');
var cors = require('cors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/events', require('./api/events'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  //RATE LIMITER 
  var apiLimiter = new RateLimit({
    windowMs: 15*60*1000, 
    max: 500,
    delayMs: 0,
    keyGenerator: function (req, res) {
      return req.headers['x-real-ip'];
    }
  });
  
  // only apply to requests
  app.use('/api/v1', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DEL");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.options('/api/v1/*', cors());

  app.use('/api/v1', apiLimiter);
  /*app.use('/api/v1', require('./api/oauth'));*/

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|oauth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
