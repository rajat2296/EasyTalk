'use strict';

angular.module('angFullstackApp')
  .factory('Resources', function ($http) {

  	var factory = {};

  	factory.get = function(){
      return $http.get('/api/resources');
  	};

    factory.getByModule = function(id){
      return $http.get('/api/resources?moduleId='+id);
    };

  	factory.post = function(data){
  		return $http.post('/api/resources', data);
  	};

    factory.update = function(id, data){
      return $http.put('/api/resources/'+id, data);
    };

  	factory.del = function(id){
  		return $http.delete('/api/resources/'+id);
  	};
  	
    return factory;

  });