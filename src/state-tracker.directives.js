angular.module("state-tracker")
	.directive('stateTracker', function() {
		return {
			restrict: 'EA'
			, scope: {
				stateTracker: "="
				, stateChoices: "="
			}
			, link: function(scope, elem, attrs) {
			}
			, controller: function($scope, stateTracker) {

				////////////////////////////////////
				// Initialize a state tracker //
				////////////////////////////////////
				$scope.stateTracker = stateTracker.new($scope.stateChoices);
			}
		};
	});
