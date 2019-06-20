var rpiDhtSensor = require('rpi-dht-sensor');
var dht = new rpiDhtSensor.DHT11(21);
var Gpio = require('onoff').Gpio;
var LED = new Gpio(4, 'out');
var MOTION = new Gpio(17, 'in', 'both');
var LED2 = new Gpio(22,'out');
var axios = require('axios');

function getDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
}

function getTime(){
    return new Date().toTimeString().split(" ")[0]
}


async function sendDataToAzure(temperature, humidity){

    var headers = {
        "x-functions-key": "/Ukhl5arUOXFvettOHX4W0EUdNW15aHR/xkysjSOECMCEITuVDUeKA==",
	"Content-Type": "text/plain"
    }

    var body = {
        "measurement_date": getDate(),
        "measurement_time": getTime(),
        "temperature": parseInt(temperature),
        "air_humidity": parseInt(humidity),
        "soil_moisture": 0
    }
    await axios({
  	method: 'post',
  	url: "https://cdv-iot-cloud.azurewebsites.net/api/",
  	data: body,
	headers: headers
	}).then(function(res){
		if(res.status == 201){
			console.log("OK");
		}
		else{
			console.log(res.status);
		}
	}).catch(err => console.log(err))
}


function read() {

    var readout = dht.read();
    sendDataToAzure(readout.temperature.toFixed(2), readout.humidity.toFixed(2))
    console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
        'humidity: ' + readout.humidity.toFixed(2) + '%');
    setTimeout(read, 5000);

}
read();


MOTION.watch(function (error, value) {
	console.log("MOTION SENSOR");
    if (value === 0) {
        LED.writeSync(0)
	console.log("nie podlewam");
	LED2.writeSync(1)
    }
    else {
        LED.writeSync(1)
	LED2.writeSync(0)
	console.log("podlewam trawnik");
    }
});

