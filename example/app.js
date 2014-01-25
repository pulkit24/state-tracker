angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker, $timeout) {

		$scope.x = "";
		$scope.xx = function(state) {
			$scope.x += " " + state;
		};

		$scope.s1 = stateTracker.new("s1");
		$scope.s1.$transition("active", "complete", 2000);
		$scope.s1.$transition("complete", "idle", 2000);

		$scope.save = function() {
			$scope.s1.activate();

			// $scope.s1.$transition("complete", "idle", 2000);

			// // Dummy processing...
			// $timeout(function(){

			// 	$scope.s1.complete();

			// }, 2000);
		};

	});
