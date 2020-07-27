function toggleTextSimplifiction() {
    taeUIInline.getInstance().clickTextCheckbox();
  }
  function toggleWordSimplifiction() {
    taeUIInline.getInstance().clickWordCheckbox();
  }

$( function() {
	$(document).tooltip();
});
/**
 * TAE UI OPERATIONS
 */
var taeUIInline = (function () {
  var _instance; // Singleton Instance of the UI component

  function Singleton() {
      _instance = this;

      _instance.sentences = [];
      _instance.enabled = false;
      
      
      _instance.globalTextCheckboxVal = false;
      _instance.globalWordCheckboxVal = false;
      _instance.localPrepareResult;
      _instance.loadFirstTimeText = true;
      _instance.loadFirstTime=true;

      _instance.endpoint = null;
      _instance.synonimLabel = null;
      _instance.definitionLabel = null;
      _instance.simplifedTextLabel = null;
      _instance.elementId = null;
      _instance.textContainerQuery = null;
      _instance.textQueryString = null;
      _instance.resourceURL= null;

      _instance.init = function(config) {
        _instance.endpoint = config.endpoint || 'https://simpatico.smartcommunitylab.it/simp-engines/tae';
        _instance.simpDataURL = _instance.endpoint + "/model";
        _instance.synonimLabel = config.synonimLabel || 'Synonims';
        _instance.definitionLabel = config.definitionLabel || 'Definition';
        _instance.simplifedTextLabel = config.simplifedTextLabel || 'Simplified Text';
        _instance.elementId = config.elementId;
        _instance.definitionHint = config.definitionHint || 'Shows the definition of the selected word';
        _instance.simplifedTextLabel = config.simplifedTextLabel || 'Shows a simplified version of the selected text';
        _instance.textContainerQuery = config.textContainerQuery || 'simpatico-text';
        _instance.textQueryString = config.textQueryString || 'p,li';
        _instance.resourceURL = config.resourceURL || 'https://simpatico.smartcommunitylab.it/simp-engines/wae/webdemo';

        getTextsAndsetSpan(_instance);
        //
        jQuery.getJSON(_instance.simpDataURL + "?pageId=" + pageID,function(jsonResponse,status) {
          if(status=="success"){
            _instance.localPrepareResult=jsonResponse['blocks'];
          }
        }).done(function() {
          console.log( "Success! pageId exist and got data." );
        })
        .fail(function() {
          console.log( "fail! pageId not exist, call API for get simp data." );
          var sendData;
          getAPIResults(_instance).then(function(result){
            sendData={
              "blocks":result,
              "pageId":pageID
            };
            setTimeout(function(){
              $.ajax({
                url: _instance.simpDataURL,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                type: "POST",
                data: JSON.stringify(sendData),
                success: function (msg) {
                  if (msg != null) {
                    jQuery.getJSON(_instance.simpDataURL + "?pageId=" + pageID,function(jsonResponse) {
                      _instance.localPrepareResult=jsonResponse['blocks'];
                    });
                  } 
                }
              });
            }, 2000);
          });   
        });
    
  
      }
      _instance.isEnabled = function() {
    	  return _instance.enabled;
      }
      
      _instance.hideDialog = function() {
        $('#'+_instance.elementId).popover('hide');
        _instance.enabled = false;
      }

      _instance.showDialog = function() {
        $('#'+_instance.elementId).popover({
          html : true, 
          trigger: 'manual',
          content: function() {
            return '<div id="popoverText" >' +
            '<div class="container-fluid" >' +
            '  <div class="row" style="min-width: 270px;">' +
            '    <div class="col-sm-2" style="background-color:transparent;" data-toggle="tooltip" data-placement="top" title="'+_instance.simplifiedTextHint+'"><img src="'+_instance.resourceURL+'/images/info.png" class=""></div>' +
            '    <div class="col-sm-3" style="background-color:transparent;">' +
            '        <label class="switch">' +
            '          <input id="textCheckbox" type="checkbox" onclick="toggleTextSimplifiction()" '+(_instance.globalTextCheckboxVal ? 'checked="true"':'')+'>' +
            '          <span class="slider sliderText round"></span>' +
            '        </label>' +
            '    </div>' +
            '    <div class="col-sm-7 " style="background-color:transparent;white-space:nowrap"><span >'+_instance.simplifedTextLabel+'</span></div>' +
            '  </div>' +
            '  <div class="row"  style="min-width: 270px;">' +
            '    <div class="col-sm-2" style="background-color:transparent;" data-toggle="tooltip" data-placement="top" title="'+_instance.definitionHint+'"><img src="'+_instance.resourceURL+'/images/info.png" class=""></div>' +
            '    <div class="col-sm-3" style="background-color:transparent;">' +
            '        <label class="switch">' +
            '          <input id="wordCheckbox" type="checkbox" onclick="toggleWordSimplifiction()" " '+(_instance.globalWordCheckboxVal ? 'checked="true"':'')+'>' +
            '          <span class="slider sliderWord round"></span>' +
            '        </label>' +
            '    </div>' +
            '    <div class="col-sm-7" style="background-color:transparent;white-space:nowrap;"><span >'+_instance.definitionLabel+'</span></div>' +
            '  </div>  ' +
            '</div>'
          },
          placement: 'top',
        });
        
        $('#'+_instance.elementId).popover('show');
        _instance.enabled = true;
      }
      
      /**
      * 
      *
      **/
      function getTextsAndsetSpan(instance){
          
        //var elements = document.getElementsByTagName("p");
        
        // var testelements2 = document.getElementById(instance.textContainerQuery).querySelectorAll('*');
        // console.log("all elements::",testelements2);

        var elements = document.getElementById(instance.textContainerQuery).querySelectorAll(instance.textQueryString);
        // console.log("elements::",elements);
        for(var i = 0; i < elements.length; i++) {
          var current = elements[i];
          var val = current.textContent.trim();
          if(current.textContent.trim().length !== 0 && current.textContent.replace(/ |\n/g,'') !== '') {
            instance.sentences.push(val);      
            // current.innerHTML="<span class='"+i+"' id='"+i+"'>"+val+"</span>";
            var index = instance.sentences.length-1;
            $(current).wrapInner("<span class='"+index+"' id='"+index+"'></span>");
          }
        } 
      }

      /**
      * call api for all sentances and get data
      *
      **/
      function getAPIResults(instance) {
        var deferred = new $.Deferred();
        var prepareResult=[];
        var textURL= instance.endpoint + "/simp";
        $.each(instance.sentences, function (index, value){
          jQuery.getJSON(textURL + "?text=" + value,
            function(jsonResponse) {
              var words=[];
              var syntSimplifiedVersion;
              if(String(jsonResponse.text) != String(jsonResponse.syntSimplifiedVersion)){
                syntSimplifiedVersion=jsonResponse.syntSimplifiedVersion;
              }else{
                syntSimplifiedVersion=null;
              }
              $.each(jsonResponse.simplifications, function(index2, value2){
                words.push({
                  "originalWord":value2.originalValue,
                  "start":value2.start,
                  "end":value2.end,
                  "synonyms":value2.simplification,
                  "definition":getDescription(value2.originalValue,jsonResponse.readability.forms),
                  "wikilink":getWikiLink(value2.originalValue,jsonResponse.linkings)
                });
              });
              prepareResult.push({
                "elementID":index,
                "originalText":jsonResponse.text,
                "syntSimplifiedVersion":syntSimplifiedVersion,
                "words":words
              });
            }).done(function() {
              if(index== instance.sentences.length-1) { 
                deferred.resolve(prepareResult); 
                }
            });
            
        });  
        return deferred.promise();
      }


      function getWikiLink(word, arr){
        for ( var i in arr )
        {
          if(arr[i].originalText == word){
            return arr[i].page;
          }
        }
        return null;
      }
      /**
      * 
      *
      **/
      function getDescription(word, arr){
        var result = null;
        $.each(arr, function( key, value ) {
          if(value.description.forms[0].search(new RegExp(word, 'i')) !== -1){
            result=value.description.description;
            return false;
          }
        });
        return result;
      }
      /**
      * 
      *
      **/
      _instance.clickTextCheckbox = function(){
        var textElementVal=document.getElementById("textCheckbox");
        if(_instance.globalTextCheckboxVal){
          _instance.globalTextCheckboxVal=false;
          $(textElementVal).attr("checked", _instance.globalTextCheckboxVal);
          onTextSimplification(_instance, false);
          console.log("TextCheckbox is unchecked.");
        }else{
          _instance.globalTextCheckboxVal=true;
          $(textElementVal).attr("checked", _instance.globalTextCheckboxVal);
          onTextSimplification(_instance, true);
          console.log("TextCheckbox is checked.");
        }
        _instance.loadFirstTimeText=false;
      }

      /**
      * 
      *
      **/
      _instance.clickWordCheckbox = function(){
        var wordElementVal=document.getElementById("wordCheckbox");
        if(_instance.globalWordCheckboxVal){
          _instance.globalWordCheckboxVal=false;
          $(wordElementVal).attr("checked", _instance.globalWordCheckboxVal);
          onWordSimplification(_instance, false);
          console.log("WordCheckbox is unchecked.");
        }else{
          _instance.globalWordCheckboxVal=true;
          $(wordElementVal).attr("checked", _instance.globalWordCheckboxVal);
          onWordSimplification(_instance, true);
          console.log("WordCheckbox is checked.");
        }
        _instance.loadFirstTime=false;
      }

      /**
      * 
      *
      **/
      function onTextSimplification(instance, color){
        
        $.each(instance.localPrepareResult, function (index, value){
          if(color == true){
            if(value['syntSimplifiedVersion']){
              makeColorOfText(value['elementID'],color);
              if(instance.loadFirstTimeText){
                $('.'+value['elementID']).append("<div id='popupText"+value['elementID']+"' class='popupText'><h4>"+instance.simplifedTextLabel+"</h4><p>"+value['syntSimplifiedVersion']+"</p></div>");
              }
              
              $('#popupText'+value['elementID']).popup({type: 'tooltip'});
              $('.'+value['elementID']).on({
                mouseenter: function(event) {
                  if(instance.globalTextCheckboxVal){
                    $('#popupText'+value['elementID']).popup({
                      tooltipanchor: event.target,
                      autoopen: true,
                      type: 'tooltip',
                      opacity:0.5,
                      background: true,
                      horizontal: 'leftedge',
                      vertical:'bottom'
                    });
                  }
                },
                mouseleave: function() {
                  if($('#popupText'+value['elementID']).is(':hover')){
                    $('#popupText'+value['elementID']).on({
                      mouseenter: function(event) {},
                      mouseleave: function() {$('#popupText'+value['elementID']).popup('hide');}
                    });
                  }else{$('#popupText'+value['elementID']).popup('hide');}
                }
              });
              // $('#'+value['elementID']).mouseover(function(){
              //   console.log("come in onmouseover");
              // });
            }
          }else if(color == false){
            makeColorOfText(value['elementID'],color);
          }
          
        });
        
      
      }

      /**
      * 
      *
      **/
      function onWordSimplification(instance, color){
        
        $.each(instance.localPrepareResult, function (index, value){
          if(color == true){
            if(value['words']){
              makeColorOfWord(instance, value['elementID'],color,value['words']);
              setPopupForWord(instance, value['elementID'],color,value['words']);        
            }
          }else if(color == false){
            makeColorOfWord(instance, value['elementID'],color,value['words']);
          }
          
        });
      }
      /**
      * 
      *
      **/ 
      function makeColorOfText(id,color){

        if(color == true){
          $('.'+id).css('background-color', '#FFFF99');
          console.log("make yellow color");
        }
        else if(color == false){
          $('.'+id).css('background-color', 'transparent');
          console.log("make white color");
        }  
      }
      /**
      * 
      *
      **/ 
      function makeColorOfWord(instance, id,color,arrWord){
        var replaceStrArray=[],previousStart,lastEnd = 0;
        var str = document.getElementById(id);
        var myString= str.innerHTML;
        $.each(arrWord, function (index, value){
          if(color== true){

            if(instance.loadFirstTime){
              // if(index==0){
              //   if(value['start']==0){
              //     replaceStrArray.push( "<span class='wordColor' id='"+id+"-"+index+"'>"+value['originalWord']+"</span>");
              //   }else{
              //     replaceStrArray.push( myString.substring(0,value['start'])+"<span class='wordColor' id='"+id+"-"+index+"'>"+value['originalWord']+"</span>");
              //   } 
              // }else{
              //   replaceStrArray.push( myString.substring(lastEnd,value['start'])+"<span class='wordColor' id='"+id+"-"+index+"'>"+value['originalWord']+"</span>");
              // }
              // lastEnd=value['end'];
              findAndReplaceDOMText(str, {
                // preset: 'prose',
                find: value['originalWord'],   //have one problem in last word if add space
                replace: function(portion, match) {
                  if(match.index == 0){
                    var el = document.createElement('span');
                    el.className="wordColor";
                    el.id=id+"-"+index;
                    el.innerHTML = portion.text;
                    // el.innerHTML = portion.text.substr(0, portion.text.length-1);
                    // el.id=id+"-"+match.index;
                    // el.innerHTML = match[0];
                    // console.log("portion::",portion,", match::",match, " id::",el.id);
                    return el;
                  }else{
                    return value['originalWord'];
                  }
                  
                },

              });
            }else if(instance.loadFirstTime == false){
              $( "#"+id+"-"+index ).addClass( "wordColor" );
            }
            
          }else if(color == false){
            $( "#"+id+"-"+index ).removeClass( "wordColor" );
          }
        });
        // if(instance.loadFirstTime){
        //   replaceStrArray.push( myString.substring(lastEnd,myString.length));
        //   str.innerHTML=replaceStrArray.join("");
        //   //console.log("replaceStrArray:",replaceStrArray.join(""));
        // }    
      }

      function setPopupForWord(instance, id,color,arrWord){
        $.each(arrWord, function (index, value){
          if(color== true){
            var definition='',synonyms='',wikilink='';
            if(value['definition']){
              definition="<h4>"+instance.definitionLabel+"</h4><p>"+value['definition']+"</p>";
            }if(value['synonyms']){
              synonyms="<h4>"+instance.synonimLabel+"</h4><p>"+value['synonyms']+"</p>";
            }if(value['wikilink']){
              wikilink="<h4>Wikipedia</h4><a href='"+value['wikilink']+"' target='_blank'>"+value['wikilink']+"</a>";
            }
            if(instance.loadFirstTime){
              $( "#"+id+"-"+index ).append("<div id='popupWord"+id+"-"+index+"' class='popupWord'>"+definition+synonyms+wikilink+"</div>");
            }
            $('#popupWord'+id+"-"+index).popup({type: 'tooltip'});
            $("#"+id+"-"+index ).on({
              mouseenter: function(event) {
                if(instance.globalWordCheckboxVal){
                  $('#popupText'+id).popup('hide');
                  $('#popupWord'+id+"-"+index).popup({
                    tooltipanchor: event.target,
                    autoopen: true,
                    type: 'tooltip',
                    opacity:0.5,
                    background: true,
                    horizontal: 'leftedge',
                    vertical:'bottom'
                  });
                  
                }
              },
              mouseleave: function() {
                if(instance.globalWordCheckboxVal){
                  $('#popupText'+id).popup({type: 'tooltip'});
                  // $('#popupWord'+id+"-"+index).popup('hide');
                  if($('#popupWord'+id+"-"+index).is(':hover')){
                    $('#popupWord'+id+"-"+index).on({
                      mouseenter: function(event) {},
                      mouseleave: function() {$('#popupWord'+id+"-"+index).popup('hide');}
                    });
                  }else{$('#popupWord'+id+"-"+index).popup('hide');}
                }
              }
            });
          }
        });
      }
    };
    return {
    	getInstance: function() {
    		if(!_instance) _instance = new Singleton();
    		return _instance;
    	}
    };
})();
