angular.module("state-tracker", [])
	.factory("stateTracker", function() {

		// Possible states
		var states = {};
		states.IDLE = 10;
		states.ACTIVE = 11;
		states.COMPLETE = 12;
		states.FAILED = 13;

		///////////////////////
		// Tracking object //
		///////////////////////
		var stateTracker = function() {

			// Current state
			this._state = states.IDLE;

			// Set state
			this._setState = function(state) {
				this._state = state;
			};

			///////////////////////////////////////////////
			// Human-friendly state setting functions //
			///////////////////////////////////////////////
			this.reset = function() {
				this._setState(states.IDLE);
				return this;
			};
			this.activate = function() {
				this._setState(states.ACTIVE);
				return this;
			};
			this.complete = function() {
				this._setState(states.COMPLETE);
				return this;
			};
			this.fail = function() {
				this._setState(states.FAILED);
				return this;
			};

			/////////////////////////////////
			// State checking functions //
			/////////////////////////////////
			this.isIdle = function() {
				return this._state === states.IDLE;
			};
			this.isActive = function() {
				return this._state === states.ACTIVE;
			};
			this.isComplete = function() {
				return this._state === states.COMPLETE;
			};
			this.isFailed = function() {
				return this._state === states.FAILED;
			};
		};

		////////////////////////
		// Manage trackers  //
		////////////////////////

		// Global registry of states - allows inter-scope communication
		var registry = {};

		// Create a new state tracker object
		// (optional) Register globally by supplying a reference name
		var createTracker = function(registrationName) {
			var tracker = new stateTracker();
			if(registrationName)
				registerTracker(registrationName, tracker);
			return tracker;
		};

		// Register a tracker globally against a reference name
		var registerTracker = function(registrationName, tracker) {
			registry[registrationName] = tracker;
			return tracker;
		};

		////////////////////////
		// Public interface //
		////////////////////////

		return {
			new: createTracker
		}
	});
