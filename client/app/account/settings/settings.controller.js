'use strict';

angular.module('angFullstackApp')
  .controller('SettingsCtrl', function ($scope, $state, User, Auth) {
    $scope.errors = {};
    $scope.isMaster = Auth.isMaster();
    
    $scope.isActive = function(state){
      return state===$state.current.name;
    };
    
    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
          $scope.user.oldPassword = '';
          $scope.user.newPassword = '';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  }).controller('CreateModuleCtrl', function ($scope, Auth, Modules, Resources) {
      
      var checkedOpts = function(opt){
        var rights = [];
        for(var key in opt)
          if(opt[key]) rights.push(key);
        return rights;
      };

      $scope.getModules = function(){
        Modules.get().success(function(data){
          $scope.modules = data;
        }).error(function(err){
          alert("Something went wrong. Please refresh.");
        });
      };

      $scope.addModule = function(form, mod_name){
        $scope.submitted_module = true;
        $scope.successModule = true;
        if(form.$valid){
          Modules.post({name: mod_name}).success(function(data){
            $scope.submitted_module = false;
            $scope.mod_name = '';
            $scope.successModule = true;
          }).error(function(err){
            $scope.errorModule = err.errors.name.message;
          });
        }
      };

      $scope.addAPI = function(form){
        $scope.submitted_api = true;
        $scope.successResource = false;
        $scope.api.endpoints = checkedOpts($scope.opt);
        if($scope.api.endpoints.length==0)
          $scope.emptyOpts = true;
        else if(form.$valid){
          Resources.post($scope.api).success(function(data){
            $scope.submitted_api = false;
            $scope.emptyOpts = false;
            $scope.opt = {};
            $scope.api.name='';
            $scope.api.uri='';
            $scope.api.hidden=false; 
            $scope.successResource = true;
          }).error(function(err){
            $scope.errorApi = err.errors.name.message;
          });
        }
      };

  }).controller('CreateWebHookCtrl', function ($scope, Auth, WebHook) {

      $scope.addWebHook = function(form, event){
        $scope.submitted_webhook = true;
        if(form.$valid){
          WebHook.post(event).success(function(data){
            $scope.submitted_webhook = false;
            $scope.event = {};
            $scope.successWebhook = true;
          }).error(function(err){
            $scope.successWebhook = false;
            $scope.errorModule = err.errors.name.message;
          });
        }
      };

  });
