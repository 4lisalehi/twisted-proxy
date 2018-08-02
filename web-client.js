const dgram = require('dgram');
const readline = require('readline');
const fs = require('fs');
const rudp = require('rudp');  // for reliable UDP

const PORT = 33333;
const HOST = '127.0.0.1';

var input = [];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt();

rl.on('line', cmd => {
  input.push(cmd);
});

rl.on('close', cmd => {
  console.log('closing');
  let msg = new Buffer(input.join('\r\n'));

  let clientSocket = dgram.createSocket('udp4');
  let client = new rudp.Client(clientSocket, HOST, PORT);

  client.send(msg);

  client.on('data', data => {
		fs.appendFile('file.mp4', data, err => {
      if (err)
        throw err;
      console.log('Saved!');
    });
    // Change file format according to use case
  });
});
