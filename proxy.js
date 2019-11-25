const httpHeaders = require('http-headers');
const dgram = require('dgram');
const http = require('http');
const net = require('net');
const dns = require('dns');
const rudp = require('rudp');
const {lookup} = require('lookup-dns-cache');
const cares = require('cares');

const httpLookup = (() => {
  return async (connection, url, remote) => {
    http.get(url, res => {
      let response;
      res.setEncoding('utf-8');
      if (res.statusCode == 301 || res.statusCode == 302) {
        response = `${res.statusCode} redirect happened!`;
        httpLookup(res.headers.location,remote);
      }
      res.on('data', (chunk) => {
        if (res.statusCode == 404) {
          response = chunk;
        } else if (res.statusCode == 200) {
          response = chunk;
        }
        let msg = new Buffer(response.toString());
        connection.send(msg);
      });
      res.on('end', function() {
        console.log('UDP message sent to client ' + remote.address +':'+ remote.port);
      });
    });
  };
})();

const initProxyServer = (host, udpPort, tcpPort) => {

  // TODO: validate ports values
  const HOST = host;
  // UDP
  const UDP_PORT = udpPort;

  const serverSocket = dgram.createSocket('udp4');
  serverSocket.bind(UDP_PORT);
  const server = new rudp.Server(serverSocket);

  server.on('close', () => {
    console.log('UDP message sent to client ' + address +':'+ remote.port);
    serverSocket.close();
  });

  server.on('connection', (connection) => {
    connection.on('data', data => {
      const connectionRequest = httpHeaders(data);
      let completeUrl = 'http://' + connectionRequest.host;
      if (connectionRequest.url){
        completeUrl += connectionRequest.url;
      }
      const remote = {
        address: '127.0.0.1',
        port: '33333'
      };
      httpLookup(connection, completeUrl, remote);
    });
  });

  // TCP
  const TCP_PORT = tcpPort;

  net.createServer((sock) => {
      console.log('CONNECTED TO: ' + sock.remoteAddress +':'+ sock.remotePort);
      sock.on('data', data => {
        console.log('Query ' + sock.remoteAddress + ': ' + data);
        let regexp = /type=(\w+)\s+server=(\S+)\s+target=(\S+)/g;
        const match = regexp.exec(data)
        let result = '';
        cares.query(match[3], {
          type: cares.NS_T_A,
          class: cares.NS_C_IN
        }, (err, response) => {
          if (err) {
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
            for (const anAddress of addresses) {
              result += 'Address = ' + anAddress.address + ' Family = ' + anAddress.family + '\n';
            }
            sock.write(result);
          });
        } else if (match[1] === 'CNAME') {
          dns.resolveCname(match[3], (err) => {
            if (err) {
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
      
  }).listen(TCP_PORT, HOST);

  console.log('TCP Server listening on ' + HOST +':'+ TCP_PORT);
  server.emit('listen');
};



module.exports = {
  Init: initProxyServer,
};
