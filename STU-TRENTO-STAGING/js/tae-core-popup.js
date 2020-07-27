
/**
 * TEXT ADAPTATION AND SIMPLIFICATION SERVICE
 */
var taeEngine = (function() {
    var instance;

    function Singleton() {}

    Singleton.prototype.endpoint = "/tae";
    Singleton.prototype.lang = "it";
    /**
     * Inititates the TAE Engine
     * @param {any} config - configuration of the TAE Engine.
     */
    Singleton.prototype.init = function initSingleton(config) {
        config = config || {};
        if (config.endpoint) {
            this.endpoint = config.endpoint;
        }

        if (config.lang) {
            this.lang = config.lang;
        }
    }

    /**
     * RETRIEVE DEFINITIONS-ANNOTATED TEXT GIVEN NORMAL TEXT
     */
    Singleton.prototype.getDefinitions = function getDefinitions(data, callback, errorCallback) {
        var value = data.text.replace(/[\t\r\n]/g, ' ');
        var word = data.word;
        var position = !!word ? value.indexOf(data.word) : -1;
        var url = this.endpoint + "/simp?lang=" + this.lang + "&text=" + value;
        if (word != null) {
            url += "&word=" + data.word;
            url += "&position=" + position;
        }
        $.getJSON(url)
            .done(function(json) {
                var index = 0;
                var annotatedText = "";
                if (word == null) {
                    for (var itemName in json.readability.forms) {
                        var item = json.readability.forms[itemName];
                        annotatedText = annotatedText + value.substring(index, item.start - 1);
                        var originalText = value.substring(item.start, item.end);
                        annotatedText = annotatedText +
                            ' <a class="simpatico-label simpatico-label-def" title="' + item.description.description +
                            '">' + originalText + '</a> ';
                        index = item.end;
                    }
                    annotatedText = annotatedText + value.substring(index, value.length);
                    //console.log('annotatedText ' + annotatedText);
                    callback(annotatedText, json.isSyntSimplified);
                } else {
                    for (itemName in json.readability.forms) {
                        item = json.readability.forms[itemName];
                        if (item.start == position) {
                            var text = ' <a class="simpatico-label simpatico-label-def" title="' + item.description.description +
                                '">' + word + '</a> ';
                            callback(text, json.isSyntSimplified);
                            return;
                        }
                    }
                    callback(word);
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(textStatus + ", " + error);
                errorCallback("Error Communicating with the server.");
            });
    }
    /**
     * RETRIEVE SIMPLIFICATION-ANNOTATED TEXT GIVEN NORMAL TEXT
     */
    Singleton.prototype.getExplanations = function getExplanations(data, callback, errorCallback) {
        var value = data.text.replace(/[\t\r\n]/g, ' ');
        var url = this.endpoint + "/simp?lang=" + this.lang + "&text=" + value;
        if (data.word != null) {
            url += "&word=" + data.word;
            url += "&position=" + value.indexOf(data.word);
        }
        $.getJSON(url)
            .done(function(json) {
                //console.log(JSON.stringify(baconGoodness));
                var index = 0;
                var annotatedText = "";
                if (json.simplifications) {
                    if (data.word == null) {
                        for (var item = 0; item < json.simplifications.length; item++) {
                            var originalText = value.substring(json.simplifications[item].start, json.simplifications[item].end);
                            annotatedText = annotatedText + value.substring(index, json.simplifications[item].start - 1);
                            annotatedText = annotatedText + ' <a class="simpatico-label simpatico-label-simp" title="' + json.simplifications[item].simplification +
                                '">' + originalText + '</a> '
                            index = json.simplifications[item].end;
                        }
                        annotatedText = annotatedText + value.substring(index, value.length);
                        callback(annotatedText, json.isSyntSimplified);
                    } else {
                        for (var item = 0; item < json.simplifications.length; item++) {
                            if (json.simplifications[item].start == value.indexOf(data.word)) {
                                callback(' <a class="simpatico-label simpatico-label-simp" title="' + json.simplifications[item].simplification +
                                    '">' + data.word + '</a> ');
                                return;
                            }
                        }
                        callback(data.word, json.isSyntSimplified);
                    }
                } else {
                    callback(data.word != null ? data.word : data.text, json.isSyntSimplified);
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(textStatus + ", " + error);
                errorCallback("Error Communicating with the server.");
            });
    }

    /**
     * RETRIEVE WIKIPEDIA TEXT GIVEN NORMAL TEXT
     */

    Singleton.prototype.wikipedia = function getFromWikipedia(data, callback, errorCallback) {
        var value = data.text.replace(/[\t\r\n]/g, ' ');
        var url = this.endpoint + "/simp?lang=" + this.lang + "&text=" + value;
        if (data.word != null) {
            url += "&word=" + data.word;
            url += "&position=" + value.indexOf(data.word);
        }
        $.getJSON(url)
            .done(function(json) {
                if (data.word == null) {
                    var index = 0;
                    var annotatedText = "";
                    json.linkings.sort(this.compareLinkItem);
                    var actualOffset = -1;
                    var actualLinkItem = null;

                    for (var itemName = 0; itemName < json.linkings.length; itemName++) {
                        var item = json.linkings[itemName];
                        if (actualOffset == -1) {
                            actualOffset = item.offset;
                        }
                        if (item.offset > actualOffset) {
                            annotatedText = annotatedText + value.substring(index, actualLinkItem.offset - 1);
                            var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
                            annotatedText = annotatedText +
                                ' <a class="simpatico-label simpatico-label-wiki" target="_blank" href="' + actualLinkItem.page +
                                '">' + originalText + '</a> ';
                            index = actualLinkItem.offset + actualLinkItem.length;
                            actualLinkItem = item;
                            actualOffset = item.offset;
                        } else {
                            actualLinkItem = item;
                        }
                    }
                    if (actualLinkItem != null) {
                        annotatedText = annotatedText + value.substring(index, actualLinkItem.offset - 1);
                        var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
                        annotatedText = annotatedText +
                            ' <a class="simpatico-label simpatico-label-wiki" target="_blank" href="' + actualLinkItem.page +
                            '">' + originalText + '</a> ';
                        index = actualLinkItem.offset + actualLinkItem.length;
                    }
                    annotatedText = annotatedText + value.substring(index, value.length);
                    //console.log('annotatedText ' + annotatedText);
                    callback(annotatedText, json.isSyntSimplified);
                } else {
                    for (var itemName = 0; itemName < json.linkings.length; itemName++) {
                        var item = json.linkings[itemName];
                        if (item.offset == value.indexOf(data.word)) {
                            callback(' <a class="simpatico-label simpatico-label-wiki" target="_blank" href="' + item.page +
                                '">' + data.word + '</a> ');
                            return;
                        }
                    }
                    callback(data.word, json.isSyntSimplified);
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(textStatus + ", " + error);
                errorCallback("Error Communicating with the server.");
            });
    }

    /**
     * RETRIEVE SYNTACTICALLY SIMPLIFIED TEXT GIVEN NORMAL TEXT
     */

    Singleton.prototype.getSimplifiedText = function getSimplifiedText(data, callback, errorCallback) {
        var value = data.text.replace(/[\t\r\n]/g, ' ');
        var url = this.endpoint + "/simp?lang=" + this.lang + "&text=" + value;
        $.getJSON(url)
            .done(function(json) {
                if (json.isSyntSimplified) {
                    callback(json.syntSimplifiedVersion, true);
                } else {
                    callback(null, false);
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(textStatus + ", " + error);
                errorCallback("Error Communicating with the server.");
            });
    }

    Singleton.prototype.compareLinkItem = function compareLinkItem(a, b) {
        if (a.offset < b.offset) {
            return -1;
        } else if (a.offset > b.offset) {
            return 1;
        } else {
            if (a.score < b.score) {
                return -1;
            }
            if (a.score > b.score) {
                return 1;
            }
            return 0;
        }
    }


    return {
        _instance: null,
        getInstance: function() {
            if (!this._instance) this._instance = new Singleton();
            return this._instance;
        }
    };
})();