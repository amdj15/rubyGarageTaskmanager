(function(window, app, undefined){
	function projectsCtrl ($scope, projects, userRsc, $state) {
		$scope.list = projects.query();

		$scope.createProject = function(){
			var newProject = new projects({
				name: 'New project'
			});

			newProject.$save().then(function(){
				$scope.list.push(newProject);
			}).catch(function(err){
				console.warn(err);
			});
		};

		$scope.signOut = function(){
			userRsc.logout().$promise.then(function(){
				$state.go('auth');
			});
		};
	}

	app.controller('projectsCtrl', ['$scope' ,'projects', 'userRsc', '$state', projectsCtrl]);
})(window, window.app);