angular.module("demoApp", ["state-tracker"])
	.controller("DemoCtrl", function($scope, $timeout, stateTracker) {

		// Demo 3
		$scope.loadedDemoContent = {};
		$scope.loadDemoContent = function(index) {
			$scope.loadedDemoContent[index] = null;

			// Simulate some lengthy processing using a simple 2 seconds time-out
			$timeout(function() {
				$scope.loadedDemoContent[index] = "http://placekitten.com/" + (index * 100) + "/100";
			}, 2000);
		};
		$scope.getLoadedDemoContent = function(index) {
			return $scope.loadedDemoContent[index];
		};

		// Demo 4
		$scope.alert = function(message) {
			alert(message);
		};
	});
