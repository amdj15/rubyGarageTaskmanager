(function(window, angular, undefined){
	var app = angular.module('taskmanager', ['ngResource', 'ui.sortable', 'ui.bootstrap', 'ui.router']);

	app.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider){
		$stateProvider.state('main', {
			templateUrl: 'main.html'
		}).state('auth', {
			templateUrl: 'auth.html',
			controller: 'authCtrl'
		});

		$httpProvider.interceptors.push(['$q', '$injector', function($q, $injector){
			return {
				responseError: function(response) {
					if (response.status === 401) {
						$injector.get('$state').go('auth');
					}

					return $q.reject(response);
				}
			};
		}]);

	}]).run(['$state', function($state){
		$state.go('main');
	}]);

	window.app = app;
})(window, window.angular);