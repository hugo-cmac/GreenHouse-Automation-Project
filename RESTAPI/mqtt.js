import mqtt from 'mqtt'

// connection option
const options = {
  		clean: true, // retain session
      connectTimeout: 4000, // Timeout period
      // Authentication information
      clientId: 'emqx_test',
      username: 'augustocesarsilvamota@gmail.com',
      password: '323c0782',
}

// Connect string, and specify the connection method by the protocol
// ws Unencrypted WebSocket connection
// wss Encrypted WebSocket connection
// mqtt Unencrypted TCP connection
// mqtts Encrypted TCP connection
// wxs WeChat applet connection
// alis Alipay applet connection
const connectUrl = 'mqtt.dioty.co'
const client = mqtt.connect(connectUrl, options)

client.on('reconnect', (error) => {
    console.log('reconnecting:', error)
})

client.on('error', (error) => {
    console.log('Connection failed:', error)
})

client.on('message', (topic, message) => {
  console.log('receive message：', topic, message.toString())
})