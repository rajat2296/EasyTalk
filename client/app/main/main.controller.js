'use strict';

angular.module('angFullstackApp').controller('MainCtrl', function ($scope, $location) {
	
	console.log("sdfghjk");

  $scope.startCall = function(sender, receiver) {
  	//console.log("dcfghj");
  	var callId = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  	var initiatorId = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  	localStorage.setItem('isInitiator', true);
  	//notifyReceiver(receiver);
  	window.location.href = '/meeting/'+callId
  }	

}).controller('HomeCtrl', function ($scope, $http, $state, $uibModal, Auth, Pusher) {

	  $scope.currentUser = currentUser;
	  $scope.users = users;
	  console.log($scope.currentUser, $scope.users);	
	  
	  /*******************User Functions*****************/	

	  $scope.startCall = function(sender, receiver) {
	  	var callId = Math.floor(Math.random() * 0xFFFFFF).toString(16);
	  	notifyReceiver(receiver);
	  	$location.path('/meetings/'+callId+'/'+currentUser._id);
	  }	

	  function notifyReceiver() {

	  }

		
}).controller('UserVerifyCtrl', function ($scope, $uibModalInstance, Auth) {
 
	    $scope.errors = {};
	    $scope.submitted = false;
	    $scope.ok = function(form) {
	      $scope.submitted = true;

	      if(form.$valid) {
	        Auth.login({
	          email: $scope.user.email,
	          password: $scope.password
	        })
	        .then( function(data) {
	          $uibModalInstance.close(true);
	        })
	        .catch( function(err) {
	          $scope.errors.other = err.message;
	          $uibModalInstance.close(false);
	        });
	      }
	    };

	    $scope.cancel = function(){
	    	$uibModalInstance.dismiss('cancel');
	    };
  });