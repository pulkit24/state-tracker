angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker, $timeout) {

		$scope.save = function() {
			// some work
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
