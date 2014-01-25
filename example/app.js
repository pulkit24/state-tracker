angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker, $timeout) {

		$scope.x = "";
		$scope.xx = function(state) {
			$scope.x += " " + state;
		};

		$scope.save = function() {
			// Dummy processing...
			$timeout(function() {

				// Some processing here...

				$scope.s1.complete(); // mark complete

			}, 2000);
		};

	});
