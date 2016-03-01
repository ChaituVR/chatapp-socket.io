'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();


server.connection({ 
    host: '0.0.0.0', 
    port: 8000 
});

const io = require('socket.io')(server.listener);

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }




// Add the route
server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('index.html');
        }
    });
var connectCounter=0;
io.on('connection', function(socket){
  connectCounter++;
  console.log('Total '+connectCounter+' people are connected');
 
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;

  console.log(clientIp);


  
 
  io.emit('totalusers', 'Total '+connectCounter+' people are connected');
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });

  socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		if(username==='' || username===null){
                username = 'Guest'+Math.floor((Math.random() * 1000) + 1);
                
                }
                socket.username = username;
                
		// add the client's username to the global list
		//usernames[username] = username;
		// echo to client they've connected
		socket.emit('chat message', 'SERVER', 'You are now connected :)');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('connected', username + ' has connected');
		// update the list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
	});


socket.on('chat message', function(msg){
 var userName=socket.username;    
if(clientIp=='127.0.0.1'){
     //userName='Admin';
     }
    io.emit('chat message', userName,msg);
  });

  socket.on('disconnect', function(socket){
  connectCounter--;
  io.emit('totalusers', 'Total '+connectCounter+' people are connected');
  io.emit('disconnected', 'One of the user disconnected');
  
  });
});



	
});
// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
