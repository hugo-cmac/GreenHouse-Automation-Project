var mqtt = require(mqtt);

// Create a client connection
var client = mqtt.connect("mqtt://mqtt.dioty.co:1883", {
username: "augustocesarsilvamota@gmail.com",
password: "323c0782"
});

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

// Publish a message to a Topic
    client.publish(/yourRootTopic/test, 'Hello World Message!', function() {
        console.log("Message posted...");
        client.end(); // Close the connection after publish
    });
    */
});