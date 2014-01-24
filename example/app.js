angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, stateTracker) {

		$scope.s1 = stateTracker.new();

		$scope.s2 = stateTracker.custom([
			"begin"
			, "do"
			, "end"
		]).begin();
	});
