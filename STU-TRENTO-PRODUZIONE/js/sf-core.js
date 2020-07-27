/*
JSON to create dialog
{
  "common": {
    "eserviceId": "<string>",
    "lang": "<string>", // es, en, it
    "dialog_title": "<string>",
    "button_cancel_label": "<string>",
    "button_send_label": "<string>",
    "faces_question": "<string>",
    "range_unuseful": "<string>",
    "range_useful": "<string>",
    "range_min": "0",
    "range_max": "10",
    "range_step": "1"
  },
  questions: [
    {
      "component": "<string>", // ctz, tae-word, tae-paragraph, tae-phrase, wae, timeout, global
      "type": "range OR text OR radio",
      "question_text": "<string>",
      "textarea_placeholder": "<string>", // Only if type == "text"
      "options": [<string>], // Only if type == "radio"
      "input_id": "<string>" // When saved in database, it is used as key. No hyphens
    }
  ]
}

*/

var sfCORE = (function () {
  var instance;

  function Singleton () {
    var endpoint = '';
    var listener = null;
    var language = null;

    function initComponent (parameters) {
      endpoint = parameters.endpoint;
      listener = parameters.listener;
      language = parameters.language || 'en';
    }

    function selectDialog (timeoutExceeded, userId) {
      // Check which dialog show
      var lang = language; 
      $.get(endpoint + "/sf/selectdialog?id="+userId+"&timeout="+timeoutExceeded+"&lang="+lang+"&eserviceId="+simpaticoEservice,
        function (json) {
          console.log(json);
          if (!$.isEmptyObject(json)) {
            showFeedbackDialog(json, lang);
          } else {
            console.log("No questions for this eservice");
//            window.location = simpaticoEservice + "_end.html"; // TODO: ??
            if (!!listener) listener();
          }
        });
    }

    // Internal
    function showFeedbackDialog (json, lang) {
      var questionsHtml = "";
      // Create questions
      for (var i=0; i<json.questions.length; i++) {
        var question = json.questions[i];
        if (question.type == "text") {
          questionsHtml += '<div class="session-feedback-content">'+
            '<div class="mensaje"><p>'+
              question.question_text +
            '</p></div>'+
            '<div class="session-feedback-comments">'+
              '<textarea id="'+question.input_id+'" class="session-feedback-comments-text" placeholder="'+ question.textarea_placeholder +'" cols="40" rows="5" data-component="'+question.component+'" style="resize: none;"></textarea>'+
            '</div>'+
          '</div><br>';
        } else if (question.type == "range") {
          var value = (json.common.range_max - json.common.range_min) / 2;
          questionsHtml += '<div class="slider-session-feedback-content">'+
              '<div class="mensaje"><p>'+
                question.question_text +
              '</p></div>'+
              '<form>'+
                '<input id="'+question.input_id+'" data-component="'+question.component+'" class="slider" type="range" min="'+json.common.range_min+'" max="'+json.common.range_max+'" step="'+json.common.range_step+'" value="'+value+'" oninput="rangeValue_'+question.input_id+'.value = '+question.input_id+'.value"/>'+
                '<div class="slider-horizontal-text-below-left">'+ json.common.range_unuseful +'</div>'+
                '<div class="slider-horizontal-text-below-right">'+ json.common.range_useful +'</div>'+
                '<div class="slider-output-session-feedback" style="text-align: center;"><output id="rangeValue_'+question.input_id+'">'+value+'</output></div>'+
              '</form>'+
            '</div><br>';
        } else if (question.type == "radio") {
          var optionsHtml = "";
          for (var j=0; j<question.options.length; j++) {
            optionsHtml += '<div class="form-group">'+
                  '<div class="radio">'+
                    '<label>'+
                      '<input type="radio" name="'+question.input_id+'" value="'+question.options[j]+'" data-component="'+question.component+'">'+
                        question.options[j] +
                    '</label>'+
                  '</div>'+
                '</div>';
          }
          questionsHtml += '<div class="session-feedback-radio">'+
              '<div class="mensaje"><p>'+
                question.question_text +
              '</p></div>'+
              optionsHtml +
              '</div>';


        }
      }
      // Create modal common functionality
      var modal = '<div id="dialog_modal_session_feedback_a" class="modalligazon modal-session-feedback">'+
          questionsHtml +
          '<!-- Faces -->'+
          '<div id="faces-session-feedback-content">'+
            '<div class="mensaje"><p>'+
              json.common.faces_question +
            '</p></div>'+
            '<div id="face-radio-buttons-session-feedback" class="cc-selector">'+
              '<input id="face-happy-session-feedback" class="input_hidden" name="faces_session_feedback" type="radio" value="happy" data-component="global"/>'+
              '<label for="face-happy-session-feedback" data-face="happy" class="left" style="margin-left: 10%;border-radius: 20%;"><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/happy_face.png" alt="Happy"/></label>'+
              '<input id="face-normal-session-feedback" class="input_hidden" name="faces_session_feedback" type="radio" value="normal" data-component="global"/>'+
              '<label for="face-normal-session-feedback" data-face="normal" style="margin-left: 20%;border-radius: 20%;"><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/normal_face.png" alt="Normal"/></label>'+
              '<input id="face-sad-session-feedback" class="input_hidden" name="faces_session_feedback" type="radio" value="sad" data-component="global"/>'+
              '<label for="face-sad-session-feedback" data-face="sad" class="right" style="margin-right: 10%;border-radius: 20%;"><img src="https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo/img/sad_face.png" alt="Sad" /></label>'+
            '</div>'+
          '</div>'+
          '<!-- Buttons send/cancel -->'+
          '<div id="buttons_session_feedback" style="padding-top: 50px;padding-bottom: 20px">'+
            '<div class="mais button_cancel_session_feedback" style="position:relative;float:left;margin-left:40px;">'+
              '<a id="button_cancel_session_feedback_text" style="border-radius:5px 5px 5px 5px;width:auto;">'+ json.common.button_cancel_label +'</a>'+
            '</div>'+
            '<div class="mais" id="button_send_session_feedback_a" style="position:relative;float:right;margin-right:40px;">'+
              '<a id="button_send_session_feedback_text" style="border-radius:5px 5px 5px 5px;width:auto;">'+ json.common.button_send_label +'</a>'+
            '</div>'+
          '</div>'+
        '</div>';

      var title_modal_session_feedback = "Send us your comments!"
      if (lang == "es") title_modal_session_feedback = "¡Envíenos sus comentarios!";
      else if (lang == "it") title_modal_session_feedback = "Inviaci i tuoi commenti!"

      $('<div id="dialogSF" />').html(modal).dialog({
  			title: json.common.dialog_title,
      	modal: true,
  			resizable: true,
  			height: 475,
  			width: 800
        // buttons: [
        //   {
        //     text: json.common.button_cancel_label.toUpperCase(),
        //     click: function () {
        //       if (!!listener) listener();
        //       $('#dialogSF').dialog("destroy").remove();
        //     }
        //   },
        //   {
        //     text: json.common.button_send_label.toUpperCase(),
        //     click: function () {
        //       sendFeedback();
        //     }
        //   }
        // ]
      });
      $('.ui-dialog').css('zIndex', '10000').css('font-size', '14px');
      $('#dialogSF').show();
      $('#dialogSF #button_cancel_session_feedback_text').off('click').on('click', function () {
    	  if (!!listener) listener();
    	  $('#dialogSF').dialog("destroy").remove();
      });
      $('#dialogSF #button_send_session_feedback_text').off('click').on('click', sendFeedback);
    }

    // Internal
    function sendFeedback () {
      console.log("SendFeedback");
      /*
        Ej:
          ranges: [
            {
              id: <id>,
              value: <value>,
              component: <component>
            }
          ],
          texts: [
            {
              id: <id>,
              value: <value>,
              component: <component>
            }
          ],
          radios: [
            {
              id: <id>,
              value: <value>,
              component: <component>
            }
          ]
      */
  		var dataForms = $('#dialogSF input,#dialogSF textarea,#dialogSF select');
  		var dataObj = {
        ranges: [],
        texts:� [],
        radios: []
      };
  		dataForms.each(function(idx, d) {
  			var key = d.name ? d.name : d.id;
        var obj = {};
        obj.id = key;
        obj.value = d.value;
        obj.component = d.dataset.component;

  			if (d.type=='radio') {
  				if (d.checked) {
            dataObj.radios.push(obj);
          }
        } else if (d.type == 'range') {
          dataObj.ranges.push(obj);
  			} else {
          // Text
    			dataObj.texts.push(obj);
  			}
  		});
      console.log("Sending:");
      console.log(dataObj);
      // TODO: manage complexity correctly
      complexity = 0;
      logCORE.getInstance().sfLogger.feedbackEvent(simpaticoEservice, complexity);
      
  		logCORE.getInstance().sfLogger.feedbackData(simpaticoEservice, dataObj);

		  if (!!listener) listener();
      // Close dialog
      $('#dialogSF').dialog("destroy").remove();
    }

    return {
      init: initComponent,
      selectDialog: selectDialog
    };
  }

  return {
    getInstance: function () {
      if (!instance) instance = Singleton();
      return instance;
    }
  };
})();