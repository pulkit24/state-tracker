angular.module("state-tracker")
.filter("stateTracker", function() {
	return function(tracker, args) {
		if(angular.isArray(args))
			return tracker ? tracker.$map(args) : null;
		else
			return tracker ? tracker.$map(arguments, 1) : null;
	};
});