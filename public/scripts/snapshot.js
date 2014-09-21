var myapp = angular.module('sortableApp', [ 'ui.sortable', 'ui.bootstrap', 'dialogs', 'ngSanitize', 'btford.markdown' ]);
myapp.config([ "$locationProvider", "$httpProvider", function($locationProvider, $httpProvider) {
	$locationProvider.html5Mode(true);
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
} ]);
var myController = [ "$rootScope", "$scope", "$dialogs", "$modal", "$location", "$http", "$window", function($rootScope, $scope, $dialogs, $modal, $location, $http, $window) {
	$scope.sortingLog = [];
	$scope.sortableOptions = {
		placeholder : "item",
		connectWith : ".items-container",
		update : function(e, ui) {
			setTimeout(function() {
				var movedItemKey = ui.item.attr("key");
				for ( var i in $scope.todos) {
					var items = $scope.todos[i];
					for ( var j in items) {
						var item = items[j];
						if (item.key == movedItemKey) {
							var status = i;
							var index = j;
							break;
						}
					}
					if (status) {
						break;
					}
				}
				var changeItems = [];
				for ( var i in $scope.todos[status]) {
					var item = $scope.todos[status][i];
					var changeItem = {};
					changeItem.key = item.key;
					changeItem.title = item.title;
					changeItem.status = status;
					changeItem.index = i;
					changeItems.push(changeItem);
				}
				$scope.saveSortedItems(changeItems);
			}, 0);
		},
		distance : 10
	};
	$scope.isSnapshot = true;
	$scope.key = $location.search()["key"];
	if (!$scope.key) {
		$scope.error = "project not defined";
	}
	$http.get('projects/snapshot?key=' + $scope.key).success(function(project, status, headers, config) {
		$rootScope.projectName = project.project.name;
		$scope.todos = [ [], [], [] ];
		for ( var i in project.items) {
			var item = project.items[i];
			$scope.todos[item.status].push(item);
		}
	}).error(function(data, status, headers, config) {
		$scope.error = "Load error";
	});
	$scope.removeError = function() {
		$scope.error = null;
	}
	$scope.deleteDone = function() {
		$http.post('api/todo/delete', {
			projectKey : $scope.projectKey,
			todos : $scope.todos[2]
		}).error(function(data, status, headers, config) {
			$scope.error = "Delete error";
		});
		$scope.todos[2] = [];
	}
} ];
myapp.controller('sortableController', myController);