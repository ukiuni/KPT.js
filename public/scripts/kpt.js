var myapp = angular.module('kptApp', [ 'ui.sortable', 'ui.bootstrap', 'dialogs', 'ngSanitize', 'btford.markdown' ]);
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
							item.status = parseInt(i);
							item.index = parseInt(j);
							var movedItem = item;
							break;
						}
					}
					if (status) {
						break;
					}
				}
				$scope.saveMovedItem(movedItem);
			}, 0);
		},
		distance : 10
	};
	$scope.createItem = function(status) {
		$http({
			url : 'items',
			method : "POST",
			data : JSON.stringify({
				projectKey : $scope.projectKey,
				index : $scope.todos[status].length,
				status : status
			}),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(item, responseStatus, headers, config) {
			item.title = "";
			item.description = "";
			$scope.todos[status].push(item);
			$scope.edit(item);
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
	$scope.edit = function(item, $event) {
		$scope.editingTodo = {
			title : item.title + "",
			description : item.description + ""
		};
		var dialogController = [ "$scope", "$modalInstance", "editingTodo", function($scope, $modalInstance, editingTodo) {
			$scope.editingTodo = editingTodo;
			$scope.save = function() {
				$modalInstance.close({
					func : "update",
					item : $scope.editingTodo
				});
			};
			$scope["delete"] = function() {
				$modalInstance.close({
					func : "delete",
					item : $scope.editingTodo
				});
			};
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/editItemDialog.html?time=' + new Date().getTime(),
			controller : dialogController,
			resolve : {
				editingTodo : function() {
					return $scope.editingTodo;
				}
			}
		});
		modalInstance.result.then(function(res) {
			if ("delete" == res.func) {
				$scope.deleteItem(item);
			} else if ("update" == res.func) {
				item.title = res.item.title;
				item.description = res.item.description;
				$scope.saveItem(item);
			}
		}, function() {
			console.log('Modal dismissed at: ' + new Date());
		});
		if ($event) {
			$event.stopPropagation();
		}
	}
	$scope.saveMovedItem = function(item) {
		$http({
			url : 'items/move',
			method : "put",
			data : JSON.stringify({
				projectKey : $scope.projectKey,
				item : item
			}),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(item, status, headers, config) {
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}

	$scope.logModels = function() {
		$scope.sortingLog = [];
		for (var i = 0; i < $scope.todos.length; i++) {
			var logEntry = $scope.todos[i].map(function(x) {
				return x.title;
			}).join(', ');
			logEntry = 'container ' + (i + 1) + ': ' + logEntry;
			$scope.sortingLog.push(logEntry);
		}
	};
	$scope.projectKey = $location.search()["project_key"];
	if (!$scope.projectKey) {
		$scope.error = "project not defined";
	}
	$http.get('projects?key=' + $scope.projectKey).success(function(project, status, headers, config) {
		$rootScope.projectName = project.project.name;
		$scope.todos = [ [], [], [] ];
		for ( var i in project.items) {
			var item = project.items[i];
			$scope.todos[item.status].push(item);
		}
		$scope.socket = io.connect('http://' + window.document.location.host);
		$scope.socket.emit('message', {
			command : 'join',
			projectKey : $scope.projectKey
		});
		$scope.socket.on("delete", function(item) {
			$scope.$apply(function() {
				$scope.deleteItemFromDisplay(item);
			});
		});
		$scope.socket.on("move", function(item) {
			$scope.$apply(function() {
				$scope.deleteItemFromDisplay(item);
				$scope.insertItemToDispoay(item);
			});
		});
		$scope.socket.on("update", function(item) {
			$scope.$apply(function() {
				var updated = $scope.updateItemOnDisplay(item);
				if (!updated) {
					$scope.todos[item.status].push(item);
				}
			});
		});
	}).error(function(data, status, headers, config) {
		$scope.error = "Load error";
	});
	$scope.saveItem = function(item) {
		$http({
			url : 'items',
			method : "PUT",
			data : JSON.stringify(item),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data, status, headers, config) {
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
	$scope.deleteItem = function(item) {
		$http({
			url : 'items',
			method : "DELETE",
			data : JSON.stringify(item),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data, status, headers, config) {
			$scope.deleteItemFromDisplay(item);
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}

	$rootScope.confirmDeleteKPItems = function() {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope['delete'] = function() {
				$modalInstance.close();
			};
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDeleteKeepAndDeleteItemsDialog.html?time=' + new Date().getTime(),
			controller : dialogController
		});
		modalInstance.result.then(function(res) {
			$scope.deleteKPItems();
		}, function() {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	$scope.deleteKPItems = function() {
		$http({
			url : 'items',
			method : "DELETE",
			data : JSON.stringify($scope.todos[0].concat($scope.todos[1])),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data, status, headers, config) {
			$scope.todos[0] = [];
			$scope.todos[1] = [];
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
	$scope.deleteItemFromDisplay = function(item) {
		for ( var i in $scope.todos) {
			var items = $scope.todos[i];
			for ( var j in items) {
				var targetItem = items[j];
				if (targetItem.key == item.key) {
					$scope.todos[i].splice(j, 1);
					return;
				}
			}
		}
	}

	$scope.insertItemToDispoay = function(item) {
		$scope.todos[item.status].splice(item.index, 0, item);
	}

	$scope.updateItemOnDisplay = function(item) {
		for ( var i in $scope.todos) {
			var items = $scope.todos[i];
			for ( var j in items) {
				var targetItem = items[j];
				if (targetItem.key == item.key) {
					items[j] = item;
					return true;
				}
			}
		}
		return false;
	}
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
	$rootScope.takeSnapShot = function(item) {
		$http({
			url : 'projects/snapshot',
			method : "POST",
			data : JSON.stringify({
				key : $scope.projectKey
			}),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data, status, headers, config) {
			var dialogController = [ "$scope", "$modalInstance", "link", function($scope, $modalInstance, link) {
				$scope.link = link;
			} ];
			var modalInstance = $modal.open({
				templateUrl : 'template/openSnapshotDialog.html?time=' + new Date().getTime(),
				controller : dialogController,
				resolve : {
					link : function() {
						return "snapshot.html?key=" + data.key;
					}
				}
			});
		}).error(function(data, status, headers, config) {
			$scope.error = "error";
		});
	}
} ];
myapp.controller('sortableController', myController);