const net = require('net');

const HOST = '127.0.0.1';
const PORT = 44444;

const client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
	const stdin = process.openStdin();

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
