angular.module("state-tracker")
	.factory("stateTracker", function() {

		///////////////////////
		// Tracking object //
		///////////////////////
		var stateTracker = function() {

			// Possible states
			this._states = {};

			// Current state
			this._state = null;

			// Set state
			this._setState = function(state) {
				this._state = state;
			};
		};

		////////////////////////
		// Manage trackers  //
		////////////////////////

		// Global registry of states - allows inter-scope communication
		var registry = {};

		// Create a new state tracker object
		// (optional) Register globally by supplying a reference name
		var _createTracker = function(registrationName) {
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
		var createDefaultTracker = function(registrationName) {
			return createCustomTracker([
				{set: "idle", check: "isIdle"}
				, {set: "activate", check: "isActive"}
				, {set: "complete", check: "isComplete"}
				, {set: "fail", check: "isFailed"}
			], registrationName).idle();
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
		var createCustomTracker = function(states, registrationName) {
			if (!angular.isArray(states) || !states.length)
				return null;

			// Create a basic tracker
			var tracker = _createTracker(registrationName);

			// Include the states supplied
			angular.forEach(states, function(state, index) {
				// Check based on type of state info supplied

				if (angular.isString(state))
					tracker = addState(tracker, state, state, "is" + _capitalize(state));
				else if (angular.isObject(state))
					tracker = addState(tracker, index, state.set, state.check);
			}, tracker);

			return tracker;
		};

		function addState(tracker, state, set, check) {
			// Sanitize the state name
			state = ("" + state).replace(/[^a-zA-Z0-9_]/g, "");

			// Register as a new state
			tracker._states[state] = state;

			// Register setter functions
			tracker[set] = function() {
				tracker._state = tracker._states[state];
				return tracker;
			};

			// Register check functions
			tracker[check] = function() {
				return tracker._state === tracker._states[state];
			};

			return tracker;
		}

		// Register a tracker globally against a reference name
		var registerTracker = function(registrationName, tracker) {
			registry[registrationName] = tracker;
			return tracker;
		};

		function _capitalize(name) {
			return name.charAt(0).toUpperCase() + name.slice(1);
		}

		////////////////////////
		// Public interface //
		////////////////////////

		return {
			new: createDefaultTracker
			, custom: createCustomTracker
		}
	});
