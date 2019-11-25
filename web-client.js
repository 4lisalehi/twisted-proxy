const dgram = require('dgram');
const readline = require('readline');
const fs = require('fs');
const rudp = require('rudp');  // for reliable UDP

const PORT = 33333;
const HOST = '127.0.0.1';

const inputLines = [];

const LineReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

LineReader.prompt();

LineReader.on('line', (cmd) => {
  inputLines.push(cmd);
});

LineReader.on('close', (cmd) => {
  console.log('Closing...');
  const msg = new Buffer(inputLines.join('\r\n'));

  const clientSocket = dgram.createSocket('udp4');
  const client = new rudp.Client(clientSocket, HOST, PORT);

  client.send(msg);

  client.on('data', data => {
		fs.appendFile('file.mp4', data, (err) => {
      if (err){
        throw err;
      }
      console.log('Response saved to file.');
    });
    // TODO: Change file format according to use case
  });
});
