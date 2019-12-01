'use strict';

angular.module('angFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
      }).state('home', {
        url: '/home',
        templateUrl: 'app/main/home.html',
        controller: 'HomeCtrl',

      }).state('auth',{
        url: '/callback/:token',
        template: '<br><br><br><h2 class="text-center">verifying email account</h2>',
        controller: function(){
            window.location.href='/';
        },
        resolve: {
          userData: function($stateParams, $cookieStore){
            if($stateParams.token){
               $cookieStore.put('token', $stateParams.token);
            }
          } 
        }
      }).state('unauthorized', {
        url: '/unauthorized',
        template: '<h1 style="text-align:center" class="container">You are unauthorized to access this account.<br>Please login again to continue.</h1>'
      });
  });