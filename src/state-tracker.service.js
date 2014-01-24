angular.module("state-tracker")
	.factory("stateTracker", function() {

		///////////////////////
		// Tracking object //
		///////////////////////
		var stateTracker = function() {

			// Possible states
			this._states = {};

			// Default state
			this._defaultState = null;

			// Current state
			this._state = null;

			// Set state
			this._setState = function(state) {
				this._notifyUnset(this._state);
				this._state = state;
				this._notifySet(state);
				return this;
			};

			// Check state
			this._isState = function(state) {
				return this._state === state;
			};

			// Revert to default
			this._revert = function(state) {
				return this._setState(this._defaultState);
			};

			//////////////////////////
			// Event subscriptions //
			//////////////////////////

			var setListeners = [];
			var unsetListeners = [];

			// Register as a listener
			this.$on = function(event, listener) {
				var id;
				if(event.toLowerCase() === "set") {
					id = setListeners.length;
					setListeners.push(listener);
				}
				else if(event.toLowerCase() === "unset") {
					id = unsetListeners.length;
					unsetListeners.push(listener);
				}
				return function() {
					this.$unbind(id);
				};
			};

			this.$unbind = function(event, id) {
				if(event.toLowerCase() === "set") {
					setListeners[id] = angular.noop;
				}
				else if(event.toLowerCase() === "unset") {
					unsetListeners[id] = angular.noop;
				}
			};

			// Generic event push service
			this._notify = function(listeners, payload) {
				angular.forEach(listeners, function(listener, id) {
					listener(payload);
				});
			};

			// Notify a state is being unset/changed
			this._notifyUnset = function(oldState) {
				this._notify(unsetListeners, oldState);
			};

			// Notify a state is being set
			this._notifySet = function(newState) {
				this._notify(setListeners, newState);
			};
		};

		////////////////////////
		// Manage trackers  //
		////////////////////////

		// Global registry of states - allows inter-scope communication
		var registry = {};

		// Create a new state tracker object
		// (optional) Register globally by supplying a reference name
		var _createBarebonesTracker = function(registrationName) {
			var tracker = new stateTracker();
			if (registrationName)
				registerTracker(registrationName, tracker);
			return tracker;
		};

		// Create a default state tracker with the following states:
		// idle - set using tracker.idle(); check using tracker.isIdle();
		// active - set using tracker.activate(); check using tracker.isActive();
		// complete - set using tracker.complete(); check using tracker.isComplete();
		// failed - set using tracker.fail(); check using tracker.isFailed();
		var _createDefaultTracker = function(registrationName) {
			return _createCustomTracker([{
				set: "idle"
				, check: "isIdle"
			}, {
				set: "activate"
				, check: "isActive"
			}, {
				set: "complete"
				, check: "isComplete"
			}, {
				set: "fail"
				, check: "isFailed"
			}], registrationName);
		};

		// Create a custom tracker with your own states
		// Supply an array of states in either of these formats:
		// 1. [ "state1", "state2", "state3", ... ]
		// 		Setter functions are automatically created as:
		// 			tracker.state1(); tracker.state2(); tracker.state3(); ...
		// 		Checking functions are automatically created as:
		// 			tracker.isState1(); tracker.isState2(); tracker.isState3(); ...
		//
		// 2. [	{set: "toFirst", check: "isStarted"}
		//		, {set: "toLast", check: "isOver"}, ... ]
		//		Setter functions are then available as specified:
		//			tracker.toFirst(); tracker.toLast(); ...
		//		Checking functions are then available as specified:
		//			tracker.isStarted(); tracker.isOver(); ...
		//
		// Note: the first state will be considered the default state
		var _createCustomTracker = function(states, registrationName) {
			if (!angular.isArray(states) || !states.length)
				return null;

			// Create a basic tracker
			var tracker = _createBarebonesTracker(registrationName);
			var stateName, setFunction, checkFunction;

			// Include the states supplied
			angular.forEach(states, function(state, index) {
				// Construct meaningful function names based on the type of info supplied
				stateName = index + 1; // 1 based indexing: avoid zero

				if (angular.isString(state)) {
					setFunction = state;
					checkFunction = "is" + _capitalize(state);
				} else if (angular.isObject(state)) {
					setFunction = state.set;
					checkFunction = state.check;
				}

				// Add the state to the tracker
				tracker = addState(tracker, stateName, setFunction, checkFunction, !tracker._defaultState);
			});

			return tracker;
		};

		// Sanitize a given value for use as name
		// Allow alphanumeric, and non-initial underscores only
		function _sanitize(value) {
			return ("" + value).replace(/[^a-zA-Z0-9_]/g, "").replace(/^_+/, "");
		}

		// Unified function to create a tracker. Delegates to other functions as necessary
		var createTracker = function(arg0, arg1) {
			if (angular.isArray(arg0))
				return _createCustomTracker(arg0, arg1); // states, registrationName
			else
				return _createDefaultTracker(arg0); // registrationName
		};

		// Add a state to the tracker, and make human-friendly set and check functions
		// for the individual state
		function addState(tracker, state, set, check, isDefault) {
			state = parseInt(_sanitize(state), 10);
			set = _sanitize(set);
			check = _sanitize(check);

			// Register as a new state
			tracker._states[state] = state;

			// Register human-friendly setter function
			tracker[set] = function() {
				return tracker._setState(state);
			};

			// Register human-friendly check function
			tracker[check] = function() {
				return tracker._isState(state);
			};

			// Mark as default if required
			if (isDefault)
				tracker._defaultState = tracker._states[state];

			return tracker._revert(); // set to default state
		}

		// Register a tracker globally against a reference name
		var registerTracker = function(registrationName, tracker) {
			registry[registrationName] = tracker;
			return tracker;
		};

		// Retrieve a tracker from the global registry by its reference name
		var retrieveFromRegistry = function(registrationName) {
			return registry[registrationName];
		};

		function _capitalize(name) {
			return name.charAt(0).toUpperCase() + name.slice(1);
		}

		////////////////////////
		// Public interface //
		////////////////////////

		return {
			new: createTracker
			, get: retrieveFromRegistry
		}
	});
