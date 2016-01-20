var http = require('http');
var https = require('https');
var zipcodes = require("./zipdata.js");
var data = zipcodes.zipdata;
var zipcode = process.argv.slice(2);
var zipObj = "";
var API_KEY = "INSERT_KEY_HERE";
function getZipCoordinates(zip) {
	var finishedURL = "";
	for (var i = 0; i < data.length; i++) {
		if ( data[i]["\"\"zipcode\"\""] == zip ) {
			zipObj = data[i];
			var lat = zipObj["\"\"latitude\"\""];
			var lon = zipObj["\"\"longitude\"\""];
			lat = lat.slice(3);
			lat = lat.slice(0,-3);

			lon = lon.slice(2);
			lon = lon.slice(0,-3);
			
			finishedURL = "https://api.forecast.io/forecast/" + API_KEY + "/" + lat + "," + lon;
			break;
		}
	}
	getWeather(finishedURL);
}
function getWeather(finishedURL) {
	var request = https.get(finishedURL, function(response){
		var body = "";
		response.on("data", function(chunk){
			body += chunk;
		});
		response.on("end", function() {
			if (response.statusCode === 200) {
				try {
					var weather = JSON.parse(body);
					printMessage(weather);
				} 
				catch (error) {
					errorMessage(error);
				}
			} 
			else {
				errorMessage({message: "Searching for  " + zipcode + " weather cause an error. (" + http.STATUS_CODES[response.statusCode] + ")"});
			}
		});
	});
	request.on("error", errorMessage);
}
function errorMessage(error) {
	console.error(error.message);
}
function printMessage(weather) {
	var cityOfState = zipObj["\"\"city\"\""];
	var stateOfUSA = zipObj["\"\"state\"\""];
	cityOfState = cityOfState.slice(2);
	cityOfState = cityOfState.slice(0,-2);

	stateOfUSA = stateOfUSA.slice(2);
	stateOfUSA = stateOfUSA.slice(0,-2);
	console.log("The weather in " + cityOfState + ", " + stateOfUSA + " currently is " + weather.currently.summary.toLowerCase() + " and " + Math.round(weather.currently.temperature) + "\xB0 F.");
	if ((Math.round(weather.currently.temperature)) > 110)
		console.log("Stay inside, it's melting!");
	else if ((Math.round(weather.currently.temperature)) > 80)
		console.log("It's warm out there! Wear short-sleeves and sandals.");
	else if ((Math.round(weather.currently.temperature) < 50))
		console.log("I'd wear a jacket if I were you!");
	else if ((Math.round(weather.currently.temperature)) > 30)
		console.log("Wear gloves out there! It's gonna be freezing.");
	else
			console.log("Weather out of range somehow, stay inside and play Fallout 4.");
}
module.exports = {
	getZipCoordinates: getZipCoordinates,
	zipcode: 		   zipcode
};