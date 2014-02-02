angular.module("state-tracker")
	.factory("stateTracker", function($timeout, $q) {

		///////////////////////
		// Tracking object //
		///////////////////////
		var stateTracker = function() {

			// Possible states
			this._states = [];

			// Default state
			this._defaultState = undefined;

			// Current state
			this._state = undefined;

			// Set state
			this._setState = function(state) {
				this._notifyUnset(this._states[this._state]);
				this._state = state;
				this._notifySet(this._states[state]);
				return this;
			};

			// Check state
			this._isState = function(state) {
				return this._state === state;
			};

			// Revert to default
			this.$revert = function(state) {
				return this._setState(this._defaultState);
			};

			// Maps the supplied list to the states available
			// and returns the list item corresponding to the current state
			// (optional) Supply a start index as an offset for reading your list
			// (optional) Supply a state name to be mapped instead of the current state
			this.$map = function(list, startIndex, stateName) {
				var state = stateName ? this._states.indexOf(stateName) : this._state;

				if (angular.isUndefined(startIndex))
					startIndex = 0;

				try {
					return list[state + startIndex];
				} catch (e) {
					return null;
				}
			};

			//////////////////////////
			// Event subscriptions //
			//////////////////////////

			var setListeners = [];
			var unsetListeners = [];
			var stateListeners = {}; // per-state lists

			// Register as a listener
			// Supply the name of a state to be notified whenever the state is set.
			// Example, stateTracker.$on("active", function() { ... } )
			// Two other events are also available:
			//  set: when a state is set.
			// 	unset: when a state is being overwritten by a new state.
			// Use "set" to perform tasks (example add a CSS class) on change.
			// Use "unset" to clean up (example remove a CSS class) before change.
			// Listeners are supplied the state name as a parameter.
			// Returns: unbind function for executing when you need to destroy the listener.
			this.$on = function(event, listener) {
				var id, list = null;

				// Add to the list of subscribed listeners
				if (event.toLowerCase() === "set") {
					id = setListeners.length;
					setListeners.push(listener);
				} else if (event.toLowerCase() === "unset") {
					id = unsetListeners.length;
					unsetListeners.push(listener);
				} else {
					list = event;
					if (!stateListeners[list])
						stateListeners[list] = [];
					id = stateListeners[list].length;
					stateListeners[list].push(listener);
				}

				// Let them know of the current state
				this._notifySet(this._states[this._state]);

				var self = this;
				return function() {
					self._unbind(event, id, list);
				};
			};

			// Disassociate the listener from this event
			this._unbind = function(event, id, list) {
				if (event.toLowerCase() === "set") {
					setListeners[id] = angular.noop;
				} else if (event.toLowerCase() === "unset") {
					unsetListeners[id] = angular.noop;
				} else {
					stateListeners[list][id] = angular.noop;
				}
			};

			// Generic event push service
			this._notify = function(listeners, payload) {
				angular.forEach(listeners, function(listener, id) {
					$timeout(function() {
						listener(payload);
					}, 0);
				});
			};

			// Notify a state is being unset/changed
			this._notifyUnset = function(oldState) {
				this._notify(unsetListeners, oldState);
			};

			// Notify a state is being set
			this._notifySet = function(newState) {
				this._notify(stateListeners[newState], newState); // notify the state-specific listeners
				this._notify(setListeners, newState); // notify the generic listeners
			};

			///////////////////////////////
			// Transitions and delays //
			///////////////////////////////

			// Register an automatic transition between state.
			// Whenever the tracker hits fromState, it automatically
			// converts to toState after the specified delay.
			// Example use case: automatically revert save buttons after completion for reuse.
			this.$transition = function(fromState, toState, delay) {
				var self = this;

				var fromStateName = angular.isString(fromState) ? fromState : this._states[fromState];
				var toState = angular.isString(toState) ? this._states.indexOf(toState) : toState;

				if (fromStateName && toState >= 0) {
					self.$on("set", function(newStateName) {
						if (newStateName === fromStateName) {
							self._delay(delay).then(function() {
								self._setState(toState)
							});
						}
					});
				}
			};

			// Delay execution by specified milliseconds
			this._delay = function(millis) {
				var deferred = $q.defer();

				$timeout(function() {
					deferred.resolve();
				}, millis);

				return deferred.promise;
			};
		};

		////////////////////////
		// Manage trackers  //
		////////////////////////

		// The default set of states:
		// idle - set using tracker.idle(); check using tracker.isIdle();
		// active - set using tracker.activate(); check using tracker.isActive();
		// complete - set using tracker.complete(); check using tracker.isComplete();
		// failed - set using tracker.fail(); check using tracker.isFailed();
		var _defaultStates = [{
			state: "idle"
			, set: "reset"
			, check: "isIdle"
		}, {
			state: "active"
			, set: "activate"
			, check: "isActive"
		}, {
			state: "complete"
			, set: "complete"
			, check: "isComplete"
		}, {
			state: "failed"
			, set: "fail"
			, check: "isFailed"
		}];

		// Unified function to create a tracker. Delegates to other functions as necessary
		// Usage:
		// 	createTracker([custom states], [registration name])
		// Supply an array of states in either of these formats:
		// 1. [ "state1", "state2", "state3", ... ]
		// 		Setter functions are automatically created as:
		// 			tracker.state1(); tracker.state2(); tracker.state3(); ...
		// 		Checking functions are automatically created as:
		// 			tracker.isState1(); tracker.isState2(); tracker.isState3(); ...
		//
		// 2. [	{state: "init", set: "toFirst", check: "isStarted"}
		//		, {state:"end", set: "toLast", check: "isOver"}, ... ]
		//		Setter functions are then available as specified:
		//			tracker.toFirst(); tracker.toLast(); ...
		//		Checking functions are then available as specified:
		//			tracker.isStarted(); tracker.isOver(); ...
		//
		//	3. If no states supplied, the default set of states will be provided.
		//
		// Note: the first state will be considered the default state
		var createTracker = function(arg0, arg1) {
			var states;
			var registrationName;

			if (angular.isArray(arg0)) {
				states = arg0;
				registrationName = arg1;
			} else if (angular.isUndefined(arg0) && angular.isDefined(arg1)) {
				states = _defaultStates;
				registrationName = arg1;
			} else {
				states = _defaultStates;
				registrationName = arg0;
			}

			// First, try to fetch from the registry
			var registeredTracker = retrieveFromRegistry(registrationName);
			if (registeredTracker)
			// Found, reuse it
				return registeredTracker;
			else {
				// Create a new one
				var tracker = new stateTracker();

				// Fill out the states
				tracker = _constructStates(tracker, states);

				// Register if required
				if (registrationName)
					registerTracker(registrationName, tracker);

				return tracker;
			}
		};

		// Fill out a tracker with the specified states
		// along with their set and check functions
		function _constructStates(tracker, states, registrationName) {
			if (!angular.isArray(states) || !states.length)
				return null;

			var stateName, setFunction, checkFunction;

			// Include the states supplied
			angular.forEach(states, function(state, index) {
				// Construct meaningful function names based on the type of info supplied

				if (angular.isString(state)) {
					stateName = state;
					setFunction = state;
					checkFunction = "is" + _capitalize(state);
				} else if (angular.isObject(state)) {
					stateName = state.state;
					setFunction = state.set;
					checkFunction = state.check;
				}

				// Add the state to the tracker
				tracker = _addState(tracker, stateName, setFunction, checkFunction, angular.isUndefined(
					tracker._defaultState));
			});

			return tracker;
		};

		// Add a state to the tracker, and make human-friendly set and check functions
		// for the individual state
		function _addState(tracker, stateName, set, check, isDefault) {
			stateName = _sanitize(stateName);
			set = _sanitize(set);
			check = _sanitize(check);

			// Register as a new state
			if (tracker._states.indexOf(stateName) < 0)
				tracker._states.push(stateName);

			// Get the ID of the state, new or old
			var stateID = tracker._states.indexOf(stateName);

			// Register human-friendly setter function
			tracker[set] = function() {
				return tracker._setState(stateID);
			};

			// Register human-friendly check function
			tracker[check] = function() {
				return tracker._isState(stateID);
			};

			// Mark as default if required
			if (isDefault)
				tracker._defaultState = stateID;

			return tracker.$revert(); // set to default state
		}

		///////////////////////////////
		// Global tracker registry //
		///////////////////////////////

		// Global registry of states - allows inter-scope communication
		var registry = {};

		// Register a tracker globally against a reference name
		// Only done when the tracker is created, so any pending
		// (awaiting) get requests are resolved at this point
		var registerTracker = function(registrationName, tracker) {
			// Save in registry
			registry[registrationName] = tracker;

			// Resolve any pending get requests
			satisfyGetRequests(registrationName);

			return tracker;
		};

		// Retrieve a tracker from the global registry by its reference name
		var retrieveFromRegistry = function(registrationName) {
			return registry[registrationName];
		};

		// Retrieve when available, return a promise
		var pendingGetRequests = {};
		var registerGetRequest = function(registrationName) {
			var deferred = $q.defer();

			// Already available?
			var tracker = retrieveFromRegistry(registrationName);
			// Just return it
			if(tracker)
				deferred.resolve(tracker);

			// Otherwise, register interest
			// Initiate a list of pending promises on this name
			if(!pendingGetRequests[registrationName])
				pendingGetRequests[registrationName] = [];
			// Add the promise
			pendingGetRequests[registrationName].push(deferred);

			// Return the promise
			return deferred.promise;
		};

		// On creation, this is called to resolve all pending promises
		var satisfyGetRequests = function(registrationName) {
			// Get the new tracker
			var tracker = retrieveFromRegistry(registrationName);

			// Any pending requests?
			if(pendingGetRequests[registrationName]) {
				for(var i = 0, len = pendingGetRequests[registrationName].length; i < len; i++) {
					// Resolve the promises with the new tracker
					pendingGetRequests[registrationName][i].resolve(tracker);
				}
			}
		};

		/////////////////////////
		// Utility functions //
		/////////////////////////

		// Sanitize a given value for use as name
		// Allow alphanumeric, and non-initial underscores only
		function _sanitize(value) {
			return ("" + value).replace(/[^a-zA-Z0-9_]/g, "").replace(/^_+/, "");
		}

		// Capitalize a given value for use as a name
		function _capitalize(name) {
			return name.charAt(0).toUpperCase() + name.slice(1);
		}

		////////////////////////
		// Public interface //
		////////////////////////

		return {
			new: createTracker
			, get: retrieveFromRegistry
			, getWhenAvailable: registerGetRequest
		}
	});
