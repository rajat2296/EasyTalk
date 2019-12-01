'use strict';

angular.module('angFullstackApp')
  .controller('MeetingCtrl', function ($scope, $http, $state, $uibModal, Auth, Pusher) {
    console.log("meeting ctrl")
    var meetingId = $state.params.meetingId;
    var pc;
    var configuration = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
      }]
    }

    $scope.filters = {
      remoteStreamArrived: false
    }

    var channel = Pusher.subscribe('meetings-' + meetingId);

    channel.bind('pusher:subscription_succeeded', function() {
      // start the real stuff
      var isInitiator = localStorage.getItem('isInitiator');
      console.log(isInitiator)
      startWebRTC(isInitiator);
      startListeningToSignals();
    });

    channel.bind('pusher:subscription_error', function() {
      alert('Error in connecting to user.Kindly refresh and try again');
    });

    function startWebRTC(isInitiator) {
      pc= new RTCPeerConnection(configuration);

      pc.onicecandidate = function(event) {
        console.log("ice candidate", event);
        if (event.candidate) {
          Pusher.emit('meetings-' + meetingId, 'meeting-data', {'candidate': event.candidate}).then(function(success) {
            //to do
          }).catch(function(err){
            console.log(err);
          })
        }
      };
       
      if (isInitiator) {
        pc.onnegotiationneeded = function() {
          console.log("negotiation needed");
          pc.createOffer().then(function(sessionDesciption){
            localDescCreated(sessionDesciption)
          }).catch(function(err) {
            console.log(err);
          });
        }
      }
       
      pc.onaddstream = function(event) {
        $scope.filters.remoteStreamArrived = true;
        console.log(document.getElementById('remoteVideo'));
        document.getElementById('remoteVideo').srcObject = event.stream;
      };

      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 2048 },
          height: { ideal: 2160 } 
        } 
      }).then(function(stream) {
        document.getElementById('localVideo').srcObject = stream;
        pc.addStream(stream);
      }, function(err) {
        console.log(err);
        alert('error in connection to your media');
      });
    }

    function startListeningToSignals() {
      channel.bind('meeting-data', function(message) {
        if (message.sdp) {
         // console.log(message)
          var remoteDesc = new RTCSessionDescription(message.sdp)
          console.log(remoteDesc)
          pc.setRemoteDescription(remoteDesc, function() {
            if (pc.remoteDescription.type === 'offer') {
              pc.createAnswer().then(function(description) {
                localDescCreated(description)
              }).catch(function(err) {
                console.log(err);
              });
            }
          }, function(err){
            console.log(err);
          });
        } else if (message.candidate) {
          var iceCandidate = new RTCIceCandidate(message.candidate);
          console.log(iceCandidate);
          pc.addIceCandidate(iceCandidate, function(){
            //to do
          }, function(err) {
            console.log(err);
          });
        }
      })
    }

    function localDescCreated(desc) {
      pc.setLocalDescription(desc, function() {
        Pusher.emit('meetings-' + meetingId, 'meeting-data', {'sdp': pc.localDescription}).then(function(success) {
            //to do
        },function(err){
          console.log(err);
        })
      }, function(err) {
        console.log(err);
      });
    }
});