(function(window, app, undefined){
	function mainCtrl ($scope, $state) {
		$scope.$state = $state;
	}

	app.controller('mainCtrl', ['$scope' , '$state', mainCtrl]);
})(window, window.app);