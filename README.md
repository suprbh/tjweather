# TJ Weather
<img src="/images/test.gif" width="100%">

> Don't forget to say "Watson" when you talk to it!

Video [demo here](link).

This module provides Node.js code to talk to TJBot and get a response back on the current weather conditions. It uses [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) to parse audio from the microphone, processes your commands (e.g ask a weather related question) using [IBM Weather Insights API] and uses [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to "read" out a text response!

**This is designed to run on a Pi with a microphone and speaker attached. See [Connecting mic and speaker](#todo) for how to connect your  mic and speaker**
Before you start, it is recommended you become familiar with setting up your TJBot/Raspberry Pi by looking at [the instructions here.](http://www.instructables.com/member/TJBot/)


## How It Works
- Listens for voice commands. See [**Running**](#running) for a list of voice commands supported in this sample.
- Sends audio from the microphone to the [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html) Service - STT to transcribe audio to text.
- Parses the text looking for commands
- Once a weather command is recognized, an appropriate action (e.g current weather conditions in san francisco) is taken and TJBot verbalizes this action as well using  [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) to generate an audio file.
- The robot plays back the response through using the Alsa tools

##Hardware
Follow the full set of instructions on [instructables](http://www.instructables.com/id/TODO/) to prepare your TJBot ready to run the code.

Note: You must have a mic and speaker connected to your Pi.  

- [Raspberry Pi 3](https://www.amazon.com/dp/B01C6Q2GSY/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1WPZOVL411972)
- [USB microphone](https://www.amazon.com/dp/B005BRET3G/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1C98I7HIFPNJE)
- [Speaker with 3.5mm audio jack](https://www.amazon.com/gp/product/B014SOKX1E/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
- [TJBot](http://ibm.biz/mytjbot) - You can 3D print or laser cut the robot


##Build
Get the sample code (download or clone) and go to the application folder.

    git clone git@github.com:suprbh/tjweather.git
    cd tjweather

Update your Raspberry Pi. Please see the guide [here to setup network and also update your nodejs] (http://www.instructables.com/id/Make-Your-Robot-Respond-to-Emotions-Using-Watson/step2/Set-up-your-Pi/) installation
    sudo apt-get update
    sudo apt-get upgrade
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs

Note : Raspberry pi comes with a really old version of nodejs and npm (0.10), hence the need to upgrade it to the latest version.

Install ALSA tools (required for recording audio on Raspberry Pi). (Some of the sample code integrate voice commands)

    sudo apt-get install alsa-base alsa-utils
    sudo apt-get install libasound2-dev


Install Dependencies

    npm install
    # try 'sudo rm -rf node_modules'  and 'sudo npm install --unsafe-perm' if you run into errors installing dependencies

Set the audio output to your audio jack. For more audio channels, check the [config guide. ](https://www.raspberrypi.org/documentation/configuration/audio-config.md)

    amixer cset numid=3 1    
    // This sets the audio output to option 1 which is your Pi's Audio Jack. Option 0 = Auto, Option 2 = HDMI. An alternative is to type sudo raspi-config and change the audio to 3.5mm audio jack.

Create config.js

    # On your local machine rename the config.default.js file to config.js.
    cp config.default.js config.js

    Open config.js using your favorite text editor # (e.g // nano) and update it with your Bluemix credentials for the Watson services you use.
    nano config.js

Note: do not add your credentials to the config.default.js file.

##Running

Start the application. (Note: you need sudo access)

    node weather.js     

Then you should be able to speak to the microphone.
Sample utterances are

    Watson what is the weather in san francisco california ?

## Whats Next

There are a few things you can do .. and ways to take your robot forward!
- Use Watson Entity Extraction service to make it retrieve global weather conditions instead of only U.S.
- Leverage machine learning capabilities within Watson conversation to better match intents even when recognized text is not accurate.
- Animate robot interactions LED

# Dependencies List

- Watson Developer Cloud : [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html), [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html), and [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html).
- [mic](https://www.npmjs.com/package/mic) npm package : for reading audio input

## License
#test
MIT License
