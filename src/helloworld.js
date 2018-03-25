'use strict';

const VERSION = '1.0';

function buildSpeechletResponse(card, output, repromptText, shouldEndSession) {

    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: card,
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {

    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

// ------------------- Mandatory Alexa Launch and Runtime Functions that control the skill's behavior --------------------------------------

function getWelcomeResponse(callback) {
    console.log("WELCOME INTENT TRIGGERED");
    const sessionAttributes = {};
    const cardTitle = 'Greetings from Etihad Assistant!';
    const speechOutput = '<speak>Greetings from Etihad Assistant. How can I help you?</speak>';
    const repromptText = '<speak>You can simply say help to know what to say.</speak>';
    //shouldEndSession = false indicates :ask mode where alexa waits for response.
    const shouldEndSession = false;
    //THIS BLOCK CONTAINS ALEXA SPEECH STRINGS TO TRIGGER WHEN 'LaunchRequest' is executed and called.
    callback(sessionAttributes,buildSpeechletResponse(null, speechOutput, repromptText, shouldEndSession));
    //Callback function sends back strings to the 'buildSpeechletResponse'
}

function handleSessionEndRequest(callback) {
    console.log("SESSION ENDED INTENT TRIGGERED");
    const sessionAttributes = {};
    const cardTitle = 'Session Ended';
    const speechOutput = '<speak>Happy to help you! See you later.</speak>';
    //shouldEndSession = false indicates :tell mode where alexa waits for response.
    const shouldEndSession = true;
    //THIS BLOCK CONTAINS ALEXA SPEECH STRINGS TO TRIGGER WHEN 'SessionEndedRequest' is executed and called.
    callback(sessionAttributes, buildSpeechletResponse(null, speechOutput, null, shouldEndSession));
    //Callback function sends back strings to the 'buildSpeechletResponse'
}

function saySatisfactory(intent, session, callback) {
    handleSessionEndRequest(callback);
    //SESSION END 'CancelIntent': SIMPLY CHANGE STRINGS. THIS IS FOR handleSessionEndRequest
}

// --------------------------------------- Functions that control the skill's behavior ---------------------------------------------------

function sayHelloWorld(intent, session, callback){
    console.log("HELLO WORLD INTENT TRIGGERED");
    const sessionAttributes = {};
    const cardTitle = 'Hello Intent Triggered!';
    const speechOutput = '<speak>This is the Welcome Message</speak>';
    const repromptText = '<speak>Are you there? Speak up.</speak>';
    const shouldEndSession = false;
    //':ask' mode
    callback(sessionAttributes,buildSpeechletResponse(null, speechOutput, repromptText, shouldEndSession));
    //buildSpeechletResponse sends to uppermost block for ssml response processing
    //callback sends it back
}

function saySecondary(intent, session, callback){
    console.log("TESTING SECONDARY INTENT TRIGGERED");
    console.log("Before Response");
    const sessionAttributes = {};
    const cardTitle = 'Secondary Intent Triggered!';
    const speechOutput = '<speak>Testing worked</speak>';
    const repromptText = '<speak>Are you there? Speak up.</speak>';
    const shouldEndSession = false;
    //':ask' mode
    callback(sessionAttributes,buildSpeechletResponse(null, speechOutput, repromptText, shouldEndSession));
    //buildSpeechletResponse sends to uppermost block for ssml response processing
    //callback sends it back
}

function sayIncidentCreation(intent, session, callback){
    console.log("Creation Incident INTENT TRIGGERED");
    console.log("Before Response : "+JSON.stringify(intent));
    var param = intent.slots.severity.value;
    const sessionAttributes = {};
    const cardTitle = 'Secondary Intent Triggered!';
    const speechOutput = `<speak>Testing worked. Parameter captured ${param}</speak>`;
    const repromptText = '<speak>Are you there? Speak up.</speak>';
    const shouldEndSession = false;
    //':ask' mode
    callback(sessionAttributes,buildSpeechletResponse(null, speechOutput, repromptText, shouldEndSession));
    //buildSpeechletResponse sends to uppermost block for ssml response processing
    //callback sends it back
}


// ---------------------------------------------- Events --------------------------------------------------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}


/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);
    console.log("Events : " + intentRequest);
    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    console.log("Intent : "+intent);
    console.log("Intent Name : "+intentName);
    //these variables save the current intent names

    // Dispatch to your skill's intent handlers
    if (intentName === 'HelloWorldIntent') {
        sayHelloWorld(intent, session, callback);
    }
    else if (intentName === 'SatisfactoryIntent') {
        saySatisfactory(intent, session, callback);
        console.log("After Response");
    }
    else if (intentName === 'SecondaryIntent') {
        saySecondary(intent, session, callback);
    }
    else if (intentName === 'CreateIncidentIntent') {
        sayIncidentCreation(intent, session, callback);
    }
    else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    }
    else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    }
    else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

//-------------------------------------------------------------------------------------------------------------------------------
module.exports = function(req, res, callback) {

    console.log(req.body);

    let event = req.body;

    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }

    } catch (err) {
        console.log("\n--------------------------------------------");
        console.log(err);
        console.log("\n--------------------------------------------\n");
        callback(err);
    }
};
