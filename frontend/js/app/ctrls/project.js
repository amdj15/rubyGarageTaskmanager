(function(window, app, undefined){
	function projectCtrl ($scope, projects, task, $timeout, $filter) {
		$scope.delete = function() {
			if (!confirm('Are you sure?')) {
				return;
			}

			// remove
			$scope.project.$delete(function(){
				$scope.list.splice($scope.list.indexOf($scope.project), 1);
			});
		};

		$scope.tasks = projects.tasks({
			id: $scope.project.id
		});

		$scope.tasks.$promise.then(function(){
			for (var i in $scope.tasks) {
				$scope.tasks[i] = new task($scope.tasks[i]);
			}
		});

		$scope.newTask = {
			val: '',
			save: function(form) {
				if (form.$invalid) {
					return alert('Enter task text');
				}

				var newTask = new task({
					projectId: $scope.project.id,
					text: this.val
				});

				newTask.$save().then(function(){
					$scope.tasks.push(newTask);
					$scope.newTask.val = '';

					sortHandler();
				}).catch(function(err){
					console.warn(err);
				});
			}
		};

		$scope.deleteTask = function(task) {
			if (!confirm('Are you sure?')) {
				return;
			}

			task.$delete(function(){
				$scope.tasks.splice($scope.tasks.indexOf(task), 1);
			});
		};

		var sortHandler = function() {
			$scope.project.tasksOrder = [];

			$scope.tasks.forEach(function(item){
				$scope.project.tasksOrder.push(item.id);
			});

			$scope.project.$sort();
		};

		$scope.sortOptions =  {
			handle: '.move',
			stop: sortHandler
		};

		(function(){
			var timeoutId;

			$scope.editProjectName = function() {
				if (timeoutId) {
					$timeout.cancel(timeoutId);
				}

				timeoutId = $timeout(function(){
					$scope.project.$save();
				}, 700);
			};
		})();

		(function(){
			var timeoutId;

			$scope.saveTask = function(task, deferred) {
				if (!deferred) {
					return task.$save();
				}

				if (timeoutId) {
					$timeout.cancel(timeoutId);
				}

				timeoutId = $timeout(function(){
					task.$save();
				}, 700);
			};
		})();
	}

	app.controller('projectCtrl', ['$scope', 'projects', 'task', '$timeout', '$filter', projectCtrl]);
})(window, window.app);