angular.module("state-tracker")
	.directive('stateTracker', function(stateTracker, $timeout) {
		return {
			restrict: 'EA'
			, scope: {
				stateTracker: "="

				// Register globally
				, stateRegisterAs: "@"

				// Custom states
				, stateChoices: "&"

				// Map classes by state
				, stateClass: "&"

				// Generic on-change function available to every state tracker
				, stateOnChange: "&"

				// State-specific on-change functions (default states only)
				, stateOnIdle: "&"
				, stateOnActive: "&"
				, stateOnComplete: "&"
				, stateOnFail: "&"

				// State set functions executed on truthy (default states only)
				, stateReset: "="
				, stateActivate: "="
				, stateComplete: "="
				, stateFail: "="
			}
			, link: function(scope, elem, attrs) {
				////////////////////////////////////
				// Initialize a state tracker //
				////////////////////////////////////
				scope.stateTracker = stateTracker.new(scope.stateChoices(), scope.stateRegisterAs);

				///////////////////////
				// Apply classes //
				///////////////////////
				var classes = scope.stateClass();
				// Add class whenever the corresponding state is set
				scope.stateTracker.$on("set", function(state) {
					elem.addClass(scope.stateTracker.$map(classes, 0, state));
				});
				// Remove previously added class whenever the state is being changed
				scope.stateTracker.$on("unset", function(state) {
					elem.removeClass(scope.stateTracker.$map(classes, 0, state));
				});

				/////////////////////////////
				// Event subscriptions //
				/////////////////////////////

				// On state change
				scope.stateTracker.$on("set", function(newState) {
					// Execute any on-change events specified with the directive
					if (scope.stateOnChange) {
						$timeout(function() {
							scope.stateOnChange({
								state: newState
							});
						}, 0);
					}

					// Execute any of the default on-state-set events specified with the directive
					// Note: only available for state trackers with default states
					var listener = null;
					switch (newState) {
						case "idle":
							listener = scope.stateOnIdle;
							break;
						case "active":
							listener = scope.stateOnActive;
							break;
						case "complete":
							listener = scope.stateOnComplete;
							break;
						case "failed":
							listener = scope.stateOnFail;
							break;
					}

					if (listener) {
						$timeout(function() {
							listener();
						}, 0);
					}
				});


				// Set state on truthy
				if (angular.isDefined(scope.stateReset))
					scope.$watch('stateReset', function(newValue) {
						if (newValue)
							scope.stateTracker.reset();
					});
				if (angular.isDefined(scope.stateActivate))
					scope.$watch('stateActivate', function(newValue) {
						if (newValue)
							scope.stateTracker.activate();
					});
				if (angular.isDefined(scope.stateComplete))
					scope.$watch('stateComplete', function(newValue) {
						if (newValue)
							scope.stateTracker.complete();
					});
				if (angular.isDefined(scope.stateFail))
					scope.$watch('stateFail', function(newValue) {
						if (newValue)
							scope.stateTracker.fail();
					});

			}
		};
	});
