'use strict';

angular.module('angFullstackApp')
  .controller('NavbarCtrl', function ($scope, $location, $state, Auth) {
    
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      window.location.href = '/';
    };

    $scope.isActive = function(state) {
      var regex = /^(.*?)\./;
      var match = regex.exec($state.current.name);
      if(state==$state.current.name)
        return true;
      else if(match!=null && match[1]==state)
        return true;
      else
        return false;
    };
  });