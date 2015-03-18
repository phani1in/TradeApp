// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $location, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
		
		db = $cordovaSQLite.openDB({ name: "users.db" });
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS people (id integer primary key, username text, password text, image text, name text, address text)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS stocks (id integer primary key, symbols text, uid text)");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS balance (id integer primary key, balance text, uid text)");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS mystocks (id integer primary key, symbol text, name text, price text, date DATETIME DEFAULT CURRENT_TIMESTAMP, uid text, status text DEFAULT 1)");
        
		$location.path('app/login');
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  
  .state('app.login', {
    url: "/login",
    views: {
      'menuContent': {
        templateUrl: "templates/login.html",
		 controller: 'LoginCtrl'
      }
    }
  })
  
  .state('app.register', {
    url: "/register",
    views: {
      'menuContent': {
        templateUrl: "templates/register.html",
		 controller: 'RegCtrl'
      }
    }
  })
  
  .state('app.balance', {
    url: "/balance",
    views: {
      'menuContent': {
        templateUrl: "templates/balance.html",
		 controller: 'BalCtrl'
      }
    }
  })
  
  .state('app.deposit', {
    url: "/deposit",
    views: {
      'menuContent': {
        templateUrl: "templates/deposit.html",
		 controller: 'DepCtrl'
      }
    }
  })
  
  .state('app.withdraw', {
    url: "/withdraw",
    views: {
      'menuContent': {
        templateUrl: "templates/withdraw.html",
		 controller: 'WithCtrl'
      }
    }
  })
  
  .state('app.mystocks', {
    url: "/mystocks",
    views: {
      'menuContent': {
        templateUrl: "templates/mystocks.html",
		 controller: 'MstkCtrl'
      }
    }
  })
  
  .state('app.image', {
    url: "/image",
    views: {
      'menuContent': {
        templateUrl: "templates/image.html",
		 controller: 'ImgCtrl'
      }
    }
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })

  .state('app.users', {
    url: "/users",
    views: {
      'menuContent': {
        templateUrl: "templates/users.html",
		controller: 'UserCtrl'
      }
    }
  })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/app/playlists');
});
