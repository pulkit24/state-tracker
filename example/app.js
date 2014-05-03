angular.module("sampleApp", ["state-tracker"])
	.controller("SampleCtrl", function($scope, $timeout, stateTracker) {

		// Directive: example 2: Save button
		$scope.save = function() {
			$scope.exampleTracker2.activate();

			// Simulate some lengthy processing using a simple 2 seconds time-out
			$timeout(function() {
				$scope.exampleTracker2.complete();
			}, 2000);
		};

		// Quick example 2
		$scope.isValid = function(inputText) {
			return inputText && inputText.length >= 8 && !inputText.match(/[^0-9]/);
		};

		// Quick example 3
		$scope.loadContent = function() {
			$scope.loadedContent = null;

			// Simulate some lengthy processing using a simple 2 seconds time-out
			$timeout(function() {

				$scope.loadedContent = "http://lorempixel.com/200/50";

				$scope.quickTracker3.complete();
			}, 2000);
		};

		$scope.alert = function(text) { alert(text) };
	});
