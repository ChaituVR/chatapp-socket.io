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
server.route({
 method: 'GET',
 path: '/js/{name}',
 handler: function (request, reply) {
  reply.file('Public/'+request.params.name);
 }
});
var connectCounter=0;
var usernames=[];
io.on('connection', function(socket){
 connectCounter++;
 console.log('Total '+connectCounter+' people are connected');
 
 var socketId = socket.id;
 var clientIp = socket.request.connection.remoteAddress;

 console.log(clientIp);



 
 io.emit('totalusers',usernames, 'Total '+connectCounter+' people are connected');
 
 socket.on('adduser', function(username){
  // we store the username in the socket session for this client
  if(username==='' || username===null){
   username = 'Guest'+Math.floor((Math.random() * 1000) + 1);

  }
  socket.username = username;
  usernames.push(username);
  
  
  // echo to client they've connected
  socket.emit('chat message', 'SERVER', 'You are now connected :)','left');
  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('connected', username + ' has connected');
  // update the list of users in chat, client-side
  io.emit('totalusers',usernames, 'Total '+connectCounter+' people are connected');
 });


 socket.on('chat message', function(msg){
  var userName=socket.username;    
  if(clientIp=='127.0.0.1'){
     //userName='Admin';
    }
    if(msg.length>0){
    socket.emit('chat message', 'Me ( '+userName+' ) ', msg,'right');
    socket.broadcast.emit('chat message', userName,msg,'left');
   }
   });

 socket.on('disconnect', function(){
  connectCounter--;
  var index= usernames.indexOf(socket.username);
  console.log(socket.username);   
  if (index > -1) {
   usernames.splice(index, 1);
  }

  io.emit('totalusers',usernames, 'Total '+connectCounter+' people are connected');
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
