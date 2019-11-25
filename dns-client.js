const net = require('net');


const initDnsClient = (host, port) => {
	const HOST = host;
	const PORT = port;
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
	
};

module.exports = {
	Init: initDnsClient,
};
