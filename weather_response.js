var inputdata = require('./inputdata.js'); // contains all the mapping objects
var config = require('./config.js');
var request = require('request');

exports.createWeatherResponse = function(intent, res, callback){
	var city = "";
	var state = "";
	var index = 0;
	console.log("res: ", res);
	if (res.indexOf("home") > -1){
		// home
		city = 'Cupertino';
		state = 'california';
		
	} else if(res.indexOf("work") > -1) {
		// work
		city = 'San Francisco';
		state = 'california';
	} else if ((index=res.indexOf(" at ")) > -1 || (index=res.indexOf(" in ")) > -1) {
		//var index = 0;
		var citystate = "";
		if (res.indexOf('at') > -1 ) {
			citystate = res.toLowerCase().split(" at ")[1];;
		} else {
			citystate = res.toLowerCase().split(" in ")[1];
		}
		
		//var citystate = res.toLowerCase().slice(index+3);
		var citystate = res.toLowerCase().split(" in ")[1];
		console.log(" citystate: ", citystate);
		for (var key in inputdata.states) {
			if (citystate.indexOf(key) > -1) {
				// Found state
				city = citystate.slice(0, citystate.indexOf(key));
				state = citystate.slice(citystate.indexOf(key));
				console.log("City: ", city, " State: ", state);
				break;
			}
		}
	} else {
		callback(true, "Sorry, I did not understant what you are looking for");
	}


	var url = config.WEATHERURL + "/api/weather/v3/location/search?query="+ escape(city.trimRight()) + "&locationType=city&language=en-US&adminDistrictCode="+ inputdata.getStateCode(state);
	console.log("url: ", url); // Remove
	
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200){
			var data = JSON.parse(body);
			console.log("Response: ", data); // Remove

			var latitude = data["location"]["latitude"][0];
			var longitude = data["location"]["longitude"][0];
			
			console.log("Response: lat/lon: ", latitude, "/", longitude ); // Remove
			
			var conditionsUrl = config.WEATHERURL + "/api/weather/v1/geocode/" + latitude + "/" + longitude + "/observations.json?language=en-US&units=e";
			console.log("conditionsUrl ", conditionsUrl);
			request(conditionsUrl, function(err, res, body){
				console.log("Conditions: ", err, " res", res, " body", body); // Remove
				if(!err && res.statusCode == 200) {
					var conditionsData = JSON.parse(body);
					console.log("Conditions Response: ", conditionsData); // Remove
					var result = {
						temp: conditionsData.observation.temp,
						skyCondition: conditionsData.observation.wx_phrase,
						windspeed: conditionsData.observation.wspd,
						feels_like: conditionsData.observation.feels_like,
						rain: conditionsData.observation.precip_hrly,
						uv: conditionsData.observation.uv_desc
					};
					
					callback(false, result);
						
				}
				else if(err) {
					console.log("Conditions Error: ", err);
					callback(true, err);
				} 
				else if(res.statusCode != 200) {
					console.log("StatusCode error ", res.statusCode);
					callback(true, res.statusCode);
				}
			});
		}
		else if(error) {
			console.log("Error in request: ", error);
			callback(true, error);
		}
		else if(response.statusCode != 200) {
			callback(true, response.statusCode);
		}
	});
	
	return;
		
};
