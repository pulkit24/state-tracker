angular.module("state-tracker")
	.directive('stateTracker', function(stateTracker, $timeout) {
		return {
			restrict: 'EA'
			, scope: {
				stateTracker: "="

				// Tracker registration
				, stateRegistrationName: "@stateTracker"
				, stateIsolate: "@" // don't register if set

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
				, stateOnFailed: "&"

				// State set functions executed on truthy (default states only)
				, stateReset: "="
				, stateActivate: "="
				, stateComplete: "="
				, stateFail: "="

				// Automatic state transitions
				, stateTransition: "&"
			}
			, link: function(scope, elem, attrs) {
				////////////////////////////////////
				// Initialize a state tracker //
				////////////////////////////////////

				if (scope.stateIsolate && scope.stateIsolate !== "false")
					scope.stateRegistrationName = null;
				scope.stateTracker = stateTracker.new(scope.stateChoices(), scope.stateRegistrationName);

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
							listener = scope.stateOnFailed;
							break;
					}

					if (listener) {
						$timeout(function() {
							listener();
						}, 0);
					}
				});


				// Set state on truthy
				scope.$watch('stateReset', function(newValue) {
					if (newValue)
						scope.stateTracker.reset();
				});
				scope.$watch('stateActivate', function(newValue) {
					if (newValue)
						scope.stateTracker.activate();
				});
				scope.$watch('stateComplete', function(newValue) {
					if (newValue)
						scope.stateTracker.complete();
				});
				scope.$watch('stateFail', function(newValue) {
					if (newValue)
						scope.stateTracker.fail();
				});

				/////////////////////////////////////
				// Automatic state transitions //
				/////////////////////////////////////

				var transitions = scope.stateTransition();
				if (angular.isDefined(transitions)) {
					angular.forEach(transitions, function(transition, fromState) {
						angular.forEach(transition, function(delay, toState) {
							scope.stateTracker.$transition(fromState, toState, delay);
						});
					});
				}


				///////////////////////////////////////////////
				// Initialize based on the default state //
				///////////////////////////////////////////////

				// Now that everything is ready, we should perform the tasks registered for the default state
				scope.stateTracker.$revert(); // sets it to the default state, trigger the events

			}
		};
	});
