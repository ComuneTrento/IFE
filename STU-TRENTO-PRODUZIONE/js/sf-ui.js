// Session Feedback User Interface (sf-ui.js)
//-----------------------------------------------------------------------------
// This Javascripts contains the methods to open the Session Feedback
// dialog and send it via POST using its API
//-----------------------------------------------------------------------------

var sfUI = (function () {
  var instance; // Singleton Instance of the UI component

  function Singleton() {
    // Compònent-related variables
    var buttonToShowSfId = '';
    var formSelector = null;

    // Internal parts
    var ctzSelected = false;
    var simplificationSelected = false;
    var timeoutExceeded = false;
    var timeout = 5 * 60 * 1000; // 5 minutes in ms
    var startTime;
    var language = null;

    var active = false;
    function initComponent (parameters) {
      buttonToShowSfId = parameters.buttonToShowSfId;
      formSelector = parameters.formSelector;
      language = parameters.language || 'en';
      // Add the onclick event
      if (buttonToShowSfId) {
        var button = document.getElementById(buttonToShowSfId);
        if (button != null) {
          button.addEventListener('click', function(){
        	  sfUI.getInstance().showSF();
          });
        }
      }
      if (formSelector != null) {
    	  var formElement = $(formSelector).get(0);
    	  var originalHandler = formElement.onsubmit;
    	  var handler = function(e) {
    		  if (!authManager.getInstance().isEnabled()){
    			  return true;
    		  }
    		  e.preventDefault();
			  formElement.onsubmit = function(){
				  return true;
			  }    				  
    		  showSF();
    		  return false;
    	  };
    	  if (originalHandler != null && typeof originalHandler == 'function') {
    		  handler = function(e){
        		  if (!authManager.getInstance().isEnabled()) {
        			  return originalHandler();
        		  }
    			  var res = originalHandler();
        		  e.preventDefault();
    			  if (res) {
    				  formElement.onsubmit = function(){
    					  return true;
    				  }    				  
    				  showSF();
    			  }
    		  }
    	  }
    	  formElement.onsubmit = handler;
      }
      sfCORE.getInstance().init({
          endpoint: parameters.apiEndpoint,
          listener: parameters.listener,
          language: language
        });

      // Start counting time
      startTime = new Date().getTime();
    }

    function showSF () {

      if (!authManager.getInstance().isEnabled()){
        alert("You must be log in SIMPATICO");
        console.log("Auth needed");
        return; // If there isn't an user logged in, SF won't work
      } 

      var data = JSON.parse(localStorage.userData); // Get the user's ID from localStorage
      // Check if timeout exists
      var currentTime = new Date().getTime();
      timeoutExceeded = isTimeExceeded(currentTime - startTime);
      sfCORE.getInstance().selectDialog(timeoutExceeded, data.userId);
      active = true;
    }

    function isTimeExceeded (timeMs) {
      if (timeMs > timeout)
        timeoutExceeded = true;

      return timeoutExceeded;
    }
    function isActive() {
    	return this.active;
    }
    function hideSF() {
    	this.active = false;
        $('#dialogSF').dialog("destroy").remove();
    }

    return {
      init: initComponent,
      isTimeExceeded: isTimeExceeded,
      showSF: showSF,
      hideSF: hideSF,
      isActive: isActive
    };
  }

  return {
    getInstance: function () {
      if (!instance) instance = Singleton();
      return instance;
    }
  };
})();