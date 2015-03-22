(function(window, app, undefined){
	app.factory('task', ['$resource', function($resource){
		return $resource('/tasks/:id', {
			id: '@id'
		});
	}]);
})(window, window.app);