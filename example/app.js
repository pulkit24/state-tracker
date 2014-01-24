angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker) {

		$scope.v = "s";

		$scope.onChange = function(newState) {
			$scope.v += newState;
		};

		// $scope.s2.$on("set", function(newState) {
		// 	$scope.v += newState;
		// });

	});
