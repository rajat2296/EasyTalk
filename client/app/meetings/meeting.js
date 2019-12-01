'use strict';

angular.module('angFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('meeting', {
        url: '/meeting/:meetingId',
        templateUrl: 'app/meetings/meeting.html',
        /*resolve: {
        	currentUser: function(User) {
        		return User.get().$promise.then(function(user) {
        			return user;
        		}).catch(function(err){
        			throw err;
        		})
        	}
        }*/
        controller: 'MeetingCtrl',
      });
  });