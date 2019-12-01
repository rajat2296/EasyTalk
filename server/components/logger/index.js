/**
 * Logger
 */

'use strict';
var winston = require('winston');

var userLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: 'user_error.log',
      name: 'user.error',
      level: 'error'
    }),
    new (winston.transports.File)({
      filename: 'user_info.log',
      name: 'user.info',
      level: 'info'
    })
  ]
});

var apiLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: 'api_error.log',
      name: 'api.error',
      level: 'error'
    }),
    new (winston.transports.File)({
      filename: 'api_info.log',
      name: 'api.info',
      level: 'info'
    })
  ]
});


exports.user = function(level, msg){
	var msg=JSON.stringify(msg);
	if(level=='error')
		userLogger.error(msg);
	else
		userLogger.info(msg);
};

exports.api = function(level, msg){
	var msg=JSON.stringify(msg);
	if(level=='error')
		apiLogger.error(msg);
	else
		apiLogger.info(msg);
};