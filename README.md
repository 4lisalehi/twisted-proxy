# Twisted Proxy

A simple proxy server featuring UDP-to-TCP twisting and DNS over TCP-to-UDP twisting; with DNS cache

Since UDP protocol lacks congestion control mechanisms. As a result, those which send a large amount of data to the network using this protocol in the transport layer could potentially make the network congested and inefficient, even for those using TCP protocol. So, for reasons like the above one, in some networks, UDP usage is limited.

This is where our Twisted Proxy comes in handy. Clients can use such proxies to convert their UDP data to TCP and again covert the TCP response to UDP; Decreasing the possibility that those problems happening. 

So, in summary, our project is a proxy server in charge of converting UDP data received from the client to TCP and sending it to the network, and then receiving the response (which is in TCP protocol format) and convert it back to UDP protocol format and give it back to the client.
