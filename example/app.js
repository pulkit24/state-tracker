angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker, $timeout) {

		// Register a get request for a tracker that doesn't exist yet
		stateTracker.getWhenAvailable("pending").then(function(tracker) {
			tracker.complete();
			$scope.newTracker = tracker;
		});

		$scope.save = function() {
			// some work

			// Create the pending tracker at this point
			stateTracker.new("pending");
		};

		$scope.isReady = function() {
			return $scope.readyToSave;
		}

		$scope.i = 0;

		$scope.saveProgress = stateTracker.new("saveProgress");
		var unbind = $scope.saveProgress.$on("complete", function() {
			$scope.i += 1000;
			$scope.saveProgress.reset();
		});

		$scope.saveProgress.$on("failed", function(){
			unbind();
			$scope.saveProgress.reset();
		});
	});
