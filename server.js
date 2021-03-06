'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();


server.connection({
 host: '0.0.0.0',
 port: process.env.PORT || 5000
});

const io = require('socket.io')(server.listener);

server.register(require('inert'), (err) => {

 if (err) {
  throw err;
 }




 // Add the route
 server.route([{
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
   reply.file('index.html');
  }
 }, {
  method: 'GET',
  path: '/js/{name}',
  handler: function(request, reply) {
   reply.file('Public/' + request.params.name);
  }
 }, {
  method: 'GET',
  path: '/css/{name}',
  handler: function(request, reply) {
   reply.file('Public/' + request.params.name);
  }
 }, {
  method: 'GET',
  path: '/private/{chatName}/{people}',
  handler: function(request, reply) {
   reply("This is the private chat between " + request.params.chatName + " and " + request.params.people);
  }
 }]);


 var connectCounter = 0;
 var usernames = [];

 io.on('connection', function(socket) {
  
  console.log('Total ' + connectCounter + ' people are connected');

  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;

  console.log(clientIp);




  io.emit('totalusers', usernames, 'Total ' + connectCounter + ' people are connected');

  socket.on('adduser', function(username) {
   // we store the username in the socket session for this client
   if (username === '' || username === null) {
    username = 'Guest' + Math.floor((Math.random() * 1000) + 1);

   }
   socket.username = username;
   usernames.push(username);
   connectCounter++;

   var timeInString = gettimeMsg();
   // echo to client they've connected
   socket.emit('chat message', 'SERVER', 'You are now connected :)', 22, timeInString);
   // echo globally (all clients) that a person has connected
   socket.broadcast.emit('connected', username + ' has connected');
   // update the list of users in chat, client-side
   io.emit('totalusers', usernames, 'Total ' + connectCounter + ' people are connected', username);

  });

  function gettimeMsg() {
   var d = new Date();
   return d.toUTCString();
  }

  socket.on('chat message', function(msg) {
   var userName = socket.username;
   if (clientIp == '127.0.0.1') {
    //userName='Admin';
   }
   if (msg.length > 0) {
    var timeInString = gettimeMsg();
    console.log(timeInString);
    socket.emit('chat message', 'Me ( ' + userName + ' ) ', msg, 150, timeInString);
    socket.broadcast.emit('chat message', userName, msg, 22, timeInString);
   }
  });

  socket.on('disconnect', function() {
   connectCounter--;
   var index = usernames.indexOf(socket.username);
   console.log(socket.username);
   if (index > -1) {
    usernames.splice(index, 1);
   }

   io.emit('totalusers', usernames, 'Total ' + connectCounter + ' people are connected');
   io.emit('disconnected', socket.username + ' has disconnected');

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
