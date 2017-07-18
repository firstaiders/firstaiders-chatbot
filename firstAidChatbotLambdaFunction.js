'use strict';

var https = require('https');
var queryString = require('querystring');

//Declared Variables:
var executedIntentArr = [];
var nextIntentToExecuteArr = [];
var lastExecutedArr = [];
var repeatedErrorIntent = [];
var repeatedMessages = "";
var numOfWrongResponse = [];

var count1 = "mmm";
var count2 = "nnn";

//List of intent names
var arrIntentNames = ["StartGame", "CorrectPath", "MovePersonIntent", "CheckResponseIntent", "CheckAirwayIntent", "ClearAirwayIntent", "CheckBreathingIntent", "StartCprIntent", "NoResponseIntent", "RepeatQuestion"];

var arrMsgSkipped = ["Starting the game", "selecting the path","Moving the casualty out of the sun", "Checking for Response", "Checking Airways", "Clearing Airways", "Checking for breathing", "Starting Cpr"];

var arrMsgActions = ["Start game", "Correct path", "Move casualty", "Check person's response", "Checked for airway", "Clear Airways", "Chech for breathing", "Start Cpr"];

var msg1 = "You have already ";
var msgB = "You have already done this ";

var msg2 = "Can you think of another way to save your friend? Like: ";
//var arrMsgSuggestion =["Check for response.", "Move him or her into a shade or check for response.", "Check airways to ensure his or her airway is not blocked.", "Check for response or Clear the airway if it is blocked.", "Clear airways if its blocked.", "Check Airways and Response.", "Starting CPR.", "Clear the airways or start CRP.", "You have already started cpr, please keep doing cpr until help arrives.", "Your responses were not adquate to save your friend. Your friend has died."];
var arrMsgSuggestion =["Move him or her into a shade.", "Check for response.", "Check airways to ensure his or her airway is not blocked.", "Clear the airway if it is blocked.", "Check for breathing.","Starting CPR.", "You have already started cpr, please keep doing cpr until help arrives.", "Your responses were not adquate to save your friend. Your friend has died."];


//Messages:
var skillintro = "Australia has the lowest percentage of first aiders in the world. "+
                 "Our goal is to bring greater first aid awareness to everyone by highlighting the correct sequence of steps to performing First Aid. "+
                 "We offer an interactive role playing experience where the decisions, yoomake , affect whether a person lives, or dies.";

var tutorial = "Ok, Imagine, that you and your friend are out bushwalking. "+
               "You come to a fork in the road. "+
               "You can take the left path, or, the right path.  "+
               "Note, I can only understand one answer at a time.  "+
               "What do you want to do? ";

var education = "D for dangers, R for response, S for send for help, A for airway, B for breathing, C for CPR and D for deefib, if you haveone. An easy way to remember this, is Doctors, A. B. C. D. To try again, say ALEXA, OPEN FIRST AID CHATBOT. Thanks for playing. Goodbye!";


var intro = "You continue down the path. Good choice. "+
            "It is very sunny, and hot. "+
            "Suddenly, your friend passes out. "+
            "There is no help around, and they are lying in the hot sun. "+
            "You can see shade nearby, and it looks safe. What would you like to do?";

var wronganswer = "I don't quite understand, can you try saying one thing at a time?";

var movecasualty = "You remove the danger by moving your friend into the shade. "+
                   "well done! You take out your phone and call for help. Help is on its way. "+
                   "But your friend is still on the ground, and not moving. "+
                   "What would you like to do? ";

var donotmovetoshade = "If you leave them there, they will most likely d hydrate, and could die. "+
                 "Before doing first aid, it's important to try and check for any other dangers, both for the casualty, and yourself. "+
                       "What do you want to do? ";

var checkforresponse = "You ask your friend, CAN YOU HEAR ME?? "+
                 "OPEN YOUR EYES IF YOU CAN HEAR ME!! "+
                       "SQUEEZE MY HAND IF YOU CAN HEAR ME!! Good work checking for a response! "+
                       "But your friend does not respond. You remember they were chewing gum earlier, and you're not sure if they were still chewing when they passed out. "+
                       "What do you think you should do next? ";

var dontcheckforresponse = "If you don't check for a response, it will be hard to figure out how to help."+
                     " What do you want to do?";

var checkairway = "You check your friend's airway. Good thinking! "+
                  "OH NOO! There seems to be food blocking it! "+
                  "What should you do? ";

var dontcheckairway = "If you do not check the airway, anything else you do, might not be helpful, because it could be blocked. "+
                      "What do you want to do?";

var clearairway = "You roll your friend to their left side and remove the food. Phew! "+
          "Now their airway is clear but you're not sure that they're breathing. "+
          "What would you like to do?";

var dontclearairway = "If you don't clear the airway, your friend could stop breathing."+
                      " What do you want to do?";

var checkforbreathing = "You look to see if their chest is rising up and down, and put your hand in front of their mouth, to feel for air movemant. "+
                "They are not breathing. "+
                        "Hurry! your friend may not have much time. What should you do?";

var dontcheckforbreathing = "If you don't check for breathing, it'll be hard to decide whether or not, to do cpr. "+
                            "What do you want to do? ";

var startcpr = "You start CPR compressions and save their life, your friend survives! great job. "+
               "Congratulations! your calm, quick thinking, really saved the day! Sounds like you know some first aid. For next time, to make it easier for you, remember this order: "+ education;

var dontstartcpr = "You freak out, because your friend is not breathing. "+
           "If you do not do CPR, NOW, your friend will most likely die! "+
           "What do you want to do?";

var frienddies = "OH NOOO!, your friend did not survive. "+
         "Do you want to try again? ";

var donnotStartGameMsg = "Seriously?! Ok, no problem. See you again soon.";

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        console.log("Event is :"+ event.session.application.applicationId);
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        var myID = "amzn1.ask.skill.e376db35-46c9-4983-b497-6d53b61a2908";
        if (event.session.application.applicationId !== myID) {
             context.fail("Invalid Application ID");
         }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};


/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);
    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {

    executedIntentArr.length = 0;
    lastExecutedArr.length = 0;
    nextIntentToExecuteArr.length = 0;
    // If we wanted to initialize the session to have some attributes we could add those here.
    nextIntentToExecuteArr.push("StartGame");


    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = skillintro;
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Would you like to start the game?";
    var shouldEndSession = false;

    callback(sessionAttributes,buildSpeechletResponse(cardTitle, speechOutput + "\n" + repromptText, repromptText, shouldEndSession));

}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +", sessionId=" + session.sessionId);
    var nextIntArr = [];
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
    var startGameOptions = ["start game", "start the game", "play game", "play", "Yes", "Yep", "OK", "Yeah", "absolutely", "Sure", "you bet","definitely", "yes please","yes" ];
    var exitGameOptions = ["end game", "stop game", "stop", "exit game", "exit","exit", "no", "end"];
    var pathOptions = ["left","right"];

    if(arrIntentNames.indexOf(intentName) > -1){
        //Intent 2
        if("StartGame" === intentName){
          var startGameValueSlot = intentRequest.intent.slots.startOptions.value;
          if(checkNext(intentName)){
              if(startGameOptions.indexOf(startGameValueSlot) > -1){
                if(excutedIntentList(intentName)){
                      handleStartGameRequest(intent, session, callback);
                  }
                else
                  {
                      repeatedMessages = msg1 + "started the game.";
                      repeatedFunction(intent, session, callback);
                  }
                }
                else{
                    if(exitGameOptions.indexOf(startGameValueSlot) > -1){
                        handleEndGameRequest(intent, session, callback);
                    }
                    else{
                        askUserToStartGame(intent, session, callback);
                     }
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                  if(startGameOptions.indexOf(startGameValueSlot) < 1){
                    handleEndGameRequest(intent, session, callback);
                  }
                  else{
                    repeatedMessages = msg1 + "started the game.";
                    repeatedFunction(intent, session, callback);
                  }
                }
                else{
                  skippedTasksHandler(intent, session, callback);
                }
            }
        }

        //Intent 2
        if("CorrectPath" === intentName){
          var pathValueSlot = intentRequest.intent.slots.selectPathOptions.value;
            if(checkNext(intentName)){
              if(pathOptions.indexOf(pathValueSlot) > -1){
                if(excutedIntentList(intentName)){
                      handlePathRequest(intent, session, callback);
                  }
                else
                  {
                      repeatedMessages = msg1 + "selected the path.";
                      repeatedFunction(intent, session, callback);
                  }
                }
                else{
                    handleSelectPathRequest(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + "selected the path.";
                    repeatedFunction(intent, session, callback);
                }
                else{
                  skippedTasksHandler(intent, session, callback);
                }
            }
        }

        //Intent 2
        if("MovePersonIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleMovePersonRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = msg1 + arrMsgActions[2] + msg2 + arrMsgSuggestion[1];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + arrMsgActions[2] + msg2 + arrMsgSuggestion[1];
                    repeatedFunction(intent, session, callback);
                }
                else{
                  skippedTasksHandler(intent, session, callback);
                }
            }
        }

        //Intent 3
        if("CheckResponseIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleCheckResponseRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = msg1 + arrMsgActions[3] + msg2 + arrMsgSuggestion[2];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + arrMsgActions[3] + msg2 + arrMsgSuggestion[2];
                    repeatedFunction(intent, session, callback);
                }
                else{
                    skippedTasksHandler(intent, session, callback);
                }
            }
        }

        // Intent 4
        if("CheckAirwayIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleCheckAirwayRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = msg1 + arrMsgActions[4] + msg2 + arrMsgSuggestion[3];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + arrMsgActions[4] + msg2 + arrMsgSuggestion[3];
                    repeatedFunction(intent, session, callback);
                }
                else{
                    skippedTasksHandler(intent, session, callback);
                }
            }
        }

        // Intent 5
        if("ClearAirwayIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleClearAirwayRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = msg1 + arrMsgActions[5] + msg2 + arrMsgSuggestion[4];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + arrMsgActions[5] + msg2 + arrMsgSuggestion[4];
                    repeatedFunction(intent, session, callback);
                }
                else{
                    skippedTasksHandler(intent, session, callback);
                }
            }
        }

        //Intent 6
        if("CheckBreathingIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleBreathingRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = msg1 + arrMsgActions[6] + msg2 + arrMsgSuggestion[5];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = msg1 + arrMsgActions[6] + msg2 + arrMsgSuggestion[5];
                    repeatedFunction(intent, session, callback);
                }
                else{
                   skippedTasksHandler(intent, session, callback);
                }
                skippedTasksHandler(intent, session, callback);
            }
        }

        //Intent 7
        if("StartCprIntent" === intentName){
            if(checkNext(intentName)){
                if(excutedIntentList(intentName)){
                    handleStartCprRequest(intent, session, callback);
                }
                else{
                    repeatedMessages = arrMsgSuggestion[7];
                    repeatedFunction(intent, session, callback);
                }
            }
            else{
                if(aleadyExecuted(intentName)){
                    repeatedMessages = arrMsgSuggestion[7];
                    repeatedFunction(intent, session, callback);
                }
                else{
                    skippedTasksHandler(intent, session, callback);
                }
            }
        }
        if("NoResponseIntent" === intentName){
            console.log("numOfWrongResponse.length: " + numOfWrongResponse.length);
            if(numOfWrongResponse.length === 1 ){
                handleFailedToCompleteRequest(intent, session, callback);
            }
            else
            {
              if(lastExecutedArr.length > 0){
                  if(lastExecutedArr.indexOf(arrIntentNames[0]) > -1){
                    accumWrong(intentName);
                    handleStartGameWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[1]) > -1){
                    accumWrong(intentName);
                    handlePathWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[2]) > -1){
                    accumWrong(intentName);
                    handleMovePersonWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[3]) > -1){
                    accumWrong(intentName);
                    handleCheckResponseWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[4]) > -1){
                    accumWrong(intentName);
                    handleCheckAirwayWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[5]) > -1){
                    accumWrong(intentName);
                    handleClearAirwayWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[6]) > -1){
                    accumWrong(intentName);
                    handleBreathingWrongRequest(intent, session, callback);
                  }
                  if(lastExecutedArr.indexOf(arrIntentNames[7]) > -1){
                    accumWrong(intentName);
                    handleStartCprWrongRequest(intent, session, callback);
                  }
              }
              else{
                  handleStartGameWrongRequest(intent, session, callback);
              }
            }
        }
        
        if("RepeatQuestion" === intentName){
            if(lastExecutedArr.length > 0){
                if(lastExecutedArr.indexOf(arrIntentNames[0]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleStartGameWrongRequest(intent, session, callback);
                    }
                    else{
                        handleStartGameRequest(intent, session, callback);
                    }
                    
                }
                if(lastExecutedArr.indexOf(arrIntentNames[1]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handlePathWrongRequest(intent, session, callback);
                    }
                    else{
                        handlePathRequest(intent, session, callback);
                    }
                    
                }
                if(lastExecutedArr.indexOf(arrIntentNames[2]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleMovePersonWrongRequest(intent, session, callback);
                    }else{
                       handleMovePersonRequest(intent, session, callback); 
                    }
                    
                }
                if(lastExecutedArr.indexOf(arrIntentNames[3]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleCheckResponseWrongRequest(intent, session, callback);
                    }else{
                        handleCheckResponseRequest(intent, session, callback);
                    }
                    handleCheckResponseRequest(intent, session, callback);
                }
                if(lastExecutedArr.indexOf(arrIntentNames[4]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleCheckAirwayWrongRequest(intent, session, callback);
                    }else{
                       handleCheckAirwayRequest(intent, session, callback); 
                    }
                    
                }
                if(lastExecutedArr.indexOf(arrIntentNames[5]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleClearAirwayWrongRequest(intent, session, callback);
                    }
                    else{
                       handleClearAirwayRequest(intent, session, callback); 
                    }
                    
                }
                if(lastExecutedArr.indexOf(arrIntentNames[6]) > -1){
                    if(numOfWrongResponse.length > 0){
                        handleBreathingWrongRequest(intent, session, callback);
                    }else{
                        handleBreathingRequest(intent, session, callback);
                    }
                }
            }
        }
    }
    else{
        handleInvalidRequest(intent, session, callback);
    }
}

function isEmpty(value){
  return (value === null || value.length === 0);
}


function accumWrong(intentName) {
    if(numOfWrongResponse.length < 1){
        numOfWrongResponse.push(count1);
    }
    else{
        numOfWrongResponse.push(count2);
    }
  console.log("Count is : " + numOfWrongResponse.length);
}

function aleadyExecuted(intentName) {
  if(executedIntentArr.indexOf(intentName) > -1)
    {
        numOfWrongResponse.length = 0;
        return true;
    }
    else
    {
        return false;
    }
}

function excutedIntentList(intentName) {
  if(executedIntentArr.indexOf(intentName) > -1)
    {
        return false;
    }
    else
    {
        executedIntentArr.push(intentName);
        addIntentToSequence(intentName);
        return true;
    }
}


function checkNext(intentName) {
  if(nextIntentToExecuteArr.indexOf(intentName) > -1)
    {
      numOfWrongResponse.length = 0;
        return true;
    }
    else
    {
        return false;
    }
}

function validateSequence(intentName) {
    var v1 = arrIntentNames.indexOf(intentName);
    var v2 = executedIntentArr.indexOf(intentName);
    if((v1 - v2 == 1) || (v1 - v2 == -1)){
        return true;
    }
    else{
        return false;
    }
}

function addIntentToSequence(intentName) {
    console.log("Next  :"+ nextIntentToExecuteArr.length +":"+ nextIntentToExecuteArr + " Last " + lastExecutedArr.length+":"+lastExecutedArr);

    if(nextIntentToExecuteArr.length > 0){
        nextIntentToExecuteArr.length = 0;
    }
    if(lastExecutedArr.length > 0){
        lastExecutedArr.length = 0;
    }

    if("StartGame" === intentName){
       nextIntentToExecuteArr.push("CorrectPath");
       lastExecutedArr.push("StartGame");
    }
    //Intent 1
   if("CorrectPath" === intentName){
       nextIntentToExecuteArr.push("MovePersonIntent");
       lastExecutedArr.push("CorrectPath");
    }

    //Intent 2
   if("MovePersonIntent" === intentName){
       nextIntentToExecuteArr.push("CheckResponseIntent");
       lastExecutedArr.push("MovePersonIntent");
    }
    //Intent 2
    if("CheckResponseIntent" === intentName){
        nextIntentToExecuteArr.push("CheckAirwayIntent");
        lastExecutedArr.push("CheckResponseIntent");
    }

    // Intent 3
    if("CheckAirwayIntent" === intentName){
        nextIntentToExecuteArr.push("ClearAirwayIntent");
        lastExecutedArr.push("CheckAirwayIntent");
    }

    // Intent 3
    if("ClearAirwayIntent" === intentName){
        nextIntentToExecuteArr.push("CheckBreathingIntent");
        lastExecutedArr.push("ClearAirwayIntent");
    }

    //Intent 4
    if("CheckBreathingIntent" === intentName){
        nextIntentToExecuteArr.push("StartCprIntent");
        lastExecutedArr.push("CheckBreathingIntent");
    }
    //Intent 5
    if("StartCprIntent" === intentName){
    }
}

/*
List of dunction response to all methods/Intents
*/

function repeatedFunction(intent, session, callback) {
    callback(session.attributes,buildSpeechletResponseWithoutCard(repeatedMessages,"", "false"));

}

function skippedTasksHandler(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("It seems you have skipped some tasks before " + arrMsgSkipped[arrIntentNames.indexOf(intent.name)]+ ". What do you want to do?", "", "false"));
}
function handleFailedToCompleteRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Oh no, sorry, your friend did not survive! For next time, remember this order:" +education, "", "true"));
}

function handleEndGameRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(donnotStartGameMsg, "", "true"));
}


function askUserToStartGame(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Please say play or start game to start", "", "false"));
}

function handleInvalidRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Sorry, I do not understand you, please repeat. ", "", "false"));
}

function handleSelectPathRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Please choose LEFT or RIGHT.", "", "false"));
}


//Start Game
function handleStartGameRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(tutorial, "", "false"));
}
//Intent 1 - Correct Path
function handlePathRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(intro, "", "false"));
}
//Intent 2 - Move person to shade
function handleMovePersonRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(movecasualty, "", "false"));
}
//Intent 3 - Check Response
function handleCheckResponseRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(checkforresponse, "", "false"));
}
//Intent 4 - checkairway
function handleCheckAirwayRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(checkairway, "", "false"));
}

//Intent 5 - clearairway
function handleClearAirwayRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(clearairway, "", "false"));
}

function handleCheckAirwayWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontclearairway, "", "false"));
}

//Intent 6 - checkbreathing
function handleBreathingRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(checkforbreathing, "", "false"));
}
//Intent 7 - startcpr
function handleStartCprRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(startcpr, "", "false"));
}

// Wrong responses
// Wrong responses
// Wrong responses
function handleStartGameWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(wronganswer, "", "false"));

}
function handlePathWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(donotmovetoshade, "", "false"));
}

function handleMovePersonWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontcheckforresponse, "", "false"));
}

function handleCheckResponseWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontcheckairway, "", "false"));
}

function handleClearAirwayWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontcheckforbreathing, "", "false"));
}
//Intent 6 - checkbreathing
function handleBreathingWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontstartcpr, "", "false"));
}

function handleStartCprWrongRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(dontstartcpr, "", "false"));
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
