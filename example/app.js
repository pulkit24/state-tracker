angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker) {

		$scope.v = "s";

		$scope.begin = function() {
			$scope.v = "reset!";
		};

		$scope.onChange = function(newState) {
			$scope.v += newState;
		};

	});
