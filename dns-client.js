var net = require('net');

var HOST = '127.0.0.1';
var PORT = 44444;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
	var stdin = process.openStdin();

	stdin.addListener("data", function(d) {
    	client.write(d.toString().trim());
 	 });
});

client.on('data', data => {
    console.log(data.toString().trim());
});

client.on('close', function() {
    console.log('Connection closed');
});