(function(window, app, undefined){
	function authCtrl ($scope, userRsc, $state) {
		$scope.signUp = {
			data: {
				email: '',
				password: ''
			},
			action: function(form) {
				if (form.$invalid) {
					return;
				}

				var user = new userRsc($scope.signUp.data);
				user.$create().then(function(){
					$state.go('main');
				}).catch(function(err){
					console.warn(err);
				});
			}
		}

		$scope.signIn = {
			data: {
				email: '',
				password: ''
			},
			error: '',
			action: function(form) {
				if (form.$invalid) {
					return;
				}

				var user = new userRsc($scope.signIn.data);
				user.$login().then(function(){
					$state.go('main');
				}).catch(function(err){
					console.warn(err);
					$scope.signIn.error = err.data.error;
				});
			}
		}
	}

	app.controller('authCtrl', ['$scope' , 'userRsc', '$state', authCtrl]);
})(window, window.app);