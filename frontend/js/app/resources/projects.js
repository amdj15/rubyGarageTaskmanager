(function(window, app, undefined){
	app.factory('projects', ['$resource', function($resource){
		return $resource(
			'/projects/:listCtrl:id/:docCtrl',
			{
				id: '@id',
				listCtrl: '@listCtrl',
				docCtrl: '@docCtrl'
			},
			{
				delete: {
					method: "DELETE",
					params: {
						docCtrl: 'delete'
					}
				},
				tasks: {
					method: "GET",
					isArray: true,
					params: {
						docCtrl: 'tasks'
					}
				},
				sort: {
					method: "POST",
					params: {
						docCtrl: 'sort'
					}
				}
			}
		);
	}]);
})(window, window.app);