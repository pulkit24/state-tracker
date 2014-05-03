angular.module("state-tracker")
	.directive('stateTracker', function(stateTracker, $timeout) {
		return {
			restrict: 'EA'
			, link: function(scope, elem, attrs) {
				try {
					////////////////////////////////////
					// Initialize a state tracker //
					////////////////////////////////////

					var stateTrackerObject = scope.$eval(attrs.stateTracker);

					var stateRegistrationName = attrs.stateTracker;
					if (attrs.stateIsolate && attrs.stateIsolate !== "false")
						stateRegistrationName = null;

					if (!stateTrackerObject) {
						stateTrackerObject = stateTracker.new(scope.$eval(attrs.stateChoices), stateRegistrationName);
						// Add to scope
						scope[stateRegistrationName] = stateTrackerObject;
					}

					///////////////////////
					// Apply classes //
					///////////////////////

					var classes = scope.$eval(attrs.stateClass);

					// Add class whenever the corresponding state is set
					stateTrackerObject.$on("set", function(state) {
						elem.addClass(stateTrackerObject.$map(classes, 0, state));
					});
					// Remove previously added class whenever the state is being changed
					stateTrackerObject.$on("unset", function(state) {
						elem.removeClass(stateTrackerObject.$map(classes, 0, state));
					});

					/////////////////////////////
					// Event subscriptions //
					/////////////////////////////

					// On state change
					stateTrackerObject.$on("set", function(state) {
						// Execute any on-change events specified with the directive
						if (attrs.stateOnChange) {
							$timeout(function() {
								scope.$eval(attrs.stateOnChange);
							}, 0);
						}

						// Execute any of the default on-state-set events specified with the directive
						// Note: only available for state trackers with default states
						var listener = null;
						switch (state) {
							case "idle":
								listener = attrs.stateOnIdle;
								break;
							case "active":
								listener = attrs.stateOnActive;
								break;
							case "complete":
								listener = attrs.stateOnComplete;
								break;
							case "failed":
								listener = attrs.stateOnFailed;
								break;
						}

						if (listener) {
							$timeout(function() {
								scope.$eval(listener);
							}, 0);
						}
					});

					// Set state on truthy
					scope.$watch(attrs.stateReset, function(newValue) {
						if (newValue)
							stateTrackerObject.reset();
					});
					scope.$watch(attrs.stateActivate, function(newValue) {
						if (newValue)
							stateTrackerObject.activate();
					});
					scope.$watch(attrs.stateComplete, function(newValue) {
						if (newValue)
							stateTrackerObject.complete();
					});
					scope.$watch(attrs.stateFail, function(newValue) {
						if (newValue)
							stateTrackerObject.fail();
					});

					/////////////////////////////////////
					// Automatic state transitions //
					/////////////////////////////////////

					var transitions = scope.$eval(attrs.stateTransition);
					if (angular.isDefined(transitions)) {
						angular.forEach(transitions, function(transition, fromState) {
							angular.forEach(transition, function(delay, toState) {
								stateTrackerObject.$transition(fromState, toState, delay);
							});
						});
					}

					///////////////////////////////////////////////
					// Initialize based on the default state //
					///////////////////////////////////////////////

					// Now that everything is ready, we should perform the tasks registered for the default state
					stateTrackerObject.$revert(); // sets it to the default state, trigger the events

				} catch (e) {
					// Failed to eval - parse error
					console.log("State Tracker failed to parse directives");
				}
			}
		};
	});
