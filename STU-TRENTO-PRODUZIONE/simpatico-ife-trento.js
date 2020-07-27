// Simpatico main Interactive Front-End (simpatico-ife.js)
//-----------------------------------------------------------------------------
// This JavaScript is the main entry point to  the Interactive Front-End
// component of the Simpatico Project (http://www.simpatico-project.eu/)
//
//-----------------------------------------------------------------------------

function isProd() {
  return window.location.origin.indexOf('sportello.comune.trento.it') >= 0;
}
function isTestProd() {
  return window.location.origin.indexOf('sportellotest.comune.trento.it') >= 0;
}

function logEnabled() {
  return isProd() || isTestProd();
}
function sfEnabled() {
  return !isProd() && !isTestProd();
}

// It inits all the enabled features of IFE
function initFeatures() {
  if (!window.simpaticoEserviceName) {
    simpaticoEserviceName = '';
  }
  if (!window.simpaticoEserviceURL) {
    simpaticoEserviceURL = window.location.origin + window.location.pathname;
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

  // Init the LOG component (see log-core.js)
  // - endpoint: the main URL of the used LOG instance
  // - testMode: true if the data should not be sent to the LOG component
  logCORE.getInstance().init({
    testMode: !logEnabled(),
    endpoint: "https://simpatico.smartcommunitylab.it/simpatico-logs/api"
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

  // Init the CDV component (see cdv-ui.js)
  // - endpoint: the main URL of the used cdv instance
  // - serviceID: the id corresponding to the e-service
  // - serviceName: name corresponding to the e-service
  // - serviceURL: the URL of the e-service page
  // - dataFields: eservice field ids mapped with cdv
  // - cdvColor: Color used to highlight the eservice fields enhanced with cdv
  // - dialogTitle: Title of the dialog box of CDV component
  // - tabPFieldsTitle: tab label of personal data
  cdvUI.getInstance().init({
      endpoint: 'https://cdv.comune.trento.it/CDV',
      serviceID: simpaticoEservice,
    serviceName: simpaticoEserviceName,
      serviceURL: window.location.href,
      dataFields: simpaticoMapping,
      informedConsentLink: "https://cdv.comune.trento.it/CDV/IFE/informed_consent.html",
      consentGiven:true,
      cdvColor: '#008000',
      dialogTitle: 'Gestione dati personali',
      tabPFieldsTitle: 'I miei dati',
      entryMessage: 'Gestione dati personali',
      statusMessage: 'Adesso puoi selezionare i tuoi dati per compilare i campi evidenziati con bordo verde. Usa i valori ' +
      'salvati predecentemente oppure aggiungi i valori nuovi.',
      notextMessage: 'Nessun campo selezionato',
      dialogSaveTitle: 'I dati salvati!',
      dialogSaveMessage: 'I tuoi dati sono stati salvati con successo al tuo Data Vault.',
      statusMessageNoAccount: "Nessun account di gestione dati personali e' associato a te. Crearne uno?",
      statusMessageNoActive: "CDV non e' abilitato per questo servizio. Abilitare?",
      confirmSaveDataMessage: "Vuoi aggiornare i tuoi dati personali?",
      tabSettingsTitle: 'Impostazioni',
      buttonSaveData: 'Salva i tuoi dati',
      buttonManageData:"Gestisci i tuoi dati",
      buttonActivate:"Attiva",
      buttonCreate: "Crea",
      consentButton: "Consenti",
      tabSettingsTitle: 'Configura',
    cdvDashUrl:'https://cdv.comune.trento.it/CDV/cdv-dashboard/index.html'
  });

  // Init the Text Adaptation Engine component (see tae-ui.js)
  // - endpoint: the main URL of the used TAE instance
  // - language: the language of the text to adapt by the TAE instance
  // - primaryColor: Color used to highlight the enhanced components
  // - secondaryColor: Color used to paint the simplification boxes backgrounds
  // - elementsToEnhanceClassName: The CSS class used to define the enhanced elements
  // - simplifyBoxClassName: The CSS class of the box which shows the simplifications
  // - simplifyBoxTitle: Title of the box which shows the simplifications
  // - wordPropertiesClassName: The CSS class of the word properties box
  // - synonimLabel: Label for synonyms
  // - definitionLabel: label for definitions
  // - emptyText: label for empty text
  taeUI.getInstance().init({
    endpoint: 'https://simpatico.smartcommunitylab.it/simp-engines/tae',
    language: 'it',
    primaryColor: "#DE453E",
    secondaryColor:"#F0ABA8",
    elementsToEnhanceClassName: "simpatico-text-paragraph",
    simplifyBoxClassName: "simp-tae-ui-sb",
    simplifyBoxTitle: "Testo semplificato",
    wordPropertiesClassName: "simp-tae-ui-word",
    synonymLabel:'Synonyms',
    definitionLabel: 'Definitions',
    emptyText: 'No simplifications found for this text'

  });

  // Init the Text Adaptation Engine component for free text selection (see tae-ui-popup.js)
  // - lang: the language of the text to adapt by the TAE instance
  // - endpoint: the main URL of the used TAE instance
  // - dialogTitle: popup title
  // - tabDefinitionsTitle: title of 'definitions' tab
  // - tabSimplificationTitle: title of 'simplifications' tab
  // - tabWikipediaTitle: title of 'wikipedia' tab
  // - entryMessage: label of 'enter text' hint
  // - notextMessage: label of 'no text selected' hint
  taeUIPopup.getInstance().init({
    lang: 'it',
    endpoint: 'https://simpatico.smartcommunitylab.it/simp-engines/tae',
    dialogTitle: 'Arricchimento testo',
    tabDefinitionsTitle: 'Vocabolario',
    tabSyntSimpTitle: 'Testo semplificato',
    tabSimplificationTitle: 'Aiuto comprensione',
    tabWikipediaTitle: 'Wikipedia',
    entryMessage: 'Scegli il tipo di aiuto',
    notextMessage: 'Selezione una parola o una frase per procedere con la semplificazione'
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
    topBarHeight: 60,
    errorLabel: ERROR_LABELS
  });

  // Init the Session Feedback component (see sf-ui.js)
  // - buttonToShowSfId: the id of the button/link that opens the dialog of the feedback form
  // - apiEndpoint: the main URL of the logs API server (<site>/simpatico/api)
  // NOTE: Requires jquery-ui to work properly

  if (sfEnabled()) {
    sfUI.getInstance().init({
        language: 'it',
      buttonToShowSfId: 'SF',
        apiEndpoint: 'https://simpatico.smartcommunitylab.it/simpatico-logs/api',
        // TEMPORALY DISABLED
        formSelector: '#modulo',
        listener: function() {
          $('#modulo').submit();
        },
      });
  }

  // Init the Data Analysis component (see da-ui.js)
  // It is useful for UI elements like different tabs in the same view or an accordion.
  // - elementsToTrackTimeClassName: The CSS class used to define the different tabs
  // - apiEndpoint: the main URL of the logs API server (<site>/simpatico/api)
//  daUI.getInstance().init({
//    elementsToTrackTimeClassName: '',
//    apiEndpoint: 'https://simpatico.smartcommunitylab.it/simpatico-logs/api'
//  });

  // Declare here the buttons that will be available in the Simpatico Bar
  // The first one is the login button. This is mandatory but it also can be personalised
  // Options available:
  buttons = [{
                  id: "simp-bar-sw-login",
                  // Ad-hoc images to define the enabled/disabled images
                  imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/ic_on.png",
                  imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/login.png",
                  alt: "Entra",
                  // Ad-hoc css classes to define the enabled/disabled styles
                  styleClassEnabled: "simp-none",
                  styleClassDisabled: "simp-none",

                  isEnabled: function() { return authManager.getInstance().isEnabled(); },
                  enable: function() { authManager.getInstance().enable(); },
                  disable: function() { authManager.getInstance().disable(); }
                },

                { // WAE. Switch to the modality, where the form adaptation starts
                    id: 'workflow',
                    imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/forms.png",
                    imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/forms.png",
                    alt: "Compilazione guidata del modulo",
                    // Ad-hoc css classes to define the enabled/disabled styles
                    styleClassEnabled: "simp-bar-btn-active",
                    styleClassDisabled: "simp-bar-btn-inactive",
                    label: 'Compilazione guidata',
                    isEnabled: function() { return waeUI.getInstance().isEnabled(); },
                    enable: function() { var idProfile = null; waeUI.getInstance().enable(idProfile); },
                    disable: function() { waeUI.getInstance().disable(); }
                  },
                { // CITIZENPEDIA
                  id: "simp-bar-sw-citizenpedia",
                  // Ad-hoc images to define the enabled/disabled images
                  imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/citizenpedia.png",
                  imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/citizenpedia.png",
                  alt: "Accedi alle domande e risposte associate agli elementi del modulo",
                  // Ad-hoc css classes to define the enabled/disabled styles
                  styleClassEnabled: "simp-bar-btn-active",
                  styleClassDisabled: "simp-bar-btn-inactive",
                  label: 'Domande e risposte',
                  isEnabled: function() { return citizenpediaUI.getInstance().isEnabled(); },
                  enable: function() { citizenpediaUI.getInstance().enable(); },
                  disable: function() { citizenpediaUI.getInstance().disable(); }
                },
                { // TAE
                    id: "simp-bar-sw-tae-popup",
                    // Ad-hoc images to define the enabled/disabled images
                    imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/enrich.png",
                    imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/enrich.png",
                    alt: "Semplificazione del testo selezionato",
                    // Ad-hoc css classes to define the enabled/disabled styles
                    styleClassEnabled: "simp-bar-btn-active",
                    styleClassDisabled: "simp-bar-btn-inactive",
                    label: 'Semplificazione testo',
                    isEnabled: function() { return false; },
                    enable: function() {
                      console.log(window.getSelection().toString().trim());
                      taeUIPopup.getInstance().showDialog();
                    },
                    disable: function() {
                      taeUIPopup.getInstance().hideDialog();
                    },
                    exclusive: true
                  },
                    { // CPD: procedure model
                        id: 'process',
                        imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png",
                        imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png",
                        alt: "Procedura amministrativa",
                        // Ad-hoc css classes to define the enabled/disabled styles
                        styleClassEnabled: "simp-bar-btn-active",
                        styleClassDisabled: "simp-bar-btn-inactive",
                        label: 'Procedura',
                        isEnabled: function() { return false; },
                        enable: function() { citizenpediaUI.getInstance().openDiagram(); },
                        disable: function() {  }
                      },

//                  { // SF: session feedback
//                      id: 'sf',
//                      imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/feedback.png",
//                      imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/feedback.png",
//                      alt: "La tua opinione",
//                      // Ad-hoc css classes to define the enabled/disabled styles
//                      styleClassEnabled: "simp-bar-btn-active",
//                      styleClassDisabled: "simp-bar-btn-inactive",
//                      label: 'Feedback',
//                      isEnabled: function() { return false; },
//                      enable: function() { sfUI.getInstance().showSF(); },
//                      disable: function() { sfUI.getInstance().hideSF(); },
//                      exclusive: true
//                    }

            ];
//  if (!isProd()) {
    buttons.splice(buttons.length - 1, 0, { // CDV
        id: "simp-bar-sw-cdv",
          // Ad-hoc images to define the enabled/disabled images
          imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/cdv.png",
          imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/cdv.png",
          alt: "Salva e precompila i campi usando i tuoi dati personali attraverso Citizen Data Vault",
          // Ad-hoc css classes to define the enabled/disabled styles
          styleClassEnabled: "simp-bar-btn-active",
          styleClassDisabled: "simp-bar-btn-inactive",
          label: 'Dati personali',
          isEnabled: function() { return cdvUI.getInstance().isEnabled(); },
          enable: function() { cdvUI.getInstance().enable(); },
          disable: function() { cdvUI.getInstance().disable(); },
//          exclusive: true
        });
//  }

}//initFeatures()

// It creates the HTML code corresponding to the button passed as parameter
// - button: The button object stored in buttons
function createButtonHTML(button) {
  return '<li class="'+ button.styleClassDisabled +'" id="' + button.id + '" ' +'onclick="toggleAction(\'' + button.id + '\');"'+
                          '">'+
                          //'<a href="#">' +
                          '<img ' +
                            'alt="' + button.alt + '" ' +
                            'title="' + button.alt + '" ' +
                            'id="' + button.id + '-img" ' +
                            'src="' + button.imageSrcDisabled + '" ' +
                            'width="50" height="50" />' +
                            (button.label ? ('<div class="toolbar-button-label">'+ button.label+'</div>') :'')+
                            //'</a>'+
                          '</li>';
}//createButtonHTMLbutton()

// It creates the Node corresponding to the button passed as parameter
// - button: The button object stored in buttons
function createButtonNode(button) {
  var template = document.createElement("div");
  template.innerHTML = createButtonHTML(button);
  return template.childNodes[0];
}//createButtonNode(button)

// It creates the configured buttons and adds them to the toolbar
// Called one time
function enablePrivateFeatures() {
  setTimeout(function(){
    updateForm(localStorage.logSessionStart);
  }, 5000);

  // Update the login button status
  var loginButton = document.getElementById(buttons[0].id);
  loginButton.childNodes[0].src = buttons[0].imageSrcEnabled;

  // For each button (without the login one) create and add the node
  var buttonsContainer = document.getElementById("simp-bar-container-left");
  for (var i = 1, len = buttons.length; i < len; i++) {
  if (document.getElementById(buttons[i].id) == null) {
    buttonsContainer.appendChild(createButtonNode(buttons[i]), loginButton);
  }
  }
}//enablePrivateFeatures(id)

// It inits all the configured buttons
// Called one time
function disablePrivateFeatures() {
  // Update the login button status
  var loginButton = document.getElementById(buttons[0].id);
  loginButton.childNodes[0].src = buttons[0].imageSrcDisabled;

  // For each button (without the login one) remove the node
  for (var i = 1, len = buttons.length; i < len; i++) {
    currentButton = document.getElementById(buttons[i].id);
    if (null != currentButton) {
      buttons[i].disable();
      currentButton.parentNode.removeChild(currentButton);
    }
  }
}//disablePrivateFeatures()

// It adds the Simpatico Toolbar inside the component of which id is passed
// as parameter
// - containerID: the Id of the element which is going to contain the toolbar
function addSimpaticoBar(containerID) {
  var simpaticoBarContainer = document.getElementById(containerID);
  if (simpaticoBarContainer == null) {
    var body = document.getElementsByTagName('body')[0];
    simpaticoBarContainer = document.createElement('div');
    body.insertBefore(simpaticoBarContainer, body.firstChild);
  }

  // Create the main div of the toolbar
  var simpaticoBarHtml = '<div id="simp-bar">' +
                            '<div>' +
                              '<a href="#">' +
                                '<img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/logo.png" ' +
                                'height="50px" ' +
                                'alt="Simpatico ">' +
                              '</a>' +
                            '</div>';

  // Add the left side of the toolbar
  simpaticoBarHtml += '<ul id="simp-bar-container-left"></ul>';

  // Add the right side of the toolbar
  simpaticoBarHtml += '<ul id="simp-bar-container-right">' +
                         '<li><span id="simp-usr-data"></span></li>' +
                          createButtonNode(buttons[0]).outerHTML +
                      '</ul>';

  // Close the main div
  simpaticoBarHtml += '</div>';

  // Add the generated bar to the container
  simpaticoBarContainer.innerHTML = simpaticoBarHtml;
}//addSimpaticoBar()

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

// Once the document is loaded the Simpatico features are initialised and the
// toolbar added
document.addEventListener('simpaticoEvent', function () {
  initFeatures();
  addSimpaticoBar("simpatico_top");
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
  document.getElementsByTagName( "head" )[0].appendChild( link );
  link = document.createElement( "link" );
  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/trento.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  link = document.createElement( "link" );
  link.href = "https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );

  checkShowTutorial();
});

window.addEventListener('beforeunload', function (e) {
  logCORE.getInstance().setSyncMode();
  logCORE.getInstance().ifeLogger.sessionEnd(simpaticoEservice);
  if (window.simpaticoForm) {
      // log end of session
    logCORE.getInstance().ifeLogger.formEnd(simpaticoEservice, simpaticoForm);
  }
});

dialog_tutorial = null;
dialog_step = 0;
function checkShowTutorial() {
  if (!localStorage.simpatico_tutorial_shown || localStorage.simpatico_tutorial_shown == 'null') {


    setTimeout(function(){
      dialog_tutorial = $(
          '<div id="dialog-tutorial">' +
          ' <div id="tutorial">'+
             '<div class="tutorial-header">'+
                 '<img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/logo.png" ' +
                    'style="vertical-align: bottom;" height="50px" alt="Simpatico">'+
                    '<div style="display: inline-block;"><h1 style="margin: 0;">Simpatico</h1><span style="float:right;">TUTORIAL</span></div>'+
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
  // in prod skip CDV for the moment
  if (isProd() && dialog_step == 4) {
    nextTutorial();
    return;
  }
  $('#tutorialcontent').html(tutorialContent(dialog_step));
  if (dialog_step == 5) {
    $('#tutorialnext').hide();
  }
}

function tutorialContent(step) {
  switch(step) {
  case 0: return '<p>Il servizio SIMPATICO mette a disposizione strumenti per semplificare la compilazione dei moduli online.</p><br/><p>Per accedere alle funzionalitÃ  effettua l\'accesso in alto a destra.</p>';
  case 1: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/forms.png"></td><td width="100%">La funzionalitÃ  COMPILAZIONE GUIDATA ti accompagna passo-passo nella compilazione del modulo online.</td></tr></table>';
  case 2: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/citizenpedia.png"></td><td width="100%">La funzionalitÃ  DOMANDE E RISPOSTE ti permette di leggere e/o inserire domande legate a specifiche sezioni del servizio.</td></tr></table>';
  case 3: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/enrich.png"></td><td width="100%">La funzionalitÃ  SEMPLIFICAZIONE TESTO mette a disposizione strumenti per meglio comprendere le frasi nel modulo. Per attivarla devi selezionare il testo da semplificare e cliccare sull\'icona.</td></tr></table>';
  case 4: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/cdv.png"></td><td width="100%">La funzionalitÃ  DATI PERSONALI ti consente di salvare e recuperare in altri moduli le informazioni che hai inserito (es. nucleo familiare).</td></tr></table>';
  case 5: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png"></td><td width="100%">La funzionalitÃ  PROCEDURA ti permette di avere uno sguardo di insieme dei passi previsti per lâ€™attivazione e lâ€™utilizzo del servizio.</td></tr></table>';
//  case 6: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/feedback.png"></td><td width="100%">La funzione FEEDBACK ti consente di esprimere in ogni momento una valutazione rispetto alle funzionalitÃ  di SIMPATICO.</td></tr></table>';
  }
}

function updateForm(sessionId) {
  if (!$('#Parametri_SIMPATICOSessionID').length) {
    $('form').append('<input type="hidden" name="Parametri_SIMPATICOSessionID" id="Parametri_SIMPATICOSessionID" value="'+sessionId+'" />');
  } else {
    $('#Parametri_SIMPATICOSessionID').val(sessionId);
  }

}
