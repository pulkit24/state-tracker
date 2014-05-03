angular.module("state-tracker")
	.filter("stateTracker", function() {
		return function(tracker, args) {

			if (tracker) {
				if (angular.isArray(args)) {

					var mappedValue = tracker.$map(args);
					if (mappedValue)
						return mappedValue;

					else if (args.length > 0)
						return args[0];

					else return null;

				} else {

					var mappedValue = tracker.$map(arguments, 1);
					if (mappedValue)
						return mappedValue;

					else if (arguments.length > 1)
						return arguments[1];

					else
						return null;
				}

			} else
				return null;
		};
	});
