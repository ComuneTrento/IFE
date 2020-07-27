google.charts.load('current', {'packages': ['corechart', 'gauge', 'bar']});

var skipLT = ["ST_02_001", "ER_01_001", "ER_01_002", "ER_01_003", "ER_01_004"];

var gaugeOptions = {
    redFrom: 0,
    redTo: 40,
    yellowFrom: 40,
    yellowTo: 80,
    greenFrom: 80,
    greenTo: 100,
    minorTicks: 5,
    width: 130,
    height: 130
};
var gaugeLevelsOptions = {
    redFrom: 0,
    redTo: 40,
    yellowFrom: 40,
    yellowTo: 80,
    greenFrom: 80,
    greenTo: 100,
    minorTicks: 5,
    width: 360,
    height: 120
};
var posChartOptions = {
    width: 500,
    height: 300,
    orientation: "vertical",
    legend: {
        position: 'none'
    }
};

var language;

function changeView() {
    var lang = $("#simp-select").val();
    $(".simp-ff").css("display", "none");
    $("#simp-" + lang).css("display", "block");
    return false;
}

function escapeAttrNodeValue(value) {
    return value.replace(/(&)|(")|(\u00A0)/g, function (match, amp, quote) {
        if (amp) return "&amp;";
        if (quote) return "&quot;";
        return "&nbsp;";
    });
}

function addLI(ul, title, value) {
    var li = $("<li></li>");
    li.addClass("list-group-item");
    var span = $("<span></span>");
    span.addClass("badge");
    span.append(value);
    li.append(span);
    li.append(" " + title);
    // var b = $("<b></b>");
    // b.append(title);
    // li.append(b);
    // li.append(" " + value);
    ul.append(li);
}

function newInput(name, checked) {
    var input = $("<input>");
    input.attr("type", "checkbox");
    input.addClass("js-switch");
    if (checked) {
        input.attr("checked", "checked");
    }
    input.attr("name", name);
    input.attr("id", "switch-" + name);
    return input;
}

function updateSyntSimpText(i, lang) {
    var c = $("#switch-" + i + "-main").prop("checked");
    var orig = $("#origsentence" + i);
    var synt = $("#syntsentence" + i);
    var spinner = $("#spinner-" + i);

    if (c) {
        if (lang === "it") {
            var comp = $("#switch-" + i + "-comp").prop("checked");

            orig.hide();
            synt.show();
        }
        else {
            var comp = $("#switch-" + i + "-comp").prop("checked");
            var conf = $("#switch-" + i + "-conf").prop("checked");

            var data = {
                text: orig.html(),
                comp: comp ? "true" : "false",
                conf: conf ? "true" : "false",
                lang: language
            };

            spinner.show();

            $.ajax("../syntsimp", {
                dataType: "json",
                method: "POST",
                data: data,
                success: function (data) {
                    synt.removeClass();
                    spinner.hide();
                    if (data.isSyntSimplified) {
                        synt.addClass("synt-simp-sent");
                    }
                    synt.html(data.syntSimplifiedVersion);

                    orig.hide();
                    synt.show();
                }
            });
        }
    }
    else {
        orig.show();
        synt.hide();
    }
}

$(function () {
    $('#select_examples').change(function () {
        $('#text').val($('#select_examples').val());
    });

    $('button.has-spinner').click(function () {

        var text = $('#text').val();
        // if (text.length < 10) {
        //     alert("You must enter at least 10 chars of text");
        //     return false;
        // }

        $(this).toggleClass('active');
        $(this).toggleClass('disabled');
        $('#text').attr('disabled', 'disabled');

        $.ajax("../simpform", {
        // $.ajax("http://dh-server.fbk.eu:19003/simp-engines/tae/simpform", {
            dataType: "json",
            method: "POST",
            data: {
                text: text
            },
            success: function (data) {

                $("#part1").slideUp(500);

                // language = data.readability.language;
                // $(".show-" + language).show();
                // Show language

                // var tooLongSentences = data.readability.tooLongSentences;
                // var textLen = text.length;

                // var allText = data.text;

                // var simpText = allText;
                var okSimp = {};

                if (data.simplifications != undefined) {

                    data.simplifications.forEach(function (element) {
                        okSimp[element.start] = element;
                    });
                }

                $.each(data.sentences, function (i, item) {
                    var p = $("<div></div>");

                    // var text = item.text;
                    // var text = "Prova";
                    // var beginSentence = item.characterOffsetBegin;
                    // var endSentence = item.characterOffsetEnd;

                    // var offsets = new Array();
                    // for (var j = 0; j < text.length; j++) {
                    //     offsets[i] = j;
                    // }

                    var contentWords = 0;
                    var easyWords = 0;
                    var levels = [];
                    for (var j = 0; j < 3; j++) {
                        levels[j] = 0;
                    }
                    var simpText = item.text;

                    $.each(item.tokens.reverse(), function (j, token) {

                        var start = token.characterOffsetBegin - item.characterOffsetBegin;
                        var end = token.characterOffsetEnd - item.characterOffsetBegin;

                        var before = "";
                        var after = "";
                        if (token.contentWord && token.difficultyLevel >= 4 && token.word != "anche" /* bad! */) {
                            if (token.simplifiedVersion !== undefined) {
                                before = '<a data-content="' + token.simplifiedVersion.replace('"', "'") +
                                    '" tabindex="0" role="button" class="my-popover label label-default syn-word">';
                                after = '</a>';
                            }
                            else {
                                before = '<span tabindex="0" class="label label-default difficult-word">';
                                after = '</span>';
                            }
                        }

                        var newText = simpText.substring(0, start);
                        newText += before;
                        newText += simpText.substring(start, end);
                        newText += after;
                        newText += simpText.substring(end);

                        simpText = newText;

                        if (!token.contentWord) {
                            return;
                        }
                        contentWords++;

                        if (token.easyWord) {
                            easyWords++;
                        }

                        // minus 1
                        if (token.difficultyLevel == 1) {
                            levels[0]++;
                            levels[1]++;
                            levels[2]++;
                        }
                        if (token.difficultyLevel == 2) {
                            levels[1]++;
                            levels[2]++;
                        }
                        if (token.difficultyLevel == 3) {
                            levels[2]++;
                        }
                    });

                    var values = [];
                    var tooltips = [];

                    var v, c, l, t;

                    v = item.literalWords;
                    l = "Lunghezza";
                    if (item.literalWords > 25) {
                        c = "danger";
                        t = "La frase è troppo lunga, è consigliabile spezzarla";
                    }
                    else {
                        c = "success";
                        t = "La lunghezza della frase è adeguata";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = 100.0 * levels[0] / easyWords;
                    l = "Livello 1";
                    if (v < gaugeLevelsOptions.yellowFrom) {
                        c = "danger";
                        t = "Il vocabolario di base della lingua italiana è quasi assente da questo periodo";
                    }
                    else if (v > gaugeLevelsOptions.yellowTo) {
                        c = "success";
                        t = "Il lessico di questo periodo è estremamente semplice";
                    }
                    else {
                        c = "warning";
                        t = "Il lessico di questo periodo contiene molte parole del vocabolario di base";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = 100.0 * levels[1] / contentWords;
                    l = "Livello 2";
                    if (v < gaugeLevelsOptions.yellowFrom) {
                        c = "danger";
                        t = "Il vocabolario di alta frequenza della lingua italiana è quasi assente da questo periodo, si consiglia di semplificare alcune parole";
                    }
                    else if (v > gaugeLevelsOptions.yellowTo) {
                        c = "success";
                        t = "Il lessico di questo periodo è piuttosto semplice";
                    }
                    else {
                        c = "warning";
                        t = "Il lessico di questo periodo contiene molte parole del vocabolario di alta frequenza";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = 100.0 * levels[2] / contentWords;
                    l = "Livello 3";
                    if (v < gaugeLevelsOptions.yellowFrom) {
                        c = "danger";
                        t = "In questo periodo le parole sono tutte molto complicate, si consiglia di semplificarle";
                    }
                    else if (v > gaugeLevelsOptions.yellowTo) {
                        c = "success";
                        t = "Il lessico di questo periodo contiene prevalentemente parole tra le cinquemila più frequenti della lingua italiana";
                    }
                    else {
                        c = "warning";
                        t = "Il lessico di questo periodo contiene molte parole tra le cinquemila più frequenti della lingua italiana";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = item.verbs.length;
                    l = "Frasi";
                    if (v < data.readability.minYellowValues.propositionsAvg) {
                        c = "success";
                        t = "Il periodo contiene poche frasi, quindi risulta di ottima comprensione";
                    }
                    else if (v > data.readability.maxYellowValues.propositionsAvg) {
                        c = "danger";
                        t = "Il periodo contiene troppe frasi, si consiglia di spezzarlo";
                    }
                    else {
                        c = "warning";
                        t = "Il periodo contiene parecchie frasi, quindi potrebbe risultare di difficile comprensione";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = 1.0 * item.contentWords / item.literalWords;
                    l = "Densità lessicale";
                    if (v < data.readability.minYellowValues.density) {
                        c = "success";
                        t = "Il rapporto tra parole portatrici di significato e parole funzionali è adeguato";
                    }
                    else if (v > data.readability.maxYellowValues.density) {
                        c = "danger";
                        t = "Il rapporto tra parole portatrici di significato e parole funzionali è sbilanciato, si consiglia di diminuire l'uso di nomi/verbi/aggettivi/avverbi";
                    }
                    else {
                        c = "warning";
                        t = "Il rapporto tra parole portatrici di significato e parole funzionali è adeguato";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = 1.0 * item.literalWords / item.verbs.length;
                    l = "Parole per frase";
                    if (v < data.readability.minYellowValues.wordsAvg) {
                        c = "success";
                        t = "Il numero di parole per frase è adeguato";
                    }
                    else if (v > data.readability.maxYellowValues.wordsAvg) {
                        c = "danger";
                        t = "Il numero di parole per frase è troppo alto, si consiglia di togliere termini non necessari o a spezzare il periodo";
                    }
                    else {
                        c = "warning";
                        t = "Il numero di parole per frase è abbastanza elevato, provare a togliere termini non necessari";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    v = item.depth;
                    l = "Profondità sintattica";
                    if (v < data.readability.minYellowValues.deepAvg) {
                        c = "success";
                        t = "La profondità dell'albero sintattico è adeguata";
                    }
                    else if (v > data.readability.maxYellowValues.deepAvg) {
                        c = "danger";
                        t = "La profondità dell'albero sintattico è troppo alta, si consiglia di spezzare la frase e semplificarne la struttura";
                    }
                    else {
                        c = "warning";
                        t = "La profondità dell'albero sintattico è un po' alta, potrebbe essere utile spezzare la frase e semplificarne la struttura";
                    }
                    values.push({l: l, v: v, c: c, t: t});

                    var row = $("<div></div>");
                    row.addClass("row");
                    row.addClass("row-sentence");
                    var ids = 0;
                    values.forEach(function (value) {
                        var inside = $("<div></div>");
                        inside.addClass("col-md-3");
                        var v = Math.round(value.v * 100) / 100;
                        var c = value.c;
                        if (isNaN(v)) {
                            v = 100;
                            c = "success";
                        }
                        inside.append(value.l + ': <span class="label label-' + c + '">' + v + '</span>');
                        var thisId = "row-sentence-" + i + "-" + ++ids;
                        inside.attr("id", thisId);
                        tooltips.push({id: "#" + thisId, text: value.t});
                        row.append(inside);
                    });

                    p.append(simpText);
                    p.append(row);
                    p.attr("id", "sentence" + i);
                    p.addClass("sentence");
                    // if ($.inArray(item.index, tooLongSentences) > -1) {
                    //     p.addClass("too-long")
                    // }
                    $("#text-original-content").append(p);

                    tooltips.forEach(function (value) {
                        $(value.id).tooltip({title: value.text});
                    })
                    $(".difficult-word").tooltip({title: "Questa parola è difficile, ma il sistema non è riuscito a trovare un sinonimo semplice"});
                });

                $("#part2").popover({
                    selector: ".my-popover",
                    trigger: "focus"
                });

                // Gauges

                var mainValue = data.readability.measures.main;
                var mainName = data.readability.labels.main;
                // if (language == "it") {
                //     mainValue = data.readability.measures.gulpease;
                //     mainName = "Gulpease";
                // }
                // if (language == "en") {
                //     mainValue = data.readability.measures.flesch;
                //     mainName = "Flesch";
                // }
                // if (language == "es") {
                //     mainValue = data.readability.measures['flesch-szigriszt'];
                //     mainName = "Flesch-Szigriszt";
                // }
                var level1 = (isNaN(data.readability.measures.level1) ? 0 : data.readability.measures.level1);
                var level2 = (isNaN(data.readability.measures.level2) ? 0 : data.readability.measures.level2);
                var level3 = (isNaN(data.readability.measures.level3) ? 0 : data.readability.measures.level3);

                var gulpeaseChart = new google.visualization.Gauge(document.getElementById('gauge-slot-gulpease'));
                gulpeaseChart.draw(google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    [mainName, mainValue]
                ]), gaugeOptions);
                var level1Chart = new google.visualization.Gauge(document.getElementById('gauge-slot-1'));
                level1Chart.draw(google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['Level1', level1]
                ]), gaugeLevelsOptions);
                var level2Chart = new google.visualization.Gauge(document.getElementById('gauge-slot-2'));
                level2Chart.draw(google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['Level2', level2]
                ]), gaugeLevelsOptions);
                var level3Chart = new google.visualization.Gauge(document.getElementById('gauge-slot-3'));
                level3Chart.draw(google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['Level3', level3]
                ]), gaugeLevelsOptions);

                var t = "", c = "";
                var v;
                var div;

                v = mainValue;
                if (v < gaugeLevelsOptions.yellowFrom) {
                    c = "danger";
                    t = "La sintassi di questo testo è molto complessa (comprensibile da un utente che abbia una scolarizzazione pari o superiore al diploma), si consiglia di semplificarla";
                }
                else if (v > gaugeLevelsOptions.yellowTo) {
                    c = "success";
                    t = "La sintassi di questo testo è molto semplice, adatta anche a un utente con licenza elementare";
                }
                else {
                    c = "warning";
                    t = "La sintassi di questo testo è piuttosto semplice, comprensibile da un utente con licenza media o superiore";
                }
                div = $("<div></div>");
                div.addClass("alert");
                div.addClass("alert-" + c);
                div.append(t);
                $("#gauge-gulpease .gauge-description").append(div);

                v = level1;
                if (v < gaugeLevelsOptions.yellowFrom) {
                    c = "danger";
                    t = "Il vocabolario di base della lingua italiana è quasi assente da questo testo";
                }
                else if (v > gaugeLevelsOptions.yellowTo) {
                    c = "success";
                    t = "Il lessico di questo testo è estremamente semplice";
                }
                else {
                    c = "warning";
                    t = "Il lessico di questo testo contiene molte parole del vocabolario di base";
                }
                div = $("<div></div>");
                div.addClass("alert");
                div.addClass("alert-" + c);
                div.append(t);
                $("#gauge-level1 .gauge-description").append(div);

                v = level2;
                if (v < gaugeLevelsOptions.yellowFrom) {
                    c = "danger";
                    t = "Il vocabolario di alta frequenza della lingua italiana è praticamente assente da questo testo, si consiglia di semplificare alcuni termini";
                }
                else if (v > gaugeLevelsOptions.yellowTo) {
                    c = "success";
                    t = "Il lessico di questo testo è piuttosto semplice";
                }
                else {
                    c = "warning";
                    t = "Il lessico di questo testo contiene molte parole del vocabolario di alta frequenza";
                }
                div = $("<div></div>");
                div.addClass("alert");
                div.addClass("alert-" + c);
                div.append(t);
                $("#gauge-level2 .gauge-description").append(div);

                v = level3;
                if (v < gaugeLevelsOptions.yellowFrom) {
                    c = "danger";
                    t = "In questo testo le parole sono tutte molto complicate, si consiglia di semplificarle";
                }
                else if (v > gaugeLevelsOptions.yellowTo) {
                    c = "success";
                    t = "Il lessico di questo testo contiene prevalentemente parole tra le 5mila più frequenti della lingua italiana";
                }
                else {
                    c = "warning";
                    t = "Il lessico di questo testo contiene molte parole tra le 5mila più frequenti della lingua italiana";
                }
                div = $("<div></div>");
                div.addClass("alert");
                div.addClass("alert-" + c);
                div.append(t);
                $("#gauge-level3 .gauge-description").append(div);

                $.each(data.readability.minYellowValues, function (key, value) {
                    var name = key;

                    // if (v < data.readability.minYellowValues.propositionsAvg) {
                    //     c = "success";
                    //     t = "Il periodo contiene poche frasi, quindi risulta di ottima comprensione";
                    // }
                    // else if (v > data.readability.maxYellowValues.propositionsAvg) {
                    //     c = "danger";
                    //     t = "Il periodo contiene troppe frasi, si consiglia di spezzarlo";
                    // }
                    // else {
                    //     c = "warning";
                    //     t = "Il periodo contiene parecchie frasi, quindi potrebbe risultare di difficile comprensione";
                    // }

                    var myValue = data.readability[name];
                    var v = myValue;

                    var description = "";
                    switch (name) {
                        case "propositionsAvg":
                            description = "Numero medio di frasi per ciascun periodo";
                            if (v < data.readability.minYellowValues.propositionsAvg) {
                                c = "success";
                                t = "Il numero di frasi per periodo è adeguato";
                            }
                            else if (v > data.readability.maxYellowValues.propositionsAvg) {
                                c = "danger";
                                t = "Ci sono molte frasi per ciascun periodo, si consiglia di spezzarne qualcuno";
                            }
                            else {
                                c = "warning";
                                t = "Il numero medio di frasi per periodo è piuttosto alto, quindi potrebbe risultare di difficile comprensione";
                            }
                            break;
                        case "subordinateRatio":
                            description = "Rapporto tra proposizioni subordinate e coordinate";
                            if (v < data.readability.minYellowValues.subordinateRatio) {
                                c = "success";
                                t = "Il rapporto subordinate/coordinate è adeguato";
                            }
                            else if (v > data.readability.maxYellowValues.subordinateRatio) {
                                c = "danger";
                                t = "Ci sono troppe proposizioni subordinate, si consiglia di rimuoverne alcune, magari spezzando qualche periodo";
                            }
                            else {
                                c = "warning";
                                t = "Il rapporto subordinate/coordinate è adeguato, anche se è consigliabile toglierne alcune per rendere il testo più leggibile";
                            }
                            break;
                        case "ttrValue":
                            description = "Ricchezza semantica";
                            if (v < data.readability.minYellowValues.ttrValue) {
                                c = "success";
                                t = "Il testo contiene poca variabilità semantica, quindi risulta comprensibile";
                            }
                            else if (v > data.readability.maxYellowValues.ttrValue) {
                                c = "danger";
                                t = "Il testo è semanticamente troppo ricco, si consiglia di usare termini meno variegati";
                            }
                            else {
                                c = "warning";
                                t = "Il testo è piuttosto vario semanticamente, può risultare di difficile comprensione";
                            }
                            break;
                        case "density":
                            description = "Densità lessicale";
                            if (v < data.readability.minYellowValues.density) {
                                c = "success";
                                t = "Il rapporto tra parole portatrici di significato e parole funzionali è adeguato";
                            }
                            else if (v > data.readability.maxYellowValues.density) {
                                c = "danger";
                                t = "Il rapporto tra parole portatrici di significato e parole funzionali è sbilanciato, si consiglia di aumentare l'uso di nomi/verbi/aggettivi/avverbi";
                            }
                            else {
                                c = "warning";
                                t = "Il rapporto tra parole portatrici di significato e parole funzionali è adeguato";
                            }
                            break;
                        case "wordsAvg":
                            description = "Numero di parole per frase";
                            if (v < data.readability.minYellowValues.wordsAvg) {
                                c = "success";
                                t = "Il numero di parole per frase è adeguato";
                            }
                            else if (v > data.readability.maxYellowValues.wordsAvg) {
                                c = "danger";
                                t = "Il numero di parole per frase è troppo alto, si consiglia di togliere termini non necessari o a spezzare i periodi più lunghi";
                            }
                            else {
                                c = "warning";
                                t = "Il numero di parole per frase è abbastanza elevato, provare a togliere termini non necessari";
                            }
                            break;
                        case "deepAvg":
                            description = "Profondità media dell'albero sintattico";
                            if (v < data.readability.minYellowValues.deepAvg) {
                                c = "success";
                                t = "La profondità media dell'albero sintattico è adeguata";
                            }
                            else if (v > data.readability.maxYellowValues.deepAvg) {
                                c = "danger";
                                t = "La profondità media dell'albero sintattico è troppo alta, si consiglia di spezzare la frase e semplificarne la struttura";
                            }
                            else {
                                c = "warning";
                                t = "La profondità media dell'albero sintattico è un po' alta, potrebbe essere utile spezzare la frase e semplificarne la struttura";
                            }
                            break;
                    }

                    var divName = key + "-gauge";
                    var row = $("<div></div>");
                    row.addClass("row");
                    row.append("<div class='col-md-3' id='" + divName + "'>");
                    row.append("<div class='col-md-9' id='" + divName + "-desc'><p class='title'></p><p class='suggestion'></p></div>");

                    $("#difficulty-values-panel .panel-body").append(row);
                    $("#difficulty-values-panel .panel-body #" + divName + "-desc .title").append(description);
                    $("#difficulty-values-panel .panel-body #" + divName + "-desc .suggestion").append(t);
                    $("#difficulty-values-panel .panel-body #" + divName + "-desc .suggestion").addClass("alert");
                    $("#difficulty-values-panel .panel-body #" + divName + "-desc .suggestion").addClass("alert-" + c);

                    var myChart = new google.visualization.Gauge(document.getElementById(divName));
                    var min = data.readability.minValues[name];
                    var max = data.readability.maxValues[name];
                    var tick = (max - min) / 20.0;

                    var minor = data.readability.minYellowValues[name];
                    var maior = data.readability.maxYellowValues[name];

                    // var ratio = 100.0 / max;
                    //
                    // min *= ratio;
                    // max *= ratio;
                    // minor *= ratio;
                    // maior *= ratio;
                    // tick *= ratio;
                    // myValue *= ratio;

                    var greenFrom = min;
                    var greenTo = minor;
                    var yellowFrom = minor;
                    var yellowTo = maior;
                    var redFrom = maior;
                    var redTo = max;
                    if (maior < minor) {
                        redFrom = min;
                        redTo = maior;
                        yellowFrom = maior;
                        yellowTo = minor;
                        greenFrom = minor;
                        greenTo = max;
                    }

                    myGaugeOptions = {
                        redFrom: redFrom,
                        redTo: redTo,
                        yellowFrom: yellowFrom,
                        yellowTo: yellowTo,
                        greenFrom: greenFrom,
                        greenTo: greenTo,
                        minorTicks: tick,
                        min: min,
                        max: max,
                        width: 120,
                        height: 120
                    };

                    // console.log(key);
                    // console.log(myGaugeOptions);
                    // console.log(name);
                    // console.log(myValue);
                    // console.log(myGaugeOptions);

                    myChart.draw(google.visualization.arrayToDataTable([
                        ['Label', 'Value'],
                        [name, myValue]
                    ]), myGaugeOptions);

                });

                // Statistics

                var ul = $('<ul></ul>');
                ul.addClass("list-group");
                // addLI(ul, "Language:", data.readability.language);
                addLI(ul, "Periodi:", data.readability.sentenceCount);
                // addLI(ul, "Tokens:", data.readability.tokenCount);
                addLI(ul, "Parole:", data.readability.wordCount);
                addLI(ul, "Parole che danno contenuto al testo:", data.readability.contentWordSize);
                $("#statistics").append(ul);

                $("#part2").show();

                // Load switchery
                var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                elems.forEach(function (html) {
                    var switchery = new Switchery(html, {size: "small"});
                });

                // $("#ttrValue-gauge").tooltip({
                //     title: "Type-token ratio: a percentage of new types for every n tokens"
                // });
                // $("#subordinateRatio-gauge").tooltip({
                //     title: "Ratio between subordinate and coordinate clauses"
                // });
                // $("#wordsAvg-gauge").tooltip({
                //     title: "Average number of tokens for each clause"
                // });
                // $("#propositionsAvg-gauge").tooltip({
                //     title: "Average number of clauses for each sentence"
                // });
                // $("#density-gauge").tooltip({
                //     title: "Percentage of content words in the text"
                // });
                // $("#deepAvg-gauge").tooltip({
                //     title: "Average depth of the dependency parse tree"
                // });
            }
        });

        return false;
    })
    ;
})
;