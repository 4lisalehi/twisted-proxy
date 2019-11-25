const proxyServer = require('./proxy');
const webClient = require('./web-client');
const dnsClient = require('./dns-client');

// Config & Init Proxy Server
const PROXY_HOST = '127.0.0.1';
const PROXY_UDP_PORT = 33333;
const PROXY_TCP_PORT = 44444;

proxyServer.Init(PROXY_HOST, PROXY_UDP_PORT, PROXY_TCP_PORT);


// Config & Init DNS Server
const DNS_HOST = '127.0.0.1';
const DNS_PORT = 44444;

dnsClient.Init(DNS_HOST, DNS_PORT);


// Config & Init Client
const CLIENT_HOST = '127.0.0.1';
const CLIENT_PORT = 33333;

webClient.Init(CLIENT_HOST, CLIENT_PORT);
