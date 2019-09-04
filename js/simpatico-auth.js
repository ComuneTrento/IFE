// Auth functionality
// The AAC server has to be installed
// https://github.com/SIMPATICOProject/aac

var authManager = (function () {
  var instance; // Singleton Instance of the UI component
  function Singleton () {
    var featureEnabled = true;
    // Component-related variables
    var userdataElementID = 'simp-usr-data'
    var endpoint = 'https://simpatico.hi-iberia.es:4570/aac/'
    // Google
    //var ifeClientID = '5c24dd95-a1b4-4208-ab5a-ce288963fe28'
    //var authority = 'google';
    // Internal
    var ifeClientID = 'f21558f2-0992-47b1-85af-1ada614d8cc6'
    var authority = 'internal';
    var redirect = null;
    var greeting = '';

    function initComponent(parameters) {
      endpoint = parameters.endpoint;
      ifeClientID = parameters.clientID;
      authority = parameters.authority;
      greeting = parameters.greeting || '';
      // support null setting where authority is selected by user
      if (!authority) {
        authority = "";
      } else {
        authority = "/"+authority;
      }
      // allow for custom redirect
      redirect = parameters.redirect;
      if (!redirect) {
        var base = window.location.href;
        var arr = base.split("/");
        redirect = arr[0] + '//' + arr[2] + '/IFE/login.html';
      }
    }

    // Component-related methods and behaviour
    function handleAuthClick() {
      if (featureEnabled) return;
      var base = window.location.href;
      var arr = base.split("/");
	 
      var url = endpoint + '/eauth/authorize' + authority + '?' +
                    'response_type=token' +
                    '&redirect_uri=' + redirect + // login window URL
                    '&client_id=' + ifeClientID; //Client id from the AAC console			

      var win = window.open(url, 'AuthPopup', 'width=1024,height=768,resizable=1,scrollbars=1,status=1');

      var processData = function(data) {
        jQuery.ajax({
		  url: endpoint + '/basicprofile/me',
		  type: 'GET',
		  dataType: 'json',
		  success: function(data) {
		    localStorage.userData = JSON.stringify(data);
		    updateUserData();
		  },
		  error: function(err) {
		    console.log(err);
		  },
		  beforeSend: function(xhr) {
		    xhr.setRequestHeader('Authorization', 'Bearer ' + data.access_token);
		  }
		});
		// add expiration timestamp with 1 hour buffer
		data.expires_on = new Date().getTime() + parseInt(data.expires_in)*1000 /*- 1000*60*60*1*/;
		localStorage.aacTokenData = JSON.stringify(data);
      }

      window.handleDataDirectly = function(dataStr) {
    	  var data = JSON.parse(dataStr);
    	  processData(data);
    	  win.close();
      }
      window.addEventListener('message', function (event) {
        if (!event.data.access_token) return;
    	  processData(event.data);
      }, false);
    }

    // attach login flow to the sign-in button
    function handleSignoutClick(event) {
      if (!featureEnabled) return;
      localStorage.userData = '';
	  localStorage.aacTokenData = '';
	  updateUserData();
    }

    // It checks if the corresponding user is previously loged in and updates the view accordingly 
    function updateUserData () {
      console.log(">>> updateUserData()");
        var data = JSON.parse(localStorage.userData || 'null');
        if (!!data) {
          var tokenData = JSON.parse(localStorage.aacTokenData || 'null');
          if (! tokenData || tokenData.expires_on < new Date().getTime()) {
              localStorage.userData = '';
              localStorage.aacTokenData = '';
              updateUserData();
              return;
          }
          if (document.getElementById(userdataElementID)) {
              document.getElementById(userdataElementID).innerHTML = data.name + ' '+ data.surname;
              document.getElementById(userdataElementID).style = "display:block";        	  
          }
          enablePrivateFeatures();
          featureEnabled = true;

        } else {
        	if (document.getElementById(userdataElementID)) {
	          document.getElementById(userdataElementID).innerHTML = greeting;
	          document.getElementById(userdataElementID).style  = "display:block";
        	}
            disablePrivateFeatures();
            featureEnabled = false;
        }
      console.log("<<< updateUserData()");
    }

    return {
      // Public definitions
      init: initComponent,          // Called only one time
      enable: handleAuthClick,      // When the Component button is enabled
      disable: handleSignoutClick,  // When the CB. is disabled or another one enabled
      isEnabled: function() { return featureEnabled;}, // Returns if the feature is enabled
      // More component related public methods
      updateUserData: updateUserData,
      getUserId: function() {
          var data = JSON.parse(localStorage.userData || 'null');
          return !!data ? data.userId : null
      },
      getToken: function() {
          var tokenData = JSON.parse(localStorage.aacTokenData || 'null');
        return !!tokenData ? tokenData.access_token : null;
      }
    };
  }
  
  return {
    getInstance: function() {
      if(!instance) instance = Singleton();
      return instance;
    }
  };
})();
