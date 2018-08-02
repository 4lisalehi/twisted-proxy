const httpHeaders = require('http-headers');
const dgram = require('dgram');
const http = require('http');
const net = require('net');
const dns = require('dns');
const rudp = require('rudp');
const request = require('request');
const {lookup} = require('lookup-dns-cache');
const cares = require('cares');

// UDP

var PORT = 33333;
var HOST = '127.0.0.1';

var serverSocket = dgram.createSocket('udp4');
serverSocket.bind(PORT);
var server = new rudp.Server(serverSocket);

connections = [];

server.on('close', () => {
  let current_connection = connections[0];
  console.log(current_connection);
  console.log('UDP message sent to client ' + address +':'+ remote.port);
  serverSocket.close();
});

var the_http_lookup = (() => {

  return async (connection, url, remote) => {
    http.get(url, res => {
      res.setEncoding('utf-8');
      if (res.statusCode == 301 || res.statusCode == 302) {
        let response = `${res.statusCode} redirect happened!`;
        the_http_lookup(res.headers.location,remote);
      }
      res.on('data', function (chunk) {
        if (res.statusCode == 404) {
          var response = chunk;
        } else if (res.statusCode == 200) {
          var response = chunk;
        }
        let msg = new Buffer(response.toString());
        connection.send(msg);
      });
      res.on('end', function() {
        console.log('UDP message sent to client ' + remote.address +':'+ remote.port);
      });
    });
  }
})();

server.on('connection', connection => {
  connection.on('data', data => {
    var connection_request = httpHeaders(data);

    let complete_url = 'http://' + connection_request.host;
    if (connection_request.url)
      complete_url += connection_request.url;
    let remote = {
      address: '127.0.0.1',
      port: '33333'
    };
    the_http_lookup(connection, complete_url, remote);
  });
});

// TCP

var PORT2 = 44444;

net.createServer((sock) => {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.on('data', data => {
      console.log('Query ' + sock.remoteAddress + ': ' + data);
      let regexp = /type=(\w+)\s+server=(\S+)\s+target=(\S+)/g;
      let match = regexp.exec(data)
      let result = '';


      cares.query(match[3], {
        type: cares.NS_T_A,
        class: cares.NS_C_IN
      }, (err, response) => {
        if(err) {
          throw err;
        }
        console.log(response.header);
        if (response.header.aa) {
          console.log(response.header.aa == 0 ? 'Non-authoritative' : 'authoritative');
        }
      });

      if (match[1] === 'A') {
        const options = {
          all : true,
        };

        lookup(match[3], options, (err, addresses, family) => {
          for (let the_address of addresses) {
            result += 'Address = ' + the_address.address + ' Family = ' + the_address.family + '\n';
          }
           sock.write(result);
        });
      } else if (match[1] === 'CNAME') {
        dns.resolveCname(match[3], function (err, addresses) {
          if(err) {
            sock.write('\n' + err);
          } else {
            sock.write(result);
          }
        });
      }
    });

    sock.on('close', data => {
      console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT2, HOST);

console.log('TCP Server listening on ' + HOST +':'+ PORT2);
server.emit('listen');
