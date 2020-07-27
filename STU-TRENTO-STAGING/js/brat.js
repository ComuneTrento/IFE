// Load Brat libraries
var bratLocation = 'https://storage.googleapis.com/corenlp/js/brat';
head.js(
    // External libraries
    bratLocation + '/client/lib/jquery.svg.min.js',
    bratLocation + '/client/lib/jquery.svgdom.min.js',

    // brat helper modules
    bratLocation + '/client/src/configuration.js',
    bratLocation + '/client/src/util.js',
    bratLocation + '/client/src/annotation_log.js',
    bratLocation + '/client/lib/webfont.js',

    // brat modules
    bratLocation + '/client/src/dispatcher.js',
    bratLocation + '/client/src/url_monitor.js',
    bratLocation + '/client/src/visualizer.js'
);

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

/**
 * Add the startsWith function to the String class
 */
if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

/**
 * A reverse map of PTB tokens to their original gloss
 */
var tokensMap = {
    '=LRB=': '(',
    '=RRB=': ')',
    '=LSB=': '[',
    '=RSB=': ']',
    '=LCB=': '{',
    '=RCB=': '}',
    '``': '"',
    '\'\'': '"',
};

/**
 * A mapping from part of speech tag to the associated
 * visualization color
 */
function posColor(posTag) {
    if (posTag.startsWith('R')) {
        return '#A4BCED';
    } else if (posTag.startsWith('V') || posTag.startsWith('M')) {
        return '#ADF6A2';
    } else if (posTag.startsWith('A')) {
        return '#CCDAF6';
    } else if (posTag.startsWith('E')) {
        return '#FFE8BE';
    } else if (posTag.startsWith('N') || posTag.startsWith('W')) {
        return '#FFFDA8';
    } else if (posTag.startsWith('D') || posTag == 'CD') {
        return '#CCADF6';
    } else if (posTag.startsWith('J')) {
        return '#FFFDA8';
    } else if (posTag.startsWith('T')) {
        return '#FFE8BE';
    } else if (posTag.startsWith('CC') || posTag.startsWith('S')) {
        return '#E4CBF6';
    } else if (posTag.startsWith('I')) {
        return '#FFFFFF';
    } else if (posTag == 'LS' || posTag == 'FW') {
        return '#FFFFFF';
    } else {
        return '#E3E3E3';
    }
}

/**
 * A mapping from named entity tag to the associated
 * visualization color
 */
function nerColor(nerTag) {
    if (nerTag == 'PER') {
        return '#FFCCAA'
    } else if (nerTag == 'ORG') {
        return '#8FB2FF'
    } else if (nerTag == 'MISC') {
        return '#F1F447'
    } else if (nerTag == 'LOC') {
        return '#95DFFF'
    } else if (nerTag == 'DATE' || nerTag == 'TIME' || nerTag == 'SET') {
        return '#9AFFE6'
    } else if (nerTag == 'MONEY') {
        return '#FFFFFF'
    } else if (nerTag == 'PERCENT') {
        return '#FFA22B'
    } else {
        return '#E3E3E3'
    }
}


/**
 * A mapping from sentiment value to the associated
 * visualization color
 */
function sentimentColor(sentiment) {
    if (sentiment == "VERY POSITIVE") {
        return '#00FF00';
    } else if (sentiment == "POSITIVE") {
        return '#7FFF00';
    } else if (sentiment == "NEUTRAL") {
        return '#FFFF00';
    } else if (sentiment == "NEGATIVE") {
        return '#FF7F00';
    } else if (sentiment == "VERY NEGATIVE") {
        return '#FF0000';
    } else {
        return '#E3E3E3';
    }
}


/**
 * Get a list of annotators, from the annotator option input.
 */
function annotators() {
    return "tokenize, ssplit, ml, pos, ita_morpho, ita_lemma, ner, depparse";
}

// ----------------------------------------------------------------------------
// RENDER
// ----------------------------------------------------------------------------

/**
 * Render a given JSON data structure
 */
function render(data) {

    // Error checks
    if (typeof data.sentences == 'undefined') { return; }

    /**
     * Register an entity type (a tag) for Brat
     */
    var entityTypesSet = {};
    var entityTypes = [];
    function addEntityType(name, type) {
        // Don't add duplicates
        if (entityTypesSet[type]) return;
        entityTypesSet[type] = true;
        // Get the color of the entity type
        color = '#ffccaa';
        if (name == 'POS') {
            color = posColor(type);
        } else if (name == 'NER') {
            color = nerColor(type);
        } else if (name == 'COREF') {
            color = '#FFE000';
        } else if (name == 'ENTITY') {
            color = posColor('NN');
        } else if (name == 'RELATION') {
            color = posColor('VB');
        } else if (name == 'LEMMA') {
            color = '#FFFFFF';
        } else if (name == 'SENTIMENT') {
            color = sentimentColor(type);
        } else if (name == 'LINK') {
            color = '#FFFFFF';
        } else if (name == 'KBP_ENTITY') {
            color = '#FFFFFF';
        }
        // Register the type
        entityTypes.push({
            type: type,
            labels : [type],
            bgColor: color,
            borderColor: 'darken'
        });
    }

    /**
     * Register a relation type (an arc) for Brat
     */
    var relationTypesSet = {};
    var relationTypes = [];
    function addRelationType(type, symmetricEdge) {
        // Prevent adding duplicates
        if (relationTypesSet[type]) return;
        relationTypesSet[type] = true;
        // Default arguments
        if (typeof symmetricEdge == 'undefined') { symmetricEdge = false; }
        // Add the type
        relationTypes.push({
            type: type,
            labels: [type],
            dashArray: (symmetricEdge ? '3,3' : undefined),
            arrowHead: (symmetricEdge ? 'none' : undefined),
        });
    }

    //
    // Construct text of annotation
    //
    currentText = [];  // GLOBAL
    currentSentences = data.sentences;  // GLOBAL
    data.sentences.forEach(function(sentence) {
        for (var i = 0; i < sentence.tokens.length; ++i) {
            var token = sentence.tokens[i];
            var word = token.word;
            if (!(typeof tokensMap[word] == "undefined")) {
                word = tokensMap[word];
            }
            if (i > 0) { currentText.push(' '); }
            token.characterOffsetBegin = currentText.length;
            for (var j = 0; j < word.length; ++j) {
                currentText.push(word[j]);
            }
            token.characterOffsetEnd = currentText.length;
        }
        currentText.push('\n');
    });
    currentText = currentText.join('');

    //
    // Shared variables
    // These are what we'll render in BRAT
    //
    // (pos)
    var posEntities = [];
    // (lemma)
    var lemmaEntities = [];
    // (ner)
    var nerEntities = [];
    // (sentiment)
    var sentimentEntities = [];
    // (entitylinking)
    var linkEntities = [];
    // (dependencies)
    var depsRelations = [];
    var deps2Relations = [];
    // (openie)
    var openieEntities = [];
    var openieEntitiesSet = {};
    var openieRelations = [];
    var openieRelationsSet = {};
    // (kbp)
    var kbpEntities = [];
    var kbpEntitiesSet = [];
    var kbpRelations = [];
    var kbpRelationsSet = [];


    //
    // Loop over sentences.
    // This fills in the variables above.
    //
    for (var sentI = 0; sentI < data.sentences.length; ++sentI) {
        var sentence = data.sentences[sentI];
        var index = sentence.index;
        var tokens = sentence.tokens;
        var deps = sentence['basic-dependencies'];
        var deps2 = sentence['enhanced-plus-plus-dependencies'];

        // POS tags
        /**
         * Generate a POS tagged token id
         */
        function posID(i) {
            return 'POS_' + sentI + '_' + i;
        }
        if (tokens.length > 0 && typeof tokens[0].pos != 'undefined') {
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                var pos = token.pos;
                var begin = parseInt(token.characterOffsetBegin);
                var end = parseInt(token.characterOffsetEnd);
                addEntityType('POS', pos);
                posEntities.push([posID(i), pos, [[begin, end]]]);
            }
        }

        // Dependency parsing
        /**
         * Process a dependency tree from JSON to Brat relations
         */
        function processDeps(name, deps) {
            var relations = [];
            // Format: [${ID}, ${TYPE}, [[${ARGNAME}, ${TARGET}], [${ARGNAME}, ${TARGET}]]]
            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                var governor = dep.governor - 1;
                var dependent = dep.dependent - 1;
                if (governor == -1) continue;
                addRelationType(dep.dep);
                relations.push([name + '_' + sentI + '_' + i, dep.dep, [['governor', posID(governor)], ['dependent', posID(dependent)]]]);
            }
            return relations;
        }
        // Actually add the dependencies
        if (typeof deps != 'undefined') {
            depsRelations = depsRelations.concat(processDeps('dep', deps));
        }
        if (typeof deps2 != 'undefined') {
            deps2Relations = deps2Relations.concat(processDeps('dep2', deps2));
        }

        // Lemmas
        if (tokens.length > 0 && typeof tokens[0].lemma != 'undefined') {
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                var lemma = token.lemma;
                var begin = parseInt(token.characterOffsetBegin);
                var end = parseInt(token.characterOffsetEnd);
                addEntityType('LEMMA', lemma);
                lemmaEntities.push(['LEMMA_' + sentI + '_' + i, lemma, [[begin, end]]]);
            }
        }

        // NER tags
        // Assumption: contiguous occurrence of one non-O is a single entity
        if (tokens.length > 0 && typeof tokens[0].ner != 'undefined') {
            for (var i = 0; i < tokens.length; i++) {
                var ner = tokens[i].ner;
                if (ner == 'O') continue;
                var j = i;
                while (j < tokens.length - 1 && tokens[j+1].ner == ner) j++;
                addEntityType('NER', ner);
                nerEntities.push(['NER_' + sentI + '_' + i, ner, [[tokens[i].characterOffsetBegin, tokens[j].characterOffsetEnd]]]);
                i = j;
            }
        }

        // Sentiment
        if (typeof sentence.sentiment != "undefined") {
            var sentiment = sentence.sentiment.toUpperCase().replace("VERY", "VERY ");
            addEntityType('SENTIMENT', sentiment);
            sentimentEntities.push(['SENTIMENT_' + sentI, sentiment,
                [[tokens[0].characterOffsetBegin, tokens[tokens.length - 1].characterOffsetEnd]]]);
        }

        // Entity Links
        // Carries the same assumption as NER
        if (tokens.length > 0) {
            for (var i = 0; i < tokens.length; i++) {
                var link = tokens[i].entitylink;
                if (link == 'O' || typeof link == 'undefined') continue;
                var j = i;
                while (j < tokens.length - 1 && tokens[j+1].entitylink == link) j++;
                addEntityType('LINK', link);
                linkEntities.push(['LINK_' + sentI + '_' + i, link, [[tokens[i].characterOffsetBegin, tokens[j].characterOffsetEnd]]]);
                i = j;
            }
        }

        // Open IE
        // Helper Functions
        function openieID(span) {
            return 'OPENIEENTITY' + '_' + sentI + '_' + span[0] + '_' + span[1];
        }
        function addEntity(span, role) {
            // Don't add duplicate entities
            if (openieEntitiesSet[[sentI, span, role]]) return;
            openieEntitiesSet[[sentI, span, role]] = true;
            // Add the entity
            openieEntities.push([openieID(span), role,
                [[tokens[span[0]].characterOffsetBegin,
                    tokens[span[1] - 1].characterOffsetEnd ]] ]);
        }
        function addRelation(gov, dep, role) {
            // Don't add duplicate relations
            if (openieRelationsSet[[sentI, gov, dep, role]]) return;
            openieRelationsSet[[sentI, gov, dep, role]] = true;
            // Add the relation
            openieRelations.push(['OPENIESUBJREL_' + sentI + '_' + gov[0] + '_' + gov[1] + '_' + dep[0] + '_' + dep[1],
                role,
                [['governor',  openieID(gov)],
                    ['dependent', openieID(dep)]  ] ]);
        }
        // Render OpenIE
        if (typeof sentence.openie != 'undefined') {
            // Register the entities + relations we'll need
            addEntityType('ENTITY',  'Entity');
            addEntityType('RELATION', 'Relation');
            addRelationType('subject');
            addRelationType('object');
            // Loop over triples
            for (var i = 0; i < sentence.openie.length; ++i) {
                var subjectSpan = sentence.openie[i].subjectSpan;
                var relationSpan = sentence.openie[i].relationSpan;
                var objectSpan = sentence.openie[i].objectSpan;
                if (parseInt(relationSpan[0]) < 0  || parseInt(relationSpan[1]) < 0) {
                    continue;  // This is a phantom relation
                }
                var begin = parseInt(token.characterOffsetBegin);
                // Add the entities
                addEntity(subjectSpan, 'Entity');
                addEntity(relationSpan, 'Relation');
                addEntity(objectSpan, 'Entity');
                // Add the relations
                addRelation(relationSpan, subjectSpan, 'subject');
                addRelation(relationSpan, objectSpan, 'object');
            }
        }  // End OpenIE block


        //
        // KBP
        //
        // Helper Functions
        function kbpEntity(span) {
            return 'KBPENTITY' + '_' + sentI + '_' + span[0] + '_' + span[1];
        }
        function addKBPEntity(span, role) {
            // Don't add duplicate entities
            if (kbpEntitiesSet[[sentI, span, role]]) return;
            kbpEntitiesSet[[sentI, span, role]] = true;
            // Add the entity
            kbpEntities.push([kbpEntity(span), role,
                [[tokens[span[0]].characterOffsetBegin,
                    tokens[span[1] - 1].characterOffsetEnd ]] ]);
        }
        function addKBPRelation(gov, dep, role) {
            // Don't add duplicate relations
            if (kbpRelationsSet[[sentI, gov, dep, role]]) return;
            kbpRelationsSet[[sentI, gov, dep, role]] = true;
            // Add the relation
            kbpRelations.push(['KBPRELATION_' + sentI + '_' + gov[0] + '_' + gov[1] + '_' + dep[0] + '_' + dep[1],
                role,
                [['governor',  kbpEntity(gov)],
                    ['dependent', kbpEntity(dep)]  ] ]);
        }
        if (typeof sentence.kbp != 'undefined') {
            // Register the entities + relations we'll need
            addRelationType('subject');
            addRelationType('object');
            // Loop over triples
            for (var i = 0; i < sentence.kbp.length; ++i) {
                var subjectSpan = sentence.kbp[i].subjectSpan;
                var subjectLink = 'Entity';
                for (var k = subjectSpan[0]; k < subjectSpan[1]; ++k) {
                    if (subjectLink == 'Entity' &&
                        typeof tokens[k] != 'undefined' &&
                        tokens[k].entitylink != 'O' &&
                        typeof tokens[k].entitylink != 'undefined') {
                        subjectLink = tokens[k].entitylink
                    }
                }
                addEntityType('KBP_ENTITY',  subjectLink);
                var objectSpan = sentence.kbp[i].objectSpan;
                var objectLink = 'Entity';
                for (var k = objectSpan[0]; k < objectSpan[1]; ++k) {
                    if (objectLink == 'Entity' &&
                        typeof tokens[k] != 'undefined' &&
                        tokens[k].entitylink != 'O' &&
                        typeof tokens[k].entitylink != 'undefined') {
                        objectLink = tokens[k].entitylink
                    }
                }
                addEntityType('KBP_ENTITY',  objectLink);
                var relation = sentence.kbp[i].relation;
                var begin = parseInt(token.characterOffsetBegin);
                // Add the entities
                addKBPEntity(subjectSpan, subjectLink);
                addKBPEntity(objectSpan, objectLink);
                // Add the relations
                addKBPRelation(subjectSpan, objectSpan, relation);
            }
        }  // End KBP block

    }  // End sentence loop

    //
    // Coreference
    //
    var corefEntities = [];
    var corefRelations = [];
    if (typeof data.corefs != 'undefined') {
        addRelationType('coref', true);
        addEntityType('COREF', 'Mention');
        var clusters = Object.keys(data.corefs);
        clusters.forEach( function (clusterId) {
            var chain = data.corefs[clusterId];
            if (chain.length > 1) {
                for (var i = 0; i < chain.length; ++i) {
                    var mention = chain[i];
                    var id = 'COREF' + mention.id;
                    var tokens = data.sentences[mention.sentNum - 1].tokens;
                    corefEntities.push([id, 'Mention',
                        [[tokens[mention.startIndex - 1].characterOffsetBegin,
                            tokens[mention.endIndex - 2].characterOffsetEnd      ]] ]);
                    if (i > 0) {
                        var lastId = 'COREF' + chain[i - 1].id;
                        corefRelations.push(['COREF' + chain[i-1].id + '_' + chain[i].id,
                            'coref',
                            [['governor', lastId],
                                ['dependent', id]    ] ]);
                    }
                }
            }
        });
    }  // End coreference block

    //
    // Actually render the elements
    //

    /**
     * Helper function to render a given set of entities / relations
     * to a Div, if it exists.
     */
    function embed(container, entities, relations) {
        if ($('#' + container).length > 0) {
            Util.embed(container,
                {entity_types: entityTypes, relation_types: relationTypes},
                {text: currentText, entities: entities, relations: relations}
            );
        }
    }

    // Render each annotation
    head.ready(function() {
        embed('pos', posEntities);
        embed('lemma', lemmaEntities);
        embed('ner', nerEntities);
        embed('entities', linkEntities);
        embed('deps', posEntities, depsRelations);
        embed('deps2', posEntities, deps2Relations);
        embed('coref', corefEntities, corefRelations);
        embed('openie', openieEntities, openieRelations);
        embed('kbp',    kbpEntities, kbpRelations);
        embed('sentiment', sentimentEntities);
    });

}  // End render function
