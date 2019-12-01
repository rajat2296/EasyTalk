'use strict';

angular.module('angFullstackApp')
  .controller('LoginCtrl', function ($scope, $location, $cookieStore, Auth) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function(data) {
          // Logged in, redirect to home
          window.location.href = '/home';
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
