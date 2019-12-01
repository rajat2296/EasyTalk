'use strict';

angular.module('angFullstackApp')
  .factory('Logs', function ($http, Auth) {

  	var factory = {};

    factory.getModuleLogs = function(scope_id,skip,start,end,errorCalls){
      return $http.get('/api/logs/module?scope_id='+scope_id+'&skip='+skip+'&start='+start+'&end='+end+'&errorCalls='+errorCalls);
    };

    factory.getUserLogs = function(skip){
      return $http.get('/api/logs/user?skip='+skip);
    };

    factory.getLogsByAdmin = function(scope_id,skip,start,end,errorCalls,selectedUser_id){
      return $http.get('/api/logs/admin?scope_id='+scope_id+'&skip='+skip+'&start='+start+'&end='+end+'&errorCalls='+errorCalls+'&user_id='+selectedUser_id);
    }; 

    factory.getUserCallCount = function(){
      return $http.get('/api/logs/user/calls');
    };

    factory.responseTimeUser = function(days){
      return $http.get('/api/logs/user/responseTime?days='+days);
    };

    factory.userRequestShare = function(){
      return $http.get('/api/logs/user/requests');
    };

    factory.responseTimeAdmin = function(days){
      return $http.get('/api/logs/admin/responseTime?days='+days);
    };

    factory.adminRequestShareByUser = function(month){
      return $http.get('/api/logs/admin/userShare',{params:{month:month}});
    };

    factory.adminRequestShareByScope = function(month){
      return $http.get('/api/logs/admin/scopeShare',{params:{month:month}});
    };    

    factory.scopevsresponse = {
        options: {
          chart: {
              type: 'spline',
              zoomType: 'xy'
          },
          xAxis: {
              title: {
                  text: 'Timestamp'
              },
              type: 'datetime',
              dateTimeLabelFormats: {
                  day: '%e %b'
              }
          },
          yAxis: {
              title: {
                  text: 'Response Time (ms)'
              },
              min: 0
          },
          tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              pointFormat: '{point.x:%e %b}: {point.y:.2f} ms'
          },
          plotOptions: {
              spline: {
                  marker: {
                      enabled: true
                  }
              }
          },
          credits: {
            enabled:false
          }
        },
        series: [],
        title: {
            text: 'Response vs Time'
        },
        subtitle: {
            text: ''
        }
    };
  	
    factory.scopevscalls = {
        options:{
          chart: {
              type: 'column'
          },
          xAxis: {
              categories: [],
              crosshair: true
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'No. of API calls'
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                  '<td style="padding:0"><b>{point.y}</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true
          },
          plotOptions: {
              column: {
                  pointPadding: 0.2,
                  borderWidth: 0
              }
          },
          credits: {
            enabled:false
          }
        },
        series: [],
        title: {
            text: 'Module vs No. of Calls'
        },
        subtitle: {
            text: 'for last 30 days'
        }
      };

    return factory;

  });