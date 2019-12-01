/* global io */
'use strict';

angular.module('angFullstackApp')
  .factory('Pusher', function($http) {

    var APP_KEY = '331b98ce6b3d232e5a2a';
    var APP_CLUSTER = 'ap2';
    var pusher = new Pusher(APP_KEY, {
      cluster: APP_CLUSTER
    });

    Pusher.prototype.emit = function(channel, event, data) {
    	return $http.post('/api/events', {channel: channel, event: event, data: data});
    }

    return pusher;
  });
