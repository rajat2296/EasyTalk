'use strict';

angular.module('angFullstackApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      updateResources: {
        method: 'PUT',
        params: {
          controller:'resources'
        }
      }
	  });
  });
