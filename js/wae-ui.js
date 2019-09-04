/**
 * WORKFLOW ENGINE UI OPERATIONS
 */
var waeUI = (function () {

  var instance; // Singleton Instance of the UI component

  function Singleton() {
	
	var blockMap = {};
	var moduleErrorMessage;
	var topBarHeight = 50;
	var errorLabel = {};
    this.active = false;
    this.idProfile = null;
	var currentParagraphId, currentParagraphTitle, currentBlockId;
    var lang = "en";
	
  	var labels = {
			prevButtonLabel: 'Previous',
			nextButtonLabel: 'Next',
			lastButtonLabel: 'Done',
			descriptionLabel: 'Description'
	};
	
	/**
	 * INITIALIZE UI COMPONENT.
	 * CONFIG PARAMETERS:
	 * - lang: INTERFACE LANGUAGE TO USE
	 * - endpoint: URL OF THE WAE REPOSITORY ENDPOINT TO LOAD MODELS (FOR CORE MODULE)
	 * - nextButtonLabel: TEXT FOR NEXT BUTTON
	 * - prevButtonLabel: TEXT FOR PREV BUTTON
	 * - topBarHeight: HEIGHT OF THE BAR
	 */
	this.init = function(config) {
		this.reset();
		currentParagraphId = null, currentParagraphTitle = null, currentBlockId = null;
		waeEngine.reset();
		
		config = config || {};
		if (config.lang) {
			lang = config.lang;
		}
		if (config.endpoint) {
			waeEngine.init({endpoint: config.endpoint});
		}
		labels.prevButtonLabel = config.prevButtonLabel || labels.prevButtonLabel;
		labels.nextButtonLabel = config.nextButtonLabel || labels.nextButtonLabel;
		labels.lastButtonLabel = config.lastButtonLabel || labels.lastButtonLabel;
		labels.descriptionLabel = config.descriptionLabel || labels.descriptionLabel;
		topBarHeight = config.topBarHeight != null ? config.topBarHeight : topBarHeight;
		errorLabel = config.errorLabel;
	}
	
	/**
	 * LOAD MODEL FROM ENGINE
	 */
	this.loadModel = function(idProfile) {
		var moduleUri = $("[data-simpatico-workflow]").attr('data-simpatico-workflow');
		if (!!idProfile) {
			this.idProfile = idProfile;
		}
		waeEngine.loadModel(moduleUri, this.idProfile, moduleLoaded, moduleLoadError);
	};

	/**
	 * Return true if the WAE is active
	 */
    this.isEnabled = function(){
      return instance.active;
	}
	/**
	 * Activate WAE step by step (without Guide tool) makes the last shown block active (or the first one).
	 */
    this.enable = function(idProfile) {
    	if (waeEngine.isLoaded()) {
    		for(var key in blockMap) {
    			if(blockMap.hasOwnProperty(key)) {
    				showElement(key, "HIDE");
    			}
    		}
    		waeEngine.restartBlock(doActions, moduleErrorMsg);    		
    	} else {
        	this.loadModel(idProfile);
    	}
		instance.active = true;
    }
	/**
	 * RETURN TRUE IF THE CURRENT PAGE CONTAINS FORM TO SIMPLIFY
	 */
	this.available = function(){
		var ens = $("[data-simpatico-workflow]");
		if(ens && ens.length > 0) return true;
		return false;
	}
	/**
	 * RESET THE VIEW
	 */
	this.reset = function(stay){
		for(var key in blockMap) {
			if(blockMap.hasOwnProperty(key)) {
				showElement(key, "SHOW");
			}
		}
		$('.groupList').removeClass('active');
		resetBlock(waeEngine.getActualBlockId());
		instance.active = false;
		if (!stay) $('html, body').animate({scrollTop: 0}, 200);
	}
    this.disable = this.reset;


	function moduleLoaded(map) {
		blockMap = map;
		for(var key in map) {
			if(map.hasOwnProperty(key)) {
				showElement(key, "HIDE");
			}
		}
		waeEngine.nextBlock(doActions, moduleErrorMsg);
	};
	
	function moduleLoadError(text) {
		alert("Model error");
	};
	
	function showElement(simpaticoId, state) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			if(state == "SHOW") {
				element.fadeTo("fast", 1);
				element.removeClass('wae-disabled');
			} else if(state == "HIDE") {
				element.addClass('wae-disabled');
				element.fadeTo("fast", 0.3);
			}
		}
	};
	
	function resetBlock(simpaticoId) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			var container = waeEngine.getSimpaticoContainer();
			if(container != null) {
				$(container).replaceWith(element);
			}
		}
	};
	
	function editBlock(simpaticoId) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			element.wrap("<div data-simpatico-id='simpatico_edit_block' class='block_edited_wrapper'><div  class='block_edited'></div></div>" );
			var container = waeEngine.getSimpaticoContainer();
			var containerInt = $(container).find(".block_edited");
			if(container != null) {
				//add prev button
				if(waeEngine.getActualBlockIndex() > 0) {
					$(containerInt).append(createPrevButton());
				}
				//add next button
				if(waeEngine.getActualBlockIndex() < (waeEngine.getBlocksNum() - 1)) {
					$(containerInt).append(createNextButton());
				} else {
					$(containerInt).append(createLastButton());
				}
				//add error message
				$(containerInt).append(createErrorMsg());
				var offset = $(container).offset();
				if (offset) {
					var position = offset.top - topBarHeight;
					$('html, body').animate({scrollTop: position}, 200);
				}
				var description = waeEngine.getBlockDescription();
				if (description && description[lang]) {
					description = description[lang];
				} else {
					description = "";
				}
				$(container).append(createDescription(description));
			}
		}
	};
	
	function doActions(actions) {
		moduleErrorMessage = "";
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "HIDE") {
				resetBlock(blockId);
				showElement(blockId, "HIDE");
			}
		}
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "SHOW") {
				showElement(blockId, "SHOW");
				editBlock(blockId);
				break;
			}
		}
	};
	
	function moduleErrorMsg(text) {
		var keyNames = Object.keys(JSON.parse(text));
		var blockId = keyNames[0];
		moduleErrorMessage = errorLabel[blockId];
		var element = $("#div_simpatico_error_msg");
		if(element != null) {
			$(element).text(moduleErrorMessage);
		}
	};
	
	function createErrorMsg() {
		return $('<label/>', {
			text: '',
			id: 'div_simpatico_error_msg'
		});
	};
	function createDescription(text) {
		return $('<div id="div_simpatico_block_description"><h5>'+labels.descriptionLabel+'</h5><div class="div_simpatico_block_description_content">'+text+'</div></div>');
	};

	function createNextButton() {
	  return $('<button/>', {
	  	type: 'button',
	    text: labels.nextButtonLabel,
	    class: 'ui-button ui-widget',
	    id: 'btn_simpatico_next'
	  }).click(nextBlock);
	};
	function createLastButton() {
		  return $('<button/>', {
		  	type: 'button',
		    text: labels.lastButtonLabel,
		    class: 'ui-button ui-widget',
		    id: 'btn_simpatico_next'
		  }).click(lastBlock);
		};
	
	function nextBlock() {
		waeEngine.nextBlock(doActions, moduleErrorMsg);
	};
	function lastBlock() {
		instance.reset(true);
	};

	function createPrevButton() {
	  return $('<button/>', {
	    type: 'button',
	  	text: labels.prevButtonLabel,
	  	class: 'ui-button ui-widget',
	    id: 'btn_simpatico_prev'
	  }).click(prevBlock);
	};
	
	function prevBlock() {
		waeEngine.prevBlock(doActions, moduleErrorMsg);
	};
	
	/**
	 * WAE with guide toolbars: one for the list of available blocks and another with the block details. 
	 */
	this.loadModelWithGuide = function(idProfile) {
		var moduleUri = $("[data-simpatico-workflow]").attr('data-simpatico-workflow');
		if (!!idProfile) {
			this.idProfile = idProfile;
		}
		waeEngine.loadModel(moduleUri, this.idProfile, moduleLoadedWithGuide, moduleLoadError);
	};
	function moduleLoadedWithGuide(blocks){
		blockMap = blocks;
		console.log("Data::",blocks);
		//to set paragraph ID in every block
		citizenpediaUI.getInstance().setParagraphId();
		var paragraphId = 1;
		$.each(blocks, function(k, v) {
			// var param=paragraphId+',"'+encodeURI(v.description.it)+'"';
			// var param=JSON.stringify(v);
			var name = v.name && v.name[lang] ? v.name[lang] : k;
			$("#paragraphTitles").append("<p id='guide"+k+"' onclick='waeUI.getInstance().detailsHelp("+paragraphId+")' class='groupList'>"+name+"</p>");
			
			$( "#guide"+k ).on({
				click: function(){
					// currentParagraphId='Paragraph'+paragraphId;	
					
				},
				mouseenter: function() {
				  $( this ).addClass( "hoverList" );
				}, 
				mouseleave: function() {
				  $( this ).removeClass( "hoverList" );
				}
			});
			paragraphId++;
		});
	}

    this. enableWithGuide = function(idProfile) {
		$('#guideNotificationNext').text(labels.nextButtonLabel);
		$('#guideNotificationPrev').text(labels.prevButtonLabel);
		if (waeEngine.isLoaded()) {
    		for(var key in blockMap) {
    			if(blockMap.hasOwnProperty(key)) {
    				showElement(key, "HIDE");
    			}
    		}
			$('#guideNotification').show();
    		waeEngine.restartBlock(doActionsWithGuide, moduleErrorMsgWithGuide);    		
			instance.active = true;
    	} else {
			// first init, hide help description as no blocks selected
			$('#guideNotification').hide();
        	this.loadModelWithGuide(idProfile);
    	}
    }
	/**
	 * RESET THE VIEW
	 */
	this.resetWithGuide = function(stay){
		for(var key in blockMap) {
			if(blockMap.hasOwnProperty(key)) {
				showElement(key, "SHOW");
			}
		}
		resetBlock(waeEngine.getActualBlockId());
		instance.active = false;
		$('#guideNotification').hide();
		if (!stay) $('html, body').animate({scrollTop: 0}, 200);
	}
	this.disableWithGuide = this.resetWithGuide;
	
	function showHelp(paragraphId, waeEngine) {
		if (waeEngine.isLoaded()) {
			// $('#helpModal').show();
			$("#blockDetails").html(waeEngine.getBlockDescription(paragraphId).it);
		}
		$('#guideblock'+currentBlockId).removeClass('active');
		$('#helpModalPlaceholder').hide();
		$('#helpModalContent').show();

		currentParagraphId = 'Paragraph'+paragraphId;	
		currentParagraphTitle = "test123...";
		currentBlockId = paragraphId;
		$('#guideblock'+currentBlockId).addClass('active');
		
		qaeCORE.getInstance().getQuestions(simpaticoEservice,currentParagraphId,function(paragraphName, jsonResponse){
			console.log("question::",jsonResponse);
			if(jsonResponse.length > 0){
				var questions="";
				$.each(jsonResponse, function(key, val) {
					var answers='';
					if(val.answers.length == 1){answers='<br>(1 risposta)';}
					if(val.answers.length > 1){answers='<br>('+val.answers.length+' risposte)';}
					var answerContent = '<div class="question-title"><a onclick="waeUI.getInstance().showQuestion(\''+val._id+'\')">'+val.content+'</a></div>';
					val.answers.forEach(function(a) {
						var txt = 
						'<div class="answer">'+
						'<div class="answer-content">'+a.content+'</div>'+
						'<div class="answer-comment"><a onclick="waeUI.getInstance().showQuestion(\''+val._id+'\')">Aggiungi commento</a></div>'+
						'<div class="answer-user"><a onclick="waeUI.getInstance().showQuestion(\''+val._id+'\')">'+a.user.name+'</a></div>'+
						'</div>';
						answerContent += txt;
					});
					if (val.answers.length ==0) answerContent += '<div class="answer">Nessuna risposta</div>';
					questions += '<h3><b>'+val.title+'</b>'+ answers+'</h3><div>'+answerContent+'</div>';
				});
				if ($( "#blockQuestions" ).accordion( "instance" )) $("#blockQuestions").accordion('destroy');
				$("#blockQuestions").html(questions);
				$("#blockQuestions").accordion({active: false, collapsible: true, heightStyle: 'content'});
			}else{
				$("#blockQuestions").html(" ");
			}
			
		});

	}

	this.detailsHelp = function(paragraphId){
		this.resetWithGuide(true);
		// trick for directly changing the button
		$('#workflow').removeClass('simp-bottomBar-btn-active');
		$('#workflow').addClass('simp-bottomBar-btn-inactive');

		goToBlock('Paragraph'+paragraphId);
		showHelp(paragraphId, waeEngine);
	}
	this.createNewQuestion=function(){
		window.open(qaeCORE.getInstance().createNewQuestionURL(simpaticoCategory,simpaticoEservice,currentParagraphId,currentParagraphTitle),"_blank");
	}
	this.showQuestion = function(questionId) {
		window.open(qaeCORE.getInstance().createQuestionDetailsURL(questionId),"_blank");
	}

	this.progress = function() {
		if (instance.active) {
		  nextBlockWithGuide();
		} else {
			this. enableWithGuide();
		}
	}
	this.back = function() {
		if (instance.active) {
		  prevBlockWithGuide();
		} else {
			this. enableWithGuide();
		}
	}
	
	function goToBlock(paragraphId) {
		var container = paragraphId ? $('#'+paragraphId) : waeEngine.getSimpaticoContainer();
		if(container != null) {
			var offset = $(container).offset();
			if (offset) {
				var position = offset.top - topBarHeight;
				$('html, body').animate({scrollTop: position}, 200);
			}
		}
	
	}
	function editBlockWithGuide(simpaticoId) {
		var element = waeEngine.getSimpaticoBlockElement(simpaticoId);
		if(element != null) {
			showHelp(waeEngine.getActualBlockIndex()+1, waeEngine);
			element.wrap("<div data-simpatico-id='simpatico_edit_block' class='block_edited_wrapper col-md-12'><div  class='block_edited'></div></div>" );
			goToBlock();
		}
	};
	
	function doActionsWithGuide(actions) {
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "HIDE") {
				resetBlock(blockId);
				showElement(blockId, "HIDE");
			}
		}
		for(var blockId in actions) {
			var state = actions[blockId];
			if(state == "SHOW") {
				showElement(blockId, "SHOW");
				editBlockWithGuide(blockId);
				clearErrorMsg();
				break;
			}
		}
		if(waeEngine.getActualBlockIndex() < (waeEngine.getBlocksNum() - 1)) {
			$('#guideNotificationNext').text(labels.nextButtonLabel);
		} else {	
			$('#guideNotificationNext').text(labels.lastButtonLabel);
		}
		if(waeEngine.getActualBlockIndex() == 0) {
			$('#guideNotificationPrev').hide();
		} else {	
			$('#guideNotificationPrev').show();
		}
		// $('#helpModal').show();

	};
	
	function moduleErrorMsgWithGuide(text) {
		var keyNames = Object.keys(JSON.parse(text));
		var blockId = keyNames[0];
		moduleErrorMessage = errorLabel[blockId];
		createErrorMsg(moduleErrorMessage);
		// var element = $("#div_simpatico_error_msg");
		// if(element != null) {
		// 	$(element).text(moduleErrorMessage);
		// }
	};
	
	function createErrorMsg(msg) {
		$('#errorMessages').text(msg);
	};
	function clearErrorMsg() {
		$('#errorMessages').text('');
	}

	function nextBlockWithGuide() {
		waeEngine.nextBlock(doActionsWithGuide, moduleErrorMsgWithGuide);
	};
	function prevBlockWithGuide() {
		waeEngine.prevBlock(doActionsWithGuide, moduleErrorMsgWithGuide);
	};
  }
  
  return {
    	getInstance: function() {
    		if(!instance) instance = new Singleton();
    		return instance;
    	}
    };
})();
