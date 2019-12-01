'use strict';

var _ = require('lodash');
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '512846',
  key: '331b98ce6b3d232e5a2a',
  secret: '8db117e6087ce044eda6',
  cluster: 'ap2'
});

// Get list of modules
exports.broadcastEvent = function(req, res) {
  pusher.trigger(req.body.channel, req.body.event, req.body.data, function(err) {
  	console.log(err);
  });
  return res.status(200).send('ok');
};

function handleError(res, err) {
  return res.send(500, err);
}