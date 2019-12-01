angular.module('angFullstackApp')
  .factory('Testapi', function ($http, Auth) {

    var factory = {};

    factory.testApi = function(selectedApi) {
    	return $http.post('/api/testapis/test',selectedApi)
    };
    factory.share = function(results) {
    	return $http.post('/api/testapis/share', results)
    }
    return factory;
    
  });
