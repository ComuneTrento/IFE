// Citizenpedia User Interface (ctz-ui.js)
//-----------------------------------------------------------------------------
// This JavaScript contains the functionality related to the User Interface
// which enriches the Interactive Front-End component with the features of 
// the Citizenpedia component.
// - It uses the methods implemented in ctz-core.js
// - The Citizenpedia server side code is available in:
//              https://github.com/SIMPATICOProject/Citizenpedia
//-----------------------------------------------------------------------------

var citizenpediaUI = (function () {
  var instance; // Singleton Instance of the UI component
  var featureEnabled = false;
  function Singleton () {
    // Component-related variables
    var primaryColor = '';
    var secondaryColor = '';
    var elementsToEnhanceClassName = '';
    var questionsBoxTitle = '';
    var questionsBoxTitleClassName = '';
    var questionsBoxClassName = '';
    var addQuestionLabel = '';
    var diagramNotificationImage = '';
    var diagramNotificationClassName = '';
    var diagramNotificationText = '';
    var diagramURL = '';
    var questionsURL = '';

    // Internal usage variables
    var paragraphs = []; // Used to store all the tagged paragraphs
    var originalStyles = []; // Used to store the tagged paragraphs CSSstyles
    var diagramContainer; // Used to show the CPD diagram
    var questionSelectionFilters = [];

    // Component-related methods and behaviour
    function initComponent(parameters) {
      primaryColor = parameters.primaryColor;
      secondaryColor = parameters.secondaryColor;
      elementsToEnhanceClassName = parameters.elementsToEnhanceClassName;
      questionsBoxTitle = parameters.questionsBoxTitle;
      questionsBoxClassName = parameters.questionsBoxClassName;
      addQuestionLabel = parameters.addQuestionLabel;
      diagramNotificationImage = parameters.diagramNotificationImage;
      diagramNotificationClassName = parameters.diagramNotificationClassName;
      diagramNotificationText = parameters.diagramNotificationText;
      qaeCORE.getInstance().init({
          endpoint: parameters.endpoint,
          cpdDiagramEndpoint: parameters.cpdDiagramEndpoint
        });
      questionSelectionFilters = parameters.questionSelectionFilters || [''];
      qaeCORE.getInstance().getDiagramDetails(simpaticoEservice, function(response){
        response = response[0] || response || {};
        diagramURL = response.url;
      });
      questionsURL = parameters.questionsURL || 'https://simpatico.smartcommunitylab.it/qae/questions';
    }
    
    function setParagraphId(){
        if (paragraphs.length === 0) {
          paragraphs = document.getElementsByClassName(elementsToEnhanceClassName);
        }
        // console.log("paragraphs:",paragraphs);
        var paragrapId = 1;
        var paragraphName = '';
        for (var i = 0, len = paragraphs.length; i < len; i++) {
          paragraphName = "Paragraph" + paragrapId;
          paragraphs[i].setAttribute("id", paragraphName);
          paragrapId++;
        }
      }

    function enableComponentFeatures() {
      if (featureEnabled) return;
      featureEnabled = true;

      // Gets the tagged paragraphs the first time
      if (paragraphs.length === 0) {
        paragraphs = document.getElementsByClassName(elementsToEnhanceClassName);
      }

      // Add special format and add a couple of attributes to the paragraphs
      var paragrapId = 1;
      var paragraphName = '';
      for (var i = 0, len = paragraphs.length; i < len; i++) {
        // Store original style
        originalStyles[i] = paragraphs[i].style;

        // Add the enhanced paragraph style
        paragraphName = "Paragraph" + paragrapId;
//        paragraphs[i].style.position = 'relative';
//        paragraphs[i].style.borderLeft = "12px solid " + primaryColor;
//        paragraphs[i].style.borderRadius = "16px";

//        paragraphs[i].style.padding = '0px 0px 0px 8px';
//        paragraphs[i].style.margin = '0px 0px 8px 0px';
        paragraphs[i].classList.add('simp-paragraph-active');
        paragraphs[i].style.borderLeftColor = primaryColor;

        paragraphs[i].setAttribute("id", paragraphName);
        // Add the onclick event to enhance the paragraph
        paragraphs[i].setAttribute("onclick", 
          "citizenpediaUI.getInstance()." + 
          "paragraphEvent('" + paragraphName + "');");
        paragrapId++;
      }
      qaeCORE.getInstance().getDiagramDetails(simpaticoEservice, drawDiagramNotification);

    }
  
    function disableComponentFeatures() {
      if (!featureEnabled) return;
      featureEnabled = false;

      // Remove Question Boxes
      var questionsBoxes = document.getElementsByClassName(questionsBoxClassName);
      for (var i = questionsBoxes.length - 1; i >= 0; i--) {
        questionsBoxes[i].parentNode.removeChild(questionsBoxes[i]);
      }
      
      // Reformat the paragraphs with the original style
      for (var i = 0, len = paragraphs.length; i < len; i++) {
        // Restore the original style
        paragraphs[i].classList.remove('simp-paragraph-active');
        // Remove the onclick event to enhance the paragraph
        paragraphs[i].removeAttribute("onclick");
      }

      // Remove the diagram notification
      if (diagramContainer != null) {
        diagramContainer.parentNode.removeChild(diagramContainer);
        diagramContainer = null;
      }
    }


    // If the Component feature is enabled it calls to the Citizenpedia instance to 
    // get the questions related to the paragraph passed as parameter
    // - paragraphName: the id of the paragraph which has produced the event
    // IMPORTANT: Here is used the global variable simpaticoEservice
    function paragraphEvent(paragraphName) {
      if (!featureEnabled) return;
      // trick for WAE
      if ($('#'+paragraphName).hasClass('wae-disabled')) return;
      if (document.getElementById(paragraphName + "_questions") === null) {
        qaeCORE.getInstance().getQuestions(simpaticoEservice, paragraphName, drawQuestionsBox);
      } else {
        hideQuestionsBox(paragraphName);
      }
    }

    // If logs when user creates a new question related to the paragraph passed as parameter
    // - paragraphName: the id of the paragraph which has produced the event
    function createNewQuestionEvent(paragraphName) {
      if (!featureEnabled) return;
    }


    // If logs when user creates a new question related to the paragraph passed as parameter
    // - paragraphName: the id of the paragraph which has produced the event
    // - questionID: the id of the question which is the user interested in
    function showQuestionDetailsEvent(paragraphName, questionID) {
      if (!featureEnabled) return;
    }    

    // Draw the questions box
    // - paragraphName: the id of the paragraph
    // - responseQuestions: the JSON Object of the questions related to the paragraph
    // IMPORTANT: Here is used the global variable simpaticoEservice
    function drawQuestionsBox(paragraphName, responseQuestions) {
        // trick for WAE
      $('#div_simpatico_block_description').hide();
      // Create the Questions Box div
      var questionsBox = document.createElement('div');
      questionsBox.id = paragraphName + "_questions";
      questionsBox.className = questionsBoxClassName;
      
      // 1. the title is attached 
      var questionsHtml = '<p>' + questionsBoxTitle + '</p>';

      // 2. a list containing the made questions is attached
      questionsHtml += '<ul>';

      // 2.a. for each question a new bulletpoint is made 
      for (var i = 0, len = responseQuestions.length; i < len; i++) {
        questionsHtml += '<li>' + 
                            '<a onclick="citizenpediaUI.getInstance().showQuestionDetailsEvent(\'' + paragraphName + '\', \'' + responseQuestions[i]._id + '\');" ' +
                            'href="' + qaeCORE.getInstance().createQuestionDetailsURL(
                                  responseQuestions[i]._id) + '"  target="_blank">' +
                                '<b>' + responseQuestions[i].answers.length + '</b>' + 
                                '<i>' + responseQuestions[i].title + '</i>' +
                            '</a>' +
                         '</li>';
      }

      // 2.b. finally the Add Question link is also attached 
      questionsHtml += '<li>';
      var selectors = questionSelectionFilters;
      var txt = '';
      for (var v = 0; v < selectors.length; v++) {
    	  txt = $("#"+paragraphName + " " + selectors[v]).text().trim();
    	  if (txt) {
    		  break;
    	  }
      }
      txt = txt.replace(/[\f\t\n\r\v\s]+/g,' ');
      questionsHtml +=    '<a onclick="citizenpediaUI.getInstance().createNewQuestionEvent(\'' + paragraphName + '\');" ' +
                              'href="' + qaeCORE.getInstance().createNewQuestionURL(
                                  simpaticoCategory,
                                  simpaticoEservice,
                                  paragraphName, 
                                  txt) + '" target="_blank">' +
                                '<b>' + addQuestionLabel + '</b>' +
                          '</a>'
      questionsHtml += '</li>';
      
      questionsHtml += '</ul>';

      questionsBox.innerHTML = questionsHtml;
      document.getElementById(paragraphName).appendChild(questionsBox);
    } //drawQuestionsBox

    // Hide the questions box attached to a paragraph passed as paramether
    // - paragraphName: the id of the paragraph
    function hideQuestionsBox(paragraphName) {
      // trick for WAE
      $('#div_simpatico_block_description').show();
      var qBoxToRemove = document.getElementById(paragraphName + "_questions");
      qBoxToRemove.parentNode.removeChild(qBoxToRemove);
    }

    // If a diagram related to the enhanced e-service exists, a notification appears
    // - response: a JSON response provided by the Citizenpedia instance 
    function drawDiagramNotification(response) {
      if (response != null) {
    	response = response[0] || response;
        // Attach the notification container
        var diagramNode = document.getElementById('simp-bar');
        diagramContainer = document.createElement('div');
        diagramContainer.className = diagramNotificationClassName;
        if(diagramNode.nextSibling){ 
            diagramNode.parentNode.insertBefore(diagramContainer, diagramNode.nextSibling); 
        } else { 
            diagramNode.parentNode.appendChild(diagramContainer); 
        }
        // Attach the corresponding CPD elements
        //document.getElementById(\'cpdsvg\').style.display = \"block\";
        var content = '<img ' +
                              'onClick="document.getElementById(\'cpdsvg\').style.display == \'none\' ? document.getElementById(\'cpdsvg\').style.display = \'block\' : document.getElementById(\'cpdsvg\').style.display = \'none\'"' +
                              'src="' + diagramNotificationImage + '" ' +
                              'width="40" ' +
                              'height="40"' +
                              'title="' + diagramNotificationText + '" ' +  
                              'alt="' + diagramNotificationText + '" >' +
                      '<a href="' + response["url"] + '" target="_blank">' +
                        '<img id="cpdsvg" style="display:none;" src="' + response["svg"] + '">' +
                      '</a>';
        diagramContainer.innerHTML = content;
    	diagramURL = response["url"];
      }
    }
    
    function openQuestionDiagram(){
      var questionModalContainer = document.getElementById("questionModal");
      if (questionModalContainer == null) {
        var body = document.getElementsByTagName('body')[0];
        questionModalContainer = document.createElement('div');
        body.insertBefore(questionModalContainer, body.firstChild);
        //simpaticoEservice is a global variable that initialized in install time
        qaeCORE.getInstance().getAllQuestions(simpaticoEservice,function(response){
          
          var listItem="";
          $.each(response, function (index, value){
            var ansLength=value.answers.length;
            var ansListItem="";
            if(ansLength < 10){
              if(ansLength == 0){
                listItem+="<a class='list-group-item'>"+value.title+"<span class='ansNum'>"+ansLength+"</span></a>";  
              }else{
                $.each(value.answers,function(index2, value2){
                  ansListItem+="<a  class='list-group-item'>"+value2.content+"</a>";
                });
                listItem+="<a href='#' class='list-group-item' data-toggle='collapse' data-target='#"+value._id+"'>"+value.title+"<span class='ansNum'>"+ansLength+"</span></a><div id='"+value._id+"' class='collapse'><div class='list-group'>"+ansListItem+"</div></div>";
              }
            }else{
              listItem += "<a href='#' class='list-group-item' href='"+questionsURL+"/show/"+value._id+"' target='_blank'>"+value.title+"<span class='ansNum'>"+ansLength+"</span></a>";
            }
          });
          var questionModalHTML='<div class="modal fade bottom" id="questionModal" role="dialog">'+
                                  '<div class="modal-dialog">'+
                                    '<div class="modal-content">'+
                                      '<div class="modal-header question-modalHeader">'+
                                        '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                                        '<h3 class="modal-title">'+questionsBoxTitle+'</h3>'+
                                      '</div>'+
                                      '<div class="modal-body questionModalBody">'+
                                        // '<input class="form-control input-sm" id="inputQuestion" type="text" placeholder="Type your question here">'+
                                        '<div class="list-group">'+
                                          listItem +
                                        '</div>'+
                                      '</div>'+
                                      '<div class="modal-footer">'+
                                        // '<button type="button" class="btn btn-default" data-dismiss="modal">CANCEL</button>'+
                                        '<button type="button" class="btn btn-default btn-send" id="sendQuestions" onclick="sendQuestion();" >'+addQuestionLabel+'</button>'+
                                      '</div>'+
                                    '</div>'+
                                  '</div>'+
                                '</div>';
        
        
          questionModalContainer.innerHTML=questionModalHTML;
          $("#questionModal").modal();
        });
      }else{
        $("#questionModal").modal();
      }
      
    }
    
    return {
      // Public definitions
      init: initComponent, // Called only one time
      enable: enableComponentFeatures,  // Called when the Component button is enabled
      disable: disableComponentFeatures, // Called when the Component button is disabled or another one enabled
      setParagraphId: setParagraphId,
      isEnabled: function() { return featureEnabled;}, // Returns if the feature is enabled
      openDiagram: function(){
		    window.open(diagramURL,"_blank");
      },
      openQuestionDiagram: openQuestionDiagram,
      paragraphEvent: paragraphEvent,

      createNewQuestionEvent: createNewQuestionEvent,
      showQuestionDetailsEvent: showQuestionDetailsEvent
    };
  }
  
  return {
    getInstance: function() {
      if(!instance) instance = Singleton();
      return instance;
    }
  };
})();