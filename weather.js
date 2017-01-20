/************************************************************************
*
* Author: Supriya Bhat
*
* Description:
* A robot which responds to weather related questions.
* This module uses Watson Speech to Text, Watson Weather Insights, and Watson Text to Speech.
*
* To run: node weather.js
*
*/

var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require("./config.js") // to get the credentials and the attention word from the config.js file
var exec = require('child_process').exec;
var fs = require('fs');
var inputdata = require('./inputdata.js'); // contains all the mapping objects
var weatherResponse = require('./weather_response.js'); // contains all the mapping objects
var attentionWord = config.attentionWord; //you can change the attention word in the config file

/************************************************************************
* Configuring IBM Bluemix Credentials for :
* Watson Speech to Text,
* Watson Text to Speech,
* IBM Weather Insights
************************************************************************
*/

var speech_to_text = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

/************************************************************************
* Step #2: Configuring the Microphone
************************************************************************
This step configures the microphone to collect the audio samples as you talk.
See https://www.npmjs.com/package/mic for more information on
microphone input events e.g on error, startcomplete, pause, stopcomplete etc.
*/

// Initiate Microphone Instance to Get audio samples
var mic = require('mic');
var micInstance = mic({ 'rate': '44100', 'channels': '2', 'debug': false, 'exitOnSilence': 8 });
var micInputStream = micInstance.getAudioStream();

micInputStream.on('data', function(data) {
  //console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
  console.log("Error in Input Stream: " + err);
});

micInputStream.on('silence', function() {
  // detect silence.
});
micInstance.start();
console.log("TJBot is listening, you may speak now.");

var textStream ;

/************************************************************************
* Step #3: Converting Speech Commands to Text
************************************************************************
In this step, the audio sample is sent (piped) to "Watson Speech to Text" to transcribe.
The service converts the audio to text and saves the returned text in "textStream"
*/

textStream = micInputStream.pipe(speech_to_text.createRecognizeStream({
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: true,
  keywords: [attentionWord],
  smart_formatting: true,
  keywords_threshold: 0.5
}));

textStream.setEncoding('utf8');

/*********************************************************************
* Step #4: Parsing the Text and create a weather response
*********************************************************************
* In this step, we parse the text to look for attention word and send that sentence to get appropriate weather response.
* Once the attention word is detected,the text is sent to processed to look for weather related keywords.
* The response is generated using Weather Insights api and is sent back to the module.
*/
var context = {} ; // Save information on conversation context/stage for continous conversation

textStream.setEncoding('utf8');
textStream.on('data', function(str) {
  console.log(' ===== Speech to Text ===== : ' + str); // print the text once received

  if (str.toLowerCase().indexOf(attentionWord.toLowerCase()) >= 0) {
	    var foundIntent = false; // Default intent
		var watsonResponse = "Sorry, I didn't understand that. Can you please say it again?"; // Default response
		

		var res = str.toLowerCase().replace(attentionWord.toLowerCase(), "");

		console.log("msg sent to weather insights:" ,res);

		for(var i = 0; i < inputdata.intents.length; i++) {
			if (res.indexOf(inputdata.intents[i]) > -1) {
				foundIntent = true;
				console.log("Calling createWeatherResponse for" , inputdata.intents[i]);
				
				weatherResponse.createWeatherResponse(inputdata.intents[i], res, function(err, response){

					if(err)
					{
						//console.log("Encountered an error while retriveing weather data");
						console.log(response);
						watsonResponse = response;
					} else {

						if (response != undefined ){
							// Create a personal response from watson

							watsonResponse = "The " + response.intent + " in " + response.city + " " + response.state + " is " + response.skyCondition + " with a temperature of " + response.temp + " degrees fahrenheit. The wind speed is " + response.windspeed;
							watsonResponse += "miles per hour. Also, the UV index is " + response.uv;

						}
					}
					
					speakResponse(watsonResponse);
					// return;	

				}); // end createWeatherResponse
			}

		} 
		if (!foundIntent) {
			watsonResponse = "I did not hear a weather intent. I am a talking weather bot, please ask me questions such as, what is the weather in san francisco california?"; // Default response
			speakResponse(watsonResponse);
		}

	} // If attentionWord is heard
	else {
		console.log("Waiting to hear", attentionWord);
	}
});

speakResponse = function(watsonResponse) {
	var params = {
		text: watsonResponse,
		voice: config.voice,
		accept: 'audio/wav'
		};

	console.log("Result from conversation:" ,watsonResponse);
	/*********************************************************************
	 Step #5: Speak out the response
	 *********************************************************************
	 In this step, we text is sent out to Watsons Text to Speech service and result is piped to wave file.
	 Wave files are then played using alsa (native audio) tool.
	 */
	 tempStream = text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
		var create_audio = exec('aplay output.wav', function (error, stdout, stderr) {
		  if (error !== null) {
			console.log('exec error: ' + error);
		  }
		});
	 });
}

textStream.on('error', function(err) {
  console.log(' === Watson Speech to Text : An Error has occurred =====') ; // handle errors
  console.log(err) ;
  console.log("Press <ctrl>+C to exit.") ;
});
