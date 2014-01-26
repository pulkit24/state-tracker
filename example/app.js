angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker, $timeout) {

		$scope.save = function() {
			// some work
		};

		$scope.isReady = function() {
			return $scope.readyToSave;
		}
	});
