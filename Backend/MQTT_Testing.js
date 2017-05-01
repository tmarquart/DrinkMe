var mqtt = require('mqtt');

var client = mqtt.connect('mqtt://107.170.38.244', 8083);
client.on('connect', function () {
    console.log('connected');
    client.subscribe('chat');
});

client.publish('chat', 'message!');

client.on('message', function (topic, msg) {
    console.log(msg);
});

client.publish('chat', 'message!');