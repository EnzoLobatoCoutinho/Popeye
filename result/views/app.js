var app = angular.module('poll-app', []);
var socket = io.connect({transports:['polling']});

var bg1 = document.getElementById('background-stats-1');
var bg2 = document.getElementById('background-stats-2');
var bg3 = document.getElementById('background-stats-3');
var bg4 = document.getElementById('background-stats-4');

app.controller('statsCtrl', function($scope){
  $scope.aPercent = 25;
  $scope.bPercent = 25;
  $scope.cPercent = 25;
  $scope.dPercent = 25;

  var updateScores = function(){
    socket.on('scores', function (json) {
       data = JSON.parse(json);
       var a = parseInt(data.a || 0);
       var b = parseInt(data.b || 0);
       var c = parseInt(data.c || 0);
       var d = parseInt(data.d || 0);

       var percentages = getPercentages(a, b, c, d);

       bg1.style.width = percentages.a + "%";
       bg2.style.width = percentages.b + "%";
       bg3.style.width = percentages.c + "%";
       bg4.style.width = percentages.d + "%";

       $scope.$apply(function () {
         $scope.aPercent = percentages.a;
         $scope.bPercent = percentages.b;
         $scope.cPercent = percentages.c;
         $scope.dPercent = percentages.d;
         $scope.total = a + b + c + d;
       });
    });
  };

  var init = function(){
    document.body.style.opacity=1;
    updateScores();
  };
  socket.on('message',function(data){
    init();
  });
});

function getPercentages(a, b, c, d) {
  var result = {};

  if (a + b + c + d > 0) {
    result.a = Math.round(a / (a + b + c + d) * 100);
    result.b = Math.round(b / (a + b + c + d) * 100);
    result.c = Math.round(c / (a + b + c + d) * 100);
    result.d = 100 - result.a - result.b - result.c;
  } else {
    result.a = result.b = result.c = result.d = 25;
  }

  return result;
}
