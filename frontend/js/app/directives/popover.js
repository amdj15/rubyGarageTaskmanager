(function(window, app, undefined){
	app.directive('popOverEdit', ['$templateCache', '$compile', function($templateCache, $compile){
		return {
			restrict: 'A',
			scope: {
				data: '=popOverEdit',
				change: '&popOverChange'
			},
			link: function(scope, elem, attrs) {
				var win = angular.element(window);

				elem.on('click', function(event){
					event.stopPropagation();

					if (!event.target.getAttribute('pop-over-edit') || event.target.children.length > 0) {
						return;
					}

					var popover = $compile( $templateCache.get('popoveredit.html'))(scope);

					var close = function() {
						popover.remove();
						win.off('click', close);

						scope.$apply();
					};

					win.on('click', close);
					elem.append(popover);
					popover.find('input').on('input', scope.change);
					popover.find('input')[0].focus();

					scope.$apply();
				});
			}
		};
	}]);

	app.directive('popOverDatepicker', ['$templateCache', '$compile', '$filter', function($templateCache, $compile, $filter){
		return {
			restrict: 'A',
			scope: {
				initialDate: '=popOverDatepicker',
				change: '&popOverDatepickerChange'
			},
			link: function(scope, elem, attrs) {
				var win = angular.element(window);

				scope.date =  angular.copy(scope.initialDate);

				scope.date = new Date(scope.date);
				if (scope.date == "Invalid Date" || scope.date.valueOf() === 0) {
					scope.date = null;
				}

				scope.minDate = new Date();

				elem.on('click', function(event){
					event.stopPropagation();

					if (event.target.getAttribute('pop-over-datepicker') === null || event.target.children.length > 0) {
						return;
					}

					var popover = $compile( $templateCache.get('datepicker.html'))(scope);

					var close = function() {
						popover.remove();
						win.off('click', close);

						scope.$apply();
					};

					win.on('click', close);
					elem.append(popover);

					scope.$apply();
				});

				scope.$watch('date', function(newVal, oldVal){
					if (newVal === oldVal) return;

					scope.initialDate = $filter('date')(scope.date, attrs.format);
					scope.change();
				});
			}
		};
	}]);
})(window, window.app);