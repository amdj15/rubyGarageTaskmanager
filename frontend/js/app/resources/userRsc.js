(function(window, app, undefined){
	app.factory('userRsc', ['$resource', function($resource){
		return $resource(
			'/user/:id/:action',
			{},
			{
				login: {
					method: "POST",
					params: {
						action: "signIn"
					}
				},
				logout: {
					method: "GET",
					params: {
						action: "signOut"
					}
				},
				create: {
					method: "POST",
					params: {
						action: "signUp"
					}
				}
			}
		);
	}]);
})(window, window.app);