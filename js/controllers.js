angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location) {

	$scope.logout = function() {
		localStorage.setItem("user_id",JSON.stringify(""));
		localStorage.setItem("symbols",JSON.stringify(""));
		$location.path('app/login');
	}

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope, $http, $cordovaSQLite, $state, $location) {
					var uid = JSON.parse(localStorage.getItem("user_id"));
					var query = "SELECT * FROM stocks WHERE uid = ?";
					$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
					
						if(res.rows.length > 0) {
							var symbols = res.rows.item(0).symbols;
							localStorage.setItem("symbols",JSON.stringify(symbols));
						} else {
							alert("There are no stocks added yet");
						}
					
					})
					
					
						var uid = JSON.parse(localStorage.getItem("user_id"));
						var query = "SELECT * FROM balance WHERE uid = ?";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								$scope.balance = res.rows.item(0).balance;
							} else {
								var query = "INSERT INTO balance (balance, uid) VALUES (?,?)";
								$cordovaSQLite.execute(db, query, ["0", uid]).then(function(res) {
									$scope.balance = "0";
								}, function (err) {
									alert('Could not add new balance row');
								})
							}
						})

					
					$http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
					var stks = JSON.parse(localStorage.getItem("symbols"));
					
					if(!stks) {} else {
				
					$http.post('http://query.yahooapis.com/v1/public/yql/?q=select * from yahoo.finance.quotes where symbol in ('+stks+')&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json')
						.success(function (result, status) {							
							$scope.stocks = eval(result.query.results.quote);
						})
						.error(function(data,status) {
							alert('Sorry, we couldnot fetch data at the moment');
						})
					}
						
					$scope.addStock = function() {
						var uid = JSON.parse(localStorage.getItem("user_id"));
						var symbol = document.getElementById("symbol").value;
						if(symbol=='') {
							alert('Please provide a valid symbol');
						} else {
						var query = "SELECT * FROM stocks WHERE uid = ?";
						
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {
								var stocks = res.rows.item(0).symbols;
								
								var stocksall = stocks + ',"' + symbol +'"';
								var uid = JSON.parse(localStorage.getItem("user_id"));
								localStorage.setItem("symbols",JSON.stringify(stocksall));
								var query = "UPDATE stocks SET symbols='"+stocksall+"' WHERE uid='"+uid+"'";
								$cordovaSQLite.execute(db, query).then(function(res) {
									alert('Stock symbols are updated');
									$state.go($state.current, {}, {reload: true})
								}, function (err) {
									alert('fail1');
								})
						
							} else {
								var uid = JSON.parse(localStorage.getItem("user_id"));
								var query = "INSERT INTO stocks (symbols, uid) VALUES (?,?)";
								var s = '"'+symbol+'"';
								localStorage.setItem("symbols",JSON.stringify(s));
								$cordovaSQLite.execute(db, query, [s, uid]).then(function(res) {
									alert('Stock symbol is registered');
									$state.go($state.current, {}, {reload: true});
								}, function (err) {
									alert('fail2');
								})
							}
					  })
					  
					 }
					
					}
			
					
					$scope.buy = function(id) {
				
						var uid = JSON.parse(localStorage.getItem("user_id"));
						var name = document.getElementById(id+"_name").value;
						var price = document.getElementById(id+"_price").value;
						
						var query = "SELECT * FROM balance WHERE uid = ?";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								$scope.balance = res.rows.item(0).balance;
							}
						})
						
						if(parseFloat($scope.balance) < parseFloat(price)) {
							alert('Sorry! you dont have sufficient balance.');
						} else {
							
							var query = "INSERT INTO mystocks (symbol, name, price, uid) VALUES (?,?,?,?)";
							$cordovaSQLite.execute(db, query, [id, name, price, uid ]).then(function(res) {
							
								updatebal($scope.balance,price);
							
								$location.path('app/mystocks');
							}, function (err) {
								alert('We couldnt purchase this time. Try later.'+err);
							})
							
							function updatebal(cbal,dbal) {
								var totalbal = parseFloat(cbal) - parseFloat(dbal);
								var query = "UPDATE balance SET balance='"+totalbal+"' WHERE uid='"+uid+"'";
								$cordovaSQLite.execute(db, query).then(function(res) {
									alert('You have purchased share for '+dbal);
										
								}, function (err) {
									alert('Sorry, we could not deposit funds at moment. Try again.');
								})
							}
						}
					}

})

.controller('LoginCtrl', function($scope, $location, $cordovaSQLite) {
  $scope.register = function() {
	$location.path('app/register');
  }
  
  var uid = JSON.parse(localStorage.getItem("user_id"));
  var image = JSON.parse(localStorage.getItem("image"));
  if(uid=='') {} else {
	if(!image) {
		$location.path('app/image');
	} else {
		$location.path('app/playlists');
	}
  }
  
  
  $scope.doLogin = function() {
	
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	if(username==='' || password==='') {
		alert('Please provide valid username and password');
	} else {
		var query = "SELECT * FROM people WHERE username = ? AND password = ?";
		$cordovaSQLite.execute(db, query, [username, password]).then(function(res) {
		
			if(res.rows.length > 0) {
				var uid = res.rows.item(0).id;
				var image = res.rows.item(0).image;
				localStorage.setItem("user_id",JSON.stringify(uid));
				localStorage.setItem("image",JSON.stringify(image));
				
				if(!image) {
					$location.path('app/image');
				} else {
					$location.path('app/playlists');
				}
			} else {
				alert("Sorry, no such user exist");
			}
		
		})
	
   }
  
  }
})

.controller('RegCtrl', function($scope, $location, $cordovaSQLite) {
  $scope.login = function() {
	$location.path('app/login');
  }
  
  $scope.doRegister = function() {

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	if(username=='' || password=='') {
		alert('Please provide valid details');
	} else {
		var query = "SELECT * FROM people WHERE username = ?";
		$cordovaSQLite.execute(db, query, [username]).then(function(res) {
			if(res.rows.length > 0) {
				alert('User already exists with same username.');
			} else {
				var query = "INSERT INTO people (username, password) VALUES (?,?)";
				$cordovaSQLite.execute(db, query, [username, password]).then(function(res) {
					alert('You account have been registered');
					$location.path('/app/login');
				}, function (err) {
					alert('Sorry, we couldnt register your account');
				})
			}
	  })
  }
  }
})

.controller('BalCtrl', function($scope, $location, $cordovaSQLite) {

						var uid = JSON.parse(localStorage.getItem("user_id"));
						var query = "SELECT * FROM balance WHERE uid = ?";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								$scope.balance = res.rows.item(0).balance;
							} 
						})
						
						var query = "SELECT * FROM mystocks WHERE uid = ? AND status=1";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								var itemsColl = [];
								for (var i = 0; i < res.rows.length; i++) {
									itemsColl[i] = res.rows.item(i);
								}
								
								$scope.pstks = itemsColl;
								
								
							} else {
							
							}
						})
						
						
						
						var query = "SELECT * FROM mystocks WHERE uid = ? AND status=0";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								var itemsColl = [];
								for (var i = 0; i < res.rows.length; i++) {
									itemsColl[i] = res.rows.item(i);
								}
								
								$scope.sstks = itemsColl;
								
								
							} else {
							
							}
						})
						
						
						
	
	
})

.controller('DepCtrl', function($scope, $location, $cordovaSQLite) {

						var uid = JSON.parse(localStorage.getItem("user_id"));
						var query = "SELECT * FROM balance WHERE uid = ?";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								$scope.balance = res.rows.item(0).balance;
							} 
						})
						
						$scope.deposit = function () {
							var deposit = document.getElementById("deposit").value;
							var current = document.getElementById("current").value;
							var total = parseInt(deposit, 10) + parseInt(current, 10);
							var uid = JSON.parse(localStorage.getItem("user_id"));
							var query = "UPDATE balance SET balance='"+total+"' WHERE uid='"+uid+"'";
								$cordovaSQLite.execute(db, query).then(function(res) {
									alert('You have successfully deposited the amount');
									$location.path('/app/balance');
								}, function (err) {
									alert('Sorry, we could not deposit funds at moment. Try again.');
								})
						}
	
})

.controller('WithCtrl', function($scope, $location, $cordovaSQLite) {

						var uid = JSON.parse(localStorage.getItem("user_id"));
						var query = "SELECT * FROM balance WHERE uid = ?";
						$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
							if(res.rows.length > 0) {	
								$scope.balance = res.rows.item(0).balance;
							} 
						})
						
						$scope.withdraw = function () {
							var withdraw = document.getElementById("withdraw").value;
							var current = document.getElementById("current").value;
							if(withdraw > current) {
								alert('Amount to withdraw must be lesser that total balance');
							} else {
							var total = parseInt(current, 10) - parseInt(withdraw, 10);
							var uid = JSON.parse(localStorage.getItem("user_id"));
							var query = "UPDATE balance SET balance='"+total+"' WHERE uid='"+uid+"'";
								$cordovaSQLite.execute(db, query).then(function(res) {
									alert('You have successfully withdrawl the amount');
									$location.path('/app/balance');
								}, function (err) {
									alert('Sorry, we could not deposit funds at moment. Try again.');
								})
							}
						}
	
	
})

.controller('MstkCtrl', function($scope, $stateParams, $cordovaSQLite, $http, $location) {

	var items = '';
	var uid = JSON.parse(localStorage.getItem("user_id"));
	var query = "SELECT * FROM mystocks WHERE uid = ? AND status=1";
	$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
		if(res.rows.length > 0) {	
			var itemsColl = [];
			for (var i = 0; i < res.rows.length; i++) {
				itemsColl[i] = res.rows.item(i);
			}
			
			$scope.mystocks = itemsColl;
			
			
		} else {
			alert('No stocks were found');
		}
	})
	
	
	$scope.sell = function(id) {
	
		var query = "SELECT * FROM mystocks WHERE id = ?";
		$cordovaSQLite.execute(db, query, [id]).then(function(res) {
			if(res.rows.length > 0) {
				var uid = JSON.parse(localStorage.getItem("user_id"));
				$http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
				$http.post('http://query.yahooapis.com/v1/public/yql/?q=select * from yahoo.finance.quotes where symbol in ("'+res.rows.item(0).symbol+'")&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json')
				.success(function (result, status) {
					$scope.cp = eval(result.query.results.quote);			
					var currentp = $scope.cp.LastTradePriceOnly
					if(confirm('Current price for '+res.rows.item(0).name+' is : '+currentp)) {
					
								var query = "SELECT * FROM balance WHERE uid = ?";
								$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
									if(res.rows.length > 0) {	
										var cbal = res.rows.item(0).balance;
										updatebal(cbal);
									} 
								}, function (err) {
									alert('Sorry, we could not run query at moment. Try again.');
								})
								
							
								function updatebal(cbal) {
									var totalbal = parseInt(cbal, 10) + parseInt(currentp, 10);
									var query = "UPDATE balance SET balance='"+totalbal+"' WHERE uid='"+uid+"'";
									$cordovaSQLite.execute(db, query).then(function(res) {
										alert('You have sold your share for '+currentp);
										updateStat(id);
										
									}, function (err) {
										alert('Sorry, we could not deposit funds at moment. Try again.');
									})
								}
								
								function updateStat(id){
									var query = "UPDATE mystocks SET status='0' WHERE id='"+id+"'";
									$cordovaSQLite.execute(db, query).then(function(res) {
										
										$location.path('/app/balance');
										
									}, function (err) {
										
									})
								}
					
					
							
					}
				})
				.error(function(data,status) {
					alert('Sorry, we couldnot fetch data at the moment');
				});
			}
	
		})
	
	}
	
	
	
})


.controller('UserCtrl', function($scope, $stateParams, $state, $cordovaSQLite) {

	var uid = JSON.parse(localStorage.getItem("user_id"));
	var query = "SELECT * FROM people ORDER BY id DESC";
	$cordovaSQLite.execute(db, query).then(function(res) {
		if(res.rows.length > 0) {	
			var itemsColl = [];
			for (var i = 0; i < res.rows.length; i++) {
				itemsColl[i] = res.rows.item(i);
			}
			
			$scope.users = itemsColl;
			
		} else {
			alert('No users were found');
		}
	})
	
  $scope.register = function() {

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	if(username=='' || password=='') {
		alert('Please provide valid username & password');
	} else {
		var query = "SELECT * FROM people WHERE username = ?";
		$cordovaSQLite.execute(db, query, [username]).then(function(res) {
			if(res.rows.length > 0) {
				alert('User already exists with same username.');
			} else {
				var query = "INSERT INTO people (username, password) VALUES (?,?)";
				$cordovaSQLite.execute(db, query, [username, password]).then(function(res) {
					alert('A new user have been created successfully');
					$state.go($state.current, {}, {reload: true});
				}, function (err) {
					alert('Sorry, we couldnt create a new user');
				})
			}
	  })
  }
  }
  

})

.controller('ImgCtrl', function($scope, $stateParams, $cordovaCamera, $location, $cordovaSQLite, $state) {

	var image = JSON.parse(localStorage.getItem("image"));
	if(!image) {
		$scope.image = "http://www.clker.com/cliparts/5/7/4/8/13099629981030824019profile.svg.med.png";
	} else {
		$scope.image = image;
	}
	
	var uid = JSON.parse(localStorage.getItem("user_id"));
	var query = "SELECT * FROM people WHERE id = ?";
		$cordovaSQLite.execute(db, query, [uid]).then(function(res) {
			if(res.rows.length > 0) {
				$scope.name = res.rows.item(0).name;
				$scope.address = res.rows.item(0).address;
			} else {
				alert('Problem getting data');
			}
	  })
	
	
	$scope.getPhoto = function() {
			var options = { 
				quality : 60, 
				destinationType : Camera.DestinationType.FILE_URI, 
				sourceType : Camera.PictureSourceType.CAMERA, 
				allowEdit : false,
				encodingType: Camera.EncodingType.JPEG,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: true
			};
	 
			$cordovaCamera.getPicture(options).then(function(imageData) {
				$scope.image =  imageData;
				localStorage.setItem("image",JSON.stringify(imageData));
				
				var uid = JSON.parse(localStorage.getItem("user_id"));
				var query = "UPDATE people SET image='"+imageData+"' WHERE id='"+uid+"'";
					$cordovaSQLite.execute(db, query).then(function(res) {
					
				}, function (err) {
					alert('Sorry, we could not deposit funds at moment. Try again.');
				})
				
			}, function(err) {
				// An error occured. Show a message to the user
				alert('We encountered an error');
			});
		}
		
		
		$scope.update = function() {
		
			var name = document.getElementById("name").value;
			var address = document.getElementById("address").value;
			var uid = JSON.parse(localStorage.getItem("user_id"));
			var image = JSON.parse(localStorage.getItem("image"));
			
			var query = "UPDATE people SET name='"+name+"', address='"+address+"', image='"+image+"' WHERE id='"+uid+"'";
			$cordovaSQLite.execute(db, query).then(function(res) {
				alert('You have successfully updated your profile');
				$state.go($state.current, {}, {reload: true});
			}, function (err) {
				alert('Sorry, we could not execute at moment. Try again.');
			})
			
		
		}

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
