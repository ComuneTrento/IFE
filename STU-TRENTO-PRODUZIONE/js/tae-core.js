
var taeCORE = ( function () {
  var instance;
  function Singleton () {
    // Variables to store the used API and URL paths
    var simplifyTextURL = '';
    var language = '';

    // Structure to store the simplified words of each paragraph
    // It has the folloging format:/*
    //  {
    //    "paragraph1": {
    //      "w1": {
    //        "synonyms": ["s1", "s2"],
    //        "definition": "ladefinicion"
    //      },
    //      "w2": {
    //        "synonyms": ["s1", "s2"],
    //        "definition": "ladefinicion"
    //      }
    //    },
    //    "paragraph2": {
    //      "w1": {
    //        "synonyms": ["s1", "s2"],
    //        "definition": "ladefinicion"
    //      },
    //      "w2": {
    //        "synonyms": ["s1", "s2"],
    //        "definition": "ladefinicion"
    //      }
    //    }
    //  }
    var words = {};
    var definitionsKey = 'definition';
    var synonymsKey = 'synonyms';
    var wikiKey = 'wiki';

    //In inits the main used variables (e.g. The URLs used)
    function initComponent(parameters) {
      simplifyTextURL = parameters.endpoint + '/simp';
      language = parameters.language;
    }

    // Calls the TAE for the simplified text
    function getSimplifiedText(name, originalText, simplifyCallback) {
      // As we don't have a TAE working environment, we emulate the original 
      // text and the json response
      // When we have the TAE working we will change it
      document.getElementById('loading_'+name).style.display = "block";
      // TODO: UNCOMMENT [BEGIN]
     /*
      console.log(simplifyTextURL + '?' +
                            'text="' + originalText +
                            '"&lang="' + language +
                            '"');
      jQuery.getJSON(simplifyTextURL + '?' +
                            'text="' + originalText +
                            '"&lang="' + language +
                            '"',
        function(jsonResponse) {
          storeWords(name, jsonResponse);
          simplifyCallback(name, originalText, jsonResponse);
        }
      );//
      // TODO: UNCOMMENT [END]/
      */
      jQuery.getJSON(simplifyTextURL + "?text=" + originalText,
        function(jsonResponse) {
          console.log("TAE REsponse:");
          console.log(jsonResponse);
          if (jsonResponse && jsonResponse.simplifications) {
            for(var i = 0; i < jsonResponse.simplifications.length; i++) {
              if (jsonResponse.simplifications[i].simplification == "NULL") {
                jsonResponse.simplifications.splice(i,1);
                i--;
              }
            }
            console.log("TAE REsponse without NULL simplification values:");
            console.log(jsonResponse);
          }
          storeWords(name, jsonResponse);
          simplifyCallback(name, originalText, jsonResponse);
        }
      );//
      // TODO: UNCOMMENT [END]
    }

    // Given a jsonResponse, it stores/or updates new details of each 
    // simplification requested to the TAE server
    function storeWords(paragraphID, jsonResponse) {
      var wordsContainer = {};
      var newWord = {};
      var formsObject;
      for (var i = jsonResponse.simplifications.length -1; i >= 0; i--) {
        newWord[synonymsKey] = jsonResponse.simplifications[i].simplification;
        formsObject = jsonResponse.readability.forms[jsonResponse.simplifications[i].start.toString()];
        if (formsObject != null) {
          newWord[definitionsKey] = formsObject["description"].description;
        }
        wordsContainer[jsonResponse.simplifications[i].originalValue] = newWord;
        newWord = {}
      }
      for (var i = jsonResponse.linkings.length -1; i >= 0; i--) {
    	  newWord = wordsContainer[jsonResponse.linkings[i].originalText] || {};
          newWord[wikiKey] = jsonResponse.linkings[i].page;
          wordsContainer[jsonResponse.linkings[i].originalText] = newWord;
        }
      words[paragraphID] = wordsContainer;
    }

    // It returns the definition of the word passed as parameter caontained 
    // in the paragraph passed as parameter
    // - paragraphID: the id of the paragraph
    // - term: the word which is going to be defined
    function getTermDefinition(paragraphID, term) {
      return words[paragraphID][term][definitionsKey];
    }

    // It returns the synonyms of the word passed as parameter caontained 
    // in the paragraph passed as parameter
    // - paragraphID: the id of the paragraph
    // - term: the word which has synonyms 
    function getTermSynonyms(paragraphID, term) {
      return words[paragraphID][term][synonymsKey];
    }

    // It returns the wikipedia link of the word passed as parameter caontained 
    // in the paragraph passed as parameter
    // - paragraphID: the id of the paragraph
    // - term: the word which has synonyms 
    function getTermWikipedia(paragraphID, term) {
      return words[paragraphID][term][wikiKey];
    }
    
    return {
        init: initComponent,
        simplifyText: getSimplifiedText,
        termDefinition: getTermDefinition,
        termSynonyms: getTermSynonyms,
        termWikipedia: getTermWikipedia
      };
  }  
  return {
    getInstance: function() {
      if(!instance) instance = Singleton();
      return instance;
    }
  };
})();