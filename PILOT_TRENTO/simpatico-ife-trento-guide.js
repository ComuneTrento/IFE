// Simpatico main Interactive Front-End (simpatico-ife.js)
//-----------------------------------------------------------------------------
// This JavaScript is the main entry point to  the Interactive Front-End 
// component of the Simpatico Project (http://www.simpatico-project.eu/)
//
//-----------------------------------------------------------------------------

var waeStarted = true;

function isProd() {
	return window.location.origin.indexOf('sportello.comune.trento.it') >= 0;
}
function isTestProd() {
	return window.location.origin.indexOf('sportellotest.comune.trento.it') >= 0;
}

function logEnabled() {
	return false; //isProd() || isTestProd();
}
function sfEnabled() {
	return true;
}

// It inits all the enabled features of IFE 
function initFeatures() {
	
	if (!window.simpaticoEserviceName) {
		simpaticoEserviceName = '';
	}
	if (!window.simpaticoEserviceURL) {
		simpaticoEserviceURL = window.location.origin + window.location.pathname;
	}
	if (!window.serviceName) {
		serviceName = simpaticoEserviceName;
	}
	if (!window.serviceURL) {
		serviceURL = simpaticoEserviceURL;
	}
	
  // Init the Auth component (see simpatico-auth.js)
  // - endpoint: the main URL of the used AAC instance
  // - clientID: the IFE Client ID registered
  // - authority: the used authentication mechanism or null if many allowed
  // - redirect: url redirect (default is /IFE/login.html)
  authManager.getInstance().init({
    endpoint: 'https://tn.smartcommunitylab.it/aac', 
    clientID: '8ab03990-d5dd-47ea-8fc6-c92a3b0c04a4',
    authority: null,
    redirect: 'https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/logincb.html',
    greeting: 'ACCEDI A SIMPATICO'
  });

  // Init the Citizenpedia component (see ctz-ui.js)
  // - endpoint: the main URL of the used Citizenpedia instance
  // - cpdDiagramEndpoint: endpoint of the CPD process summary service (should end with eService)
  // - primaryColor: Color used to highlight the enhanced components
  // - secondaryColor: Color used to paint the question boxes backgrounds
  // - elementsToEnhanceClassName: The CSS class used to define the enhanced elements
  // - questionsBoxClassName: The CSS class of the box which shows questions
  // - questionsBoxTitle: Title of the box hwich shows questions
  // - addQuestionLabel: Text exposed to show the action to create a question
  // - diagramNotificationImage: Image to show when a diagram is found
  // - diagramNotificationClassName: The CSS class of the img shown when a diagram is found
  // - diagramNotificationText: The text to notify that a diagram
  // - questionSelectionFilters: filters for text selection to ask question for
  citizenpediaUI.getInstance().init({
    endpoint: 'https://simpatico.smartcommunitylab.it/qae',
    cpdDiagramEndpoint: 'https://dev.smartcommunitylab.it/cpd/api/diagram/eService',
    primaryColor: "#24BCDA",
    secondaryColor:"#D3F2F8",
    elementsToEnhanceClassName: "simpatico-query-and-answer",
    questionsBoxClassName: "simp-ctz-ui-qb",
    questionsBoxTitle: "Domande legate",
    addQuestionLabel: "+ Aggiungi una domanda",
    diagramNotificationImage: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png",
    diagramNotificationClassName: "simp-ctz-ui-diagram",
    diagramNotificationText: "C'e' una visualizzazione di e-service in Citizenpedia",
    questionSelectionFilters: ['h1', '.Rigaintestazione', '.Rigaintestazioneridotta']
  });

  // Init the Workflow Adaptation Engine component (see wae-ui.js)
  // - lang: language used
  // - endpoint: the main URL of the used WAE instance
  // - prevButtonLabel: Label for 'previous step' button
  // - nextButtonLabel: Label for 'next step' button
  // - topBarHeight: height of the bar to control the scroll
  // - errorLabel: map with blockId - error message in case of block precondition fails
  waeUI.getInstance().init({
		lang: 'it',
	  	endpoint: 'https://simpatico.smartcommunitylab.it/simp-engines/wae',
		prevButtonLabel: 'Precedente',
		nextButtonLabel: 'Successivo',
		lastButtonLabel: 'Fine',
		descriptionLabel: 'Guida passo a passo',
		topBarHeight: 0,
		errorLabel: ERROR_LABELS
  });
  
  // Declare here the buttons that will be available in the Simpatico Bar
  // Options available:
  buttons = [
                { //  workflow adaptation. Switch to the modality, where the form adaptation starts
                  id: 'workflow',
                  imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/play.png",
                  imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/play.png",
                  alt: "Guida",
                  // Ad-hoc css classes to define the enabled/disabled styles
                  styleClassEnabled: "simp-bottomBar-btn-active",
                  styleClassDisabled: "simp-bottomBar-btn-inactive",
                  isEnabled: function() { return waeUI.getInstance().isEnabled(); },
                  enable: function() { waeStarted = true; var idProfile = null; waeUI.getInstance().enableWithGuide(idProfile); },
                  disable: function() { waeStarted = false; waeUI.getInstance().disableWithGuide(); },
                  text: "Guida",
                  simpBar:"bottom"
                }
              ];
  }//initFeatures()
  
  // Placeholder. Called when authentication is done
  function enablePrivateFeatures() { }//enablePrivateFeatures(id)
  
  // Placeholder. Called upon logout
  // Called one time
  function disablePrivateFeatures() { }//disablePrivateFeatures()
   
  // switch on/off the control buttons.
  // -id: of the button which calls this function
  function toggleAction(id) {
    var clickedButton;
    if (buttons[0].id == id) {
      // Login button
      clickedButton = buttons[0];
    } else {
      // Disable all the buttons
      for (var i = 1, len = buttons.length; i < len; i++) {
        if(buttons[i].id == id) {
          clickedButton = buttons[i];
        }
      } 
      if (!!clickedButton && clickedButton.exclusive) {
          buttons.forEach(function(b){
              if (b.exclusive && b.id != clickedButton.id) b.disable();
          });
      }
    }
    // Enable/Disable the selected button
    if (clickedButton.isEnabled()) {
        clickedButton.disable();
    } else {
        clickedButton.enable();
    }
    updateButtonStyle(clickedButton);
  } //toggleAction(id)
  
  
  // Adds the corresponding styleClass depending on the current feature status
  // - button: to be updated
  function updateButtonStyle(button) {
    if (button.isEnabled()) {
      document.getElementById(button.id).classList.remove(button.styleClassDisabled);
      document.getElementById(button.id).classList.add(button.styleClassEnabled);
    } else {
      document.getElementById(button.id).classList.remove(button.styleClassEnabled);
      document.getElementById(button.id).classList.add(button.styleClassDisabled);
    }
  }
    
  /**/
    // It creates the HTML code corresponding to the button passed as parameter
  // - button: The button object stored in buttons
  function createBottomButtonHTML(button) {
    return '<div class="'+ button.styleClassDisabled +'" id="' + button.id + '" ' +'onclick="toggleAction(\'' + button.id + '\');"'+
                            '">'+
                            //'<a href="#">' +
                            '<img ' + 
                              'alt="' + button.alt + '" ' + 
                              'title="' + button.alt + '" ' +
                              'id="' + button.id + '-img" ' +
                              'src="' + button.imageSrcDisabled + '" ' +
                              'width="30" height="30" />' +
                              (button.label ? ('<div class="toolbar-button-label">'+ button.label+'</div>') :'')+
                              
                            '</div>';
  }//createBottomButtonHTML()
  
  // It creates the Node corresponding to the button passed as parameter
  // - button: The button object stored in buttons
  function createBottomButtonNode(button) {
    var template = document.createElement("div");
    template.innerHTML = createBottomButtonHTML(button);
    return template.childNodes[0];
  }//createBottomButtonNode(button)

  
  // It adds the Simpatico Toolbar inside the component of which id is passed 
// as parameter
// - containerID: the Id of the element which is going to contain the toolbar 
  function addSimpaticoBottomBar(containerID) {
    var simpaticoBarContainer = document.getElementById(containerID);
    if (simpaticoBarContainer == null) {
      var body = document.getElementsByTagName('body')[0];
      simpaticoBarContainer = document.createElement('div');
      body.insertBefore(simpaticoBarContainer, body.firstChild);
    }
  
    // Create the main div of the toolbar
    var simpaticoBarHtml = '<div id="simp-bottomBar">' +
                              '<div id="simp-bottomBar-container-left" onclick="toggleBottomBar();">' +
                                //'<a href="#">' +
                                  '<div class="barlabel">Assistente virtuale</div>' +
                                  '<div class="barstate" id="barstate">(disattiva)</div>'+
                                //'</a>' +
                              '</div>';
  
    simpaticoBarHtml += '<div id="simp-bottomBar-container-right" style="display:none"></div>';
    // Close the main div
    simpaticoBarHtml += '</div>';
    
    // Add the generated bar to the container
    simpaticoBarContainer.innerHTML = simpaticoBarHtml;
  }//addSimpaticoBottomBar()
  //expand Bottom Bar for showing others buttan
  function toggleBottomBar(){
      $("#simp-bottomBar-container-right").toggle('fast', function(){
        // For each button  create and add the node
        var buttonsContainer = document.getElementById("simp-bottomBar-container-right");
        for (var i = 0, len = buttons.length; i < len; i++) {
          if (document.getElementById(buttons[i].id) == null) {
            if(buttons[i].simpBar=="bottom"){
              buttonsContainer.appendChild(createBottomButtonNode(buttons[i]));
            }              
          }
        }
        openGuideDiagram();
        if ($("#simp-bottomBar-container-right").is(":hidden")) {
        	$('#barstate').text('(disattiva)');
        	$('#simp-bottomBar').addClass('inactive');
        } else {
        	$('#barstate').text('(attiva)');
        	$('#simp-bottomBar').removeClass('inactive');
        }
      });
  }
  //
  function openGuideDiagram(){
    var guideModalContainer = document.getElementById("guideModal");

    if (guideModalContainer == null) {
      var body = document.getElementsByTagName('body')[0];
      
      guideModalContainer = document.createElement('div');
      body.insertBefore(guideModalContainer, body.firstChild);

      var guideModalHTML='<div class="guide-modal" id="guideModal">'+
                            '<div class="modal-content">'+
                              '<div class="modal-header guide-modalHeader">'+
                                '<p class="modelheader-title">Dati richiesti</p>'+
                              '</div>'+
                              '<div class="modal-body" ><br>'+
                                '<div class="list-group" id="paragraphTitles"></div>'+
                              '</div>'+
                              '<div class="modal-footer">'+
                              '</div>'+
                            '</div>'+
                          '</div>'+
                          '<div class="help-modal" id="helpModal">'+
                            '<div class="modal-content">'+
                                '<div class="modal-header help-modalHeader">'+
                                  '<p class="modelheader-title">Un aiuto per te</p>'+
                                '</div>'+
                                '<div class="helpModal-body" >'+
                                '<div class="guide-noti" id="guideNotification">'+
                                '<button id="guideNotificationPrev"  onclick="waeUI.getInstance().back()" ></button>'+
                                '<button id="guideNotificationNext"  onclick="waeUI.getInstance().progress()" ></button>'+
                                '</div>'+
                                '<div id="errorMessages"></div>'+
                                  '<div id="helpModalPlaceholder">Seleziona un blocco oppure avvia la compilazione guidata</div>'+
                                  '<div id="helpModalContent" style="display:none">' + 
                                  '<div class="" id="">'+
                                    '<p class="modelContent-title">Cosa inserire</p>'+
                                    '<div class="modelContent-details" id="blockDetails"></div>'+
                                  '</div>'+
                                  '<div class="" id="">'+
                                    '<p class="modelContent-title">Domande comuni</p>'+
                                    '<div class="modelContent-details" id="blockQuestions"></div>'+
//                                    '<button type="button" class="btn-askQuestion" id="sendQuestions" onclick="waeUI.getInstance().createNewQuestion();" >Aggiungi una domanda</button>'+
                                  '</div>'+
                                  '</div>'+
                                '</div>'+
                            '</div>'+
                          '</div>';
      
      
        guideModalContainer.innerHTML=guideModalHTML;
        var idProfile = null; 
        waeUI.getInstance().enableWithGuide(idProfile);
    }
    $("#guideModal").toggle();
    $("#helpModal").toggle();
    if ($("#helpModal").is(":hidden")) {
    	waeUI.getInstance().disable();
    } else {
    	if (waeStarted) {
            setTimeout(function() {
            	toggleAction('workflow');        	
            }, 300);    		
    	}
    } 

  }
  
  
//Once the document is loaded the Simpatico features are initialised and the 
//toolbar added
document.addEventListener('simpaticoDestroy', function () {
	  var simpaticoBarContainer = document.getElementById('simp-bottomBar');;
	  simpaticoBarContainer.parentNode.removeChild(simpaticoBarContainer);

	  $("#guideModal").hide();
      $("#helpModal").hide();
	  
});

// Once the document is loaded the Simpatico features are initialised and the 
// toolbar added
document.addEventListener('simpaticoEvent', function () {
  initFeatures();
  addSimpaticoBottomBar("simpatico_bottom");
  authManager.getInstance().updateUserData();
  if (authManager.getInstance().isEnabled()) {
    updateForm(localStorage.logSessionStart);
  }
  
  var link = document.createElement( "link" );
  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/moduli.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  link = document.createElement( "link" );
  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/simpatico.css";
  link.type = "text/css";
  link.rel = "stylesheet";
//  document.getElementsByTagName( "head" )[0].appendChild( link );
//  link = document.createElement( "link" );
//  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/trento.css";
//  link.type = "text/css";
//  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  link = document.createElement( "link" );
  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/trento.V2.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  link = document.createElement( "link" );
  link.href = "https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  
  checkShowTutorial();
  setTimeout(toggleBottomBar, 1000);

});


dialog_tutorial = null;
dialog_step = 0;
function checkShowTutorial() {
	if (!localStorage.simpatico_tutorial_shown || localStorage.simpatico_tutorial_shown == 'null') {
		

		setTimeout(function(){
			dialog_tutorial = $(
					'<div id="dialog-tutorial">' +
					'	<div id="tutorial">'+
						 '<div class="tutorial-header">'+
					      		'<div style="display: inline-block;"><h1 style="margin: 0;">Assistente virtuale</h1></div>'+
			      		 '</div>'+
			      		 '<div id="tutorialcontent"></div>' +
			      		 '<div id="tutorial-buttons">' +
			      		 '  <a id="tutorialesc" href="#">ESCI</a>' +
			      		 '  <a id="tutorialnext"  href="#">AVANTI</a>'+
			      		 '</div>' +
			      	   '</div>' +
					'</div>'
					).dialog({
						autoOpen: false,
						classes: {
							"ui-dialog": "tutorial-dialog"
						},
						modal: true,
						closeOnEscape: false,
						height: "auto",
						width: 500
			});
			dialog_tutorial.dialog('open');
			$('#tutorialesc').click(closeTutorial);
			$('#tutorialnext').click(nextTutorial);
			$('#tutorialcontent').html(tutorialContent(0));
		}, 500);
		localStorage.simpatico_tutorial_shown = true;
	}
}

function closeTutorial() {
	dialog_step = 0;
	dialog_tutorial.dialog('destroy');
}
function nextTutorial() {
	dialog_step++;
	$('#tutorialcontent').html(tutorialContent(dialog_step));
	if (dialog_step == 1) {
		$('#tutorialnext').hide();
	}
}

function tutorialContent(step) {
	switch(step) {
	case 0: return '<p><b>L’Assistente virtuale</b> ti aiuta nella compilazione dei moduli online guidandoti passo passo. <br/><br/>Puoi attivarla/disattivarla semplicemente cliccando sul pulsante "Assistente virtuale" in basso a destra.</p></p>';
	case 1: return '<p><b>Al centro</b> il modulo viene suddiviso in blocchi (in base ai dati richiesti) evidenziando quello su cui concentrarti</p>'+
					'<p><b>A sinistra</b> trovi l’elenco dei dati richiesti (blocchi) evidenziando quello attuale</p>'+
					'<p><b>A destra</b> trovi un aiuto per capire cosa inserire in quel blocco e le risposte alle domande più comuni</p>'+
					'<br><p>Una volta inserito i dati nel blocco puoi proseguire la compilazione premendo il pulsante “Successivo”</p>'+
					'<br><p>Se ti sei dimenticato qualcosa di importante ti verrà segnalato in rosso.</p>';
	}
}
	
function updateForm(sessionId) {
	if (!$('#Parametri_SIMPATICOSessionID').length) {
		$('form').append('<input type="hidden" name="Parametri_SIMPATICOSessionID" id="Parametri_SIMPATICOSessionID" value="'+sessionId+'" />');
	} else {
		$('#Parametri_SIMPATICOSessionID').val(sessionId);
	}
	
}
