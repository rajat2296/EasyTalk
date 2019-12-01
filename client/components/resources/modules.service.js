'use strict';

angular.module('angFullstackApp')
  .factory('Modules', function ($http) {

  	var factory = {};

  	factory.get = function(){
      return $http.get('/api/modules');
  	};


  	factory.post = function(data){
  		return $http.post('/api/modules', data);
  	};


  	factory.del = function(id){
  		return $http.delete('/api/modules/'+id);
  	}; 
  	
    return factory;

  });