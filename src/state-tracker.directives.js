angular.module("state-tracker")
	.directive('stateTracker', function(stateTracker, $filter) {
		return {
			restrict: 'EA'
			, scope: {
				stateTracker: "="
				, stateChoices: "&"
				, stateClass: "&"
				, stateOnChange: "&"
			}
			, link: function(scope, elem, attrs) {
				////////////////////////////////////
				// Initialize a state tracker //
				////////////////////////////////////
				scope.stateTracker = stateTracker.new(scope.stateChoices());

				///////////////////////
				// Apply classes //
				///////////////////////
				var classes = scope.stateClass();
				// Add class whenever the corresponding state is set
				scope.stateTracker.$on("set", function(newState) {
					elem.addClass($filter("stateTrackerMap")(newState, classes));
				});
				// Remove previously added class whenever the state is being changed
				scope.stateTracker.$on("unset", function(newState) {
					elem.removeClass($filter("stateTrackerMap")(newState, classes));
				});

				/////////////////////////////
				// Event subscriptions //
				/////////////////////////////
				if(angular.isFunction(scope.stateOnChange())) {
					scope.stateTracker.$on("set", function(newState) {
						scope.stateOnChange()(newState);
					});
				}
			}
		};
	});
