'use strict';

angular.module('angFullstackApp')
  .factory('WebHook', function ($http) {

  	var factory = {};

  	factory.all = function(){
      return $http.get('/api/webhooks');
  	};

    factory.get = function(id){
      return $http.get('/api/webhooks?webhookId='+id);
    };

  	factory.post = function(data){
  		return $http.post('/api/webhooks', data);
  	};

    factory.update = function(id, data){
      return $http.put('/api/webhooks/'+id, data);
    };

  	factory.del = function(id){
  		return $http.delete('/api/webhooks/'+id);
  	};

    factory.getWebhookUsers = function(id){
      return $http.get('/api/webhooks/users?webhookId='+id);
    };

    factory.getWebhooksOfUser = function(){
      return $http.get('/api/webhooks/users');
    };

    factory.addUserHook = function(data){
      return $http.post('/api/webhooks/users', data);
    };

    factory.updateUserHook = function(id, data){
      return $http.put('/api/webhooks/users/'+id, data);
    };

    factory.deleteUserHook = function(id){
      return $http.delete('/api/webhooks/users/'+id);
    };
  	
    return factory;

  });