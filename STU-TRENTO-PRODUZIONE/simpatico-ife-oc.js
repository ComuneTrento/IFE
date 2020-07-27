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
  //  authManager.getInstance().init({
  //    endpoint: 'https://tn.smartcommunitylab.it/aac',
  //    clientID: '8ab03990-d5dd-47ea-8fc6-c92a3b0c04a4',
  //    authority: null,
  //    redirect: 'https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/logincb.html',
  //    greeting: 'ACCEDI A SIMPATICO'
  //  });

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
    cpdDiagramEndpoint: 'https://simpatico.smartcommunitylab.it/cpd/api/diagram/eService',
    primaryColor: "#24BCDA",
    secondaryColor:"#D3F2F8",
    elementsToEnhanceClassName: "simpatico-query-and-answer",
    questionsBoxClassName: "simp-ctz-ui-qb",
    questionsBoxTitle: "Domande legate",
    addQuestionLabel: "+ Aggiungi una domanda",
    diagramNotificationImage: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png",
    diagramNotificationClassName: "simp-ctz-ui-diagram",
    diagramNotificationText: "C'e' una visualizzazione di e-service in Citizenpedia",
    questionSelectionFilters: ['h1', '.Rigaintestazione', '.Rigaintestazioneridotta'],
    questionsURL: "https://simpatico.smartcommunitylab.it/qae/questions"
  });


  taeUIInline.getInstance().init({
    endpoint: 'https://simpatico.smartcommunitylab.it/simp-engines/tae',
    textContainerQuery: "block-stu3-italia-content",
    textQueryString: "div,p,li",
    elementId: 'simp-bar-sw-tae-inline',
    synonimLabel:'Sinonimi',
    definitionLabel: 'Definizioni e sinonimi',
    simplifedTextLabel: 'Semplificazione testo',
    definitionHint: 'Mostra definizione e sinonimi di alcune parole',
    simplifiedTextHint:'Mostra una versione semplice del testo selezionato',
    questionsURL: "https://simpatico.smartcommunitylab.it/qae/questions",
    resourceURL: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources",
  });



  // Declare here the buttons that will be available in the Simpatico Bar
  // The first one is the login button. This is mandatory but it also can be personalised
  // Options available:
  buttons = [
    {	// TAE
      id: "simp-bar-sw-tae-inline",
      // Ad-hoc images to define the enabled/disabled images
      imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/textTool.png",
      imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/textTool.png",
      alt: "Semplificazione del testo selezionato",
      // Ad-hoc css classes to define the enabled/disabled styles
      styleClassEnabled: "simp-none",
      styleClassEnabled: "simp-none",
      label: 'Semplificazione testo',
      isEnabled: function() {return taeUIInline.getInstance().isEnabled(); },
      enable: function() {
        taeUIInline.getInstance().showDialog();
      },
      disable: function() {
        taeUIInline.getInstance().hideDialog();
      },
      exclusive: true
    },
    { //DIAGRAM
      id: "simp-bar-sw-cpd",
      // Ad-hoc images to define the enabled/disabled images
      imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/procedure.png",
      imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/procedure.png",
      alt: "Procedura",
      // Ad-hoc css classes to define the enabled/disabled styles
      styleClassEnabled: "simp-none",
      styleClassDisabled: "simp-none",

      isEnabled: function() { return citizenpediaUI.getInstance().isEnabled(); },
      enable: function() { citizenpediaUI.getInstance().openDiagram(); },
      disable: function() { citizenpediaUI.getInstance().disable(); }
    },
    { // CITIZENPEDIA
      id: "simp-bar-sw-citizenpedia",
      // Ad-hoc images to define the enabled/disabled images
      imageSrcEnabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/questions.png",
      imageSrcDisabled: "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/questions.png",
      alt: "Accedi alle domande e risposte associate agli elementi del modulo",
      // Ad-hoc css classes to define the enabled/disabled styles
      styleClassEnabled: "simp-none",
      styleClassDisabled: "simp-none",
      label: 'Domande e risposte',
      isEnabled: function() { return citizenpediaUI.getInstance().isEnabled(); },
      enable: function () { openQuestionDiagram(simpaticoEservice + ".descr"); },
      disable: function() { citizenpediaUI.getInstance().disable(); }
    },

  ];
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
    '/>' +
    //(button.label ? ('<div class="toolbar-button-label">'+ button.label+'</div>') :'')+
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
  // TODO Update the login button status

  // For each button (without the login one) create and add the node
  var buttonsContainer = document.getElementById("simp-bar-container-left");
  for (var i = 0, len = buttons.length; i < len; i++) {
    if (document.getElementById(buttons[i].id) == null) {
      buttonsContainer.appendChild(createButtonNode(buttons[i]));
    }
  }
}//enablePrivateFeatures(id)

// It inits all the configured buttons
// Called one time
function disablePrivateFeatures() {
  // TODO Update the login status
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
    '<div onclick="clickShowTutorial();">' +
    //'<a href="#">' +
    '<img class="logoSmall" src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/logo.png" ' +
    'alt="Simpatico ">Simpatico' +
    //'</a>' +
    '</div>';

  // Add the left side of the toolbar
  simpaticoBarHtml += '<ul id="simp-bar-container-left"></ul>';
  // Add the right side of the toolbar
  simpaticoBarHtml += '<ul id="simp-bar-container-right">' +
    '<li  style="display:none"><span id="simp-usr-data"></span></li>' +
    //   createButtonNode(buttons[0]).outerHTML +
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
  for (var i = 0, len = buttons.length; i < len; i++) {
    if(buttons[i].id == id) {
      clickedButton = buttons[i];
    }
  }


  // Enable/Disable the selected button
  if (clickedButton.isEnabled()) {
    clickedButton.disable();
  } else {
    clickedButton.enable();
  }
  //  updateButtonStyle(clickedButton);
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

//send question to server for create new question
function sendQuestion(){
  $('#questionModal').modal('hide');
  // window.open(taeUIInline.getInstance().questionsURL+"/create?text="+$("#inputQuestion").val()+"&tags=Infanzia,"+simpaticoEservice,"_blank");
  window.open(taeUIInline.getInstance().questionsURL + "/create?tags=" + simpaticoEservice + ".descr", "_blank");
}
// Once the document is loaded the Simpatico features are initialised and the
// toolbar added
document.addEventListener('DOMContentLoaded', function () {
  initFeatures();
  addSimpaticoBar("simpatico_top");
  enablePrivateFeatures();
  //  authManager.getInstance().updateUserData();
  $("#simp-bar-sw-login").mouseover(function(){
    if (!localStorage.userData || localStorage.userData == 'null') {
      $("#simp-bar-sw-login img").prop("alt", "Entra");
      $("#simp-bar-sw-login img").prop("title", "Entra");
      // console.log("Login please");
    }else{
      var data=JSON.parse(localStorage.userData);
      $("#simp-bar-sw-login img").prop("alt", "ESCI");
      $("#simp-bar-sw-login img").prop("title", "ESCI");
    }
  });
  //simpaticoEservice is a global variable that initialized in install time
  qaeCORE.getInstance().getAllQuestions(simpaticoEservice + ".descr", function (response) {
    $("#simp-bar-container-left").append("<li id='simp-question-num-li'><span id='simp-question-num'>"+response.length+"</span></li>");
  });

  var link = document.createElement( "link" );
  link.href = "https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/css/simpatico-new-trento.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName( "head" )[0].appendChild( link );
  // link = document.createElement( "link" );
  // link.href = "../css/simpatico.css";
  // link.type = "text/css";
  // link.rel = "stylesheet";
  // document.getElementsByTagName( "head" )[0].appendChild( link );
  // link = document.createElement( "link" );
  // link.href = "css/trento.css";
  // link.type = "text/css";
  // link.rel = "stylesheet";
  // document.getElementsByTagName( "head" )[0].appendChild( link );
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
        '	<div id="tutorial">'+
        '<div class="tutorial-header">'+
        '<img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/logo.png" ' +
        'style="vertical-align: bottom;" height="50px" alt="Simpatico">'+
        '<div style="display: inline-block;"><h1 style="margin: 0;">Simpatico</h1><span style="float:right;">TUTORIAL</span></div>'+
        '</div>'+
        '<div id="tutorialcontent"></div>' +
        '<div id="tutorial-buttons">' +
        '  <a id="learnMore" class="followTextTutorial" href="#">Per saperne di più</a>' +
        '  <a id="tutorialesc" class="followTextTutorial" href="#">ESCI</a>' +
        '  <a id="tutorialPrevious" class="followTextTutorial" href="#">PRECEDENTE</a>'+
        '  <a id="tutorialnext" class="followTextTutorial" href="#">AVANTI</a>'+
        '</div>' +
        '</div>' +
        '</div>'
      ).dialog({
        autoOpen: false,
        classes: {
          "ui-dialog": "tutorial-dialog"
        },
        modal: true,
        close:function(){
          dialog_step = 0;
          $(this).dialog("destroy");
        },
        closeOnEscape: false,
        //position: {my: "top center",at: "top center",of: "body"},
        height: "auto",
        width: '35%',
      });
      dialog_tutorial.dialog('open');
      $('#tutorialesc').hide();
      $('#tutorialPrevious').hide();
      $('#tutorialnext').hide();
      $('#tutorialesc').click(closeTutorial);
      $('#learnMore').click(nextTutorial);
      $('#tutorialPrevious').click(previousTutorial);
      $('#tutorialnext').click(nextTutorial);
      $('#tutorialcontent').html(tutorialContent(0));
    }, 500);
    localStorage.simpatico_tutorial_shown = true;
  }
}
function clickShowTutorial() {
  dialog_tutorial = null;
  dialog_step = 0;
  localStorage.simpatico_tutorial_shown = 'null';
  // setTimeout(function(){
  checkShowTutorial();
  // }, 200);

}
function closeTutorial() {
  dialog_step = 0;
  dialog_tutorial.dialog('destroy');
}
function previousTutorial(){
  // $('#learnMore').hide();
  // $('#tutorialnext').show();
  dialog_step--;
  if (dialog_step == 0) {
    $('#tutorialPrevious').hide();
    $('#tutorialnext').hide();
    $('#learnMore').show();
  }else if(dialog_step == 3){
    $('#tutorialPrevious').hide();
    $('#tutorialnext').hide();
    $('#tutorialesc').show();
  }
  $('#tutorialcontent').html(tutorialContent(dialog_step));
}
function nextTutorial() {
  $('#learnMore').hide();
  $('#tutorialnext').show();
  dialog_step++;
  $('#tutorialcontent').html(tutorialContent(dialog_step));
  if (dialog_step == 1) {
    $('#tutorialPrevious').show();
  }
  if (dialog_step == 3) {
    $('#tutorialPrevious').hide();
    $('#tutorialnext').hide();
    $('#tutorialesc').show();
  }
}
function tutorialContent(step) {
  switch(step) {
    case 0: return '<p>Questo strumento migliora la tua esperienza con la Pubblica Amministrazione. Alcune funzionalità  richiedono un account.</p>';
    case 1: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/textTool.png"></td><td width="100%">Semplifica i testi in caso di paragrafi troppo complessi e ottieni in automatico definizioni e sinonimi delle principali parole presenti nella pagina.</td></tr></table>';
    case 2: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/procedure.png"></td><td width="100%">Scopri come come avviene l\'interazione tra te e la Pubblica Amministazione nell\'utilizzo di questo servizio.</td></tr></table>';
    //	case 3: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/access.png"></td><td width="100%">Memorizza i tuoi dati personali per compilare automaticamente moduli e ricevere suggerimenti personalizzati.</td></tr></table>';
    case 3: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/demo/resources/images/questions.png"></td><td width="100%">Leggi le domande presentate su questo servizio e scopri le eventuali risposte fornite da utenti come te o dal personale del Comune.<br>Solo se vorrai porre anche tu una domanda ti servirà  registrarti.</td></tr></table>';
    // case 5: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/diagram.png"></td><td width="100%"></td></tr></table>';
    // case 6: return '<table><tr><td><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/feedback.png"></td><td width="100%">La funzione FEEDBACK ti consente di esprimere in ogni momento una valutazione rispetto alle funzionalità  di SIMPATICO.</td></tr></table>';
  }
}


function openQuestionDiagram(ref){
  var questionsURL = "https://simpatico.smartcommunitylab.it/qae/questions";
  var questionModalContainer = document.getElementById("questionModal");
  if (questionModalContainer == null) {
    var body = document.getElementsByTagName('body')[0];
    questionModalContainer = document.createElement('div');
    body.insertBefore(questionModalContainer, body.firstChild);
    //simpaticoEservice is a global variable that initialized in install time
    qaeCORE.getInstance().getAllQuestions(ref,function(response){
      var listItem="";
      $.each(response, function (index, value){
        var ansLength=value.answers.length;
        //    	  listItem+="<a class='list-group-item' data-toggle='collapse' href='#"+value._id+"' aria-expanded='false' aria-controls='"+value._id+"'>"+value.title+"<span class='ansNum'>"+ansLength+"</span></a>";
        listItem+="<h3 class='list-group-item'>"+value.title+"<span class='ansNum'>"+ansLength+"</span></h3>";
        listItem+="<div id='"+value._id+"' class='question-wrapper'>";
        listItem+='<div class="question-detail"><a href="'+questionsURL+'/show/'+value._id+'" target="_blank">'+value.content+'</a></div>';

        if (ansLength > 10) {
          value.answers = value.answers.slice(0, 10);
        }
        var ansListItem = "";
        $.each(value.answers,function(index2, value2){
          ansListItem+="<div class='answer-item'>"+value2.content+"</div>";
        });
        listItem += "<div class='answer-group'>"+ansListItem+"</div></div>";
      });
      if (!listItem) {
        listItem = "Non sono ancora presenti domande associate a questa pagina.";
      }
      var questionModalHTML='<div class="modal fade bottom" id="questionModal" role="dialog">'+
        '<div class="modal-dialog">'+
        '<div class="modal-content">'+
        '<div class="modal-header question-modalHeader">'+
        '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
        '<h3 class="modal-title">Domande legate</h3>'+
        '</div>'+
        '<div class="modal-body questionModalBody">'+
        // '<input class="form-control input-sm" id="inputQuestion" type="text" placeholder="Type your question here">'+
        '<div class="list-group" id="accordion">'+
        listItem +
        '</div>'+
        '</div>'+
        '<div class="modal-footer">'+
        // '<button type="button" class="btn btn-default" data-dismiss="modal">CANCEL</button>'+
        '<button type="button" class="btn btn-default btn-send" id="sendQuestions" onclick="sendQuestion();" >+ Aggiungi una domanda</button>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';


      questionModalContainer.innerHTML=questionModalHTML;
      $("#questionModal").modal();
      $('#accordion').accordion({
        heightStyle: "content", active: false, collapsible: true
      });
    });
  }else{
    $("#questionModal").modal();
  }

}
