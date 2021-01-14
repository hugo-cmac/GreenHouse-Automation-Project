var hostname = "mqtt.dioty.co";
var port = 1883;
var clientId = "CERCI_ESP_ID";
clientId += new Date().getUTCMilliseconds();;
var username = "augustocesarsilvamota@gmail.com";
var password = "323c0782";

mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
mqttClient.onMessageArrived = MessageArrived;
mqttClient.onConnectionLost = ConnectionLost;
Connect();

<<<<<<< HEAD
client.on('connect', function() { 
    console.log("Connected");
    
    // Check you have a connection
/*
// Subscribe to a Topic
client.subscribe(/yourRootTopic/#, function() {
// When a message arrives, write it to the console
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });
    });
=======
/*Initiates a connection to the MQTT broker*/
function Connect(){
	mqttClient.connect({
	onSuccess: Connected,
	onFailure: ConnectionFailed,
	keepAliveInterval: 10,
	userName: username,
	useSSL: true,
	password: password});
}
>>>>>>> 5b8970fce8aaa1aa069510cd720c60588ceddda5

/*Callback for successful MQTT connection */
function Connected() {
	console.log("Connected");
	mqttClient.subscribe(subscription);
}

/*Callback for failed connection*/
function ConnectionFailed(res) {
	console.log("Connect failed:" + res.errorMessage);
}

/*Callback for lost connection*/
function ConnectionLost(res) {
	if (res.errorCode !== 0) {
		console.log("Connection lost:" + res.errorMessage);
		Connect();
	}
}
