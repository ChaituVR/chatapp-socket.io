 var socketName = "";
        $(document).ready(function() {
            $('#usersList').hide();

            $('#m').focus();
            $('#m').on('focus', function() {
                $('title').text("ChatApp in Socket.io");
            });

            $('body').on('click', function() {
                $('#m').focus();
            });
            var socket = io();
            socket.emit('adduser', prompt("What's your name?")); ///asking for username

            $('#imageButton').on('click', function() {
                socket.emit('chat message', '<img src="' + prompt("Enter the URL of the image") + '" width="180px" alt="image">');
            });

            $('form').submit(function() {

                socket.emit('chat message', String($('#m').val()));
                $('#m').val('');

                return false;

            });
            socket.on('chat message', function(username, msg, align, time) {
                var myDate = new Date(time);

                var localTime = myDate.toLocaleString();
                console.log(localTime);
                var localTimeString = localTime.slice(10, 15) + " " + localTime.slice(18, 21);
                if (align === 150) {
                    $('#messages').append($('<li style="background:#B3E6DA;margin-left:' + align + 'px;">').html("<div><b>" + username + " : </b><div><div class='msg' style='text-align:left;padding-top:5px;padding-bottom:5px;'>" + " " + "</div><div class='msgtime'>" + localTimeString + "</div><span class='arrow-right'></span>"));


                    $('title').text("ChatApp in Socket.io");
                }
                else {
                    $('#messages').append($('<li style="background:#BDE4AF;margin-left:' + align + 'px;">').html("<div><b>" + username + " : </b><div><div class='msg' style='text-align:left;padding-top:5px;padding-bottom:5px;'>" + msg + "</div><div class='msgtime'>" + localTimeString + "</div><span class='arrow-left'></span>"));

                    $('title').text(username + " sent a message").css('color', 'red');
                }
                if (msg.substring(1, 9) === "img src=") {
                     if(msg.substring(10, 14) === "http"){
                         console.log(msg);
                    $('#messages > li:last').find('.msg').html(msg);
                     }
                     else{
                          console.log(msg);
                    $('#messages > li:last').find('.msg').html("<div style='color:red'>Image not found!!!</div>");
                     }
                   
                }
                else {
                    console.log(msg)
                    $('#messages > li:last').find('.msg').text(msg);
                }
                $('#messages').animate({
                    scrollTop: $('#messages').get(0).scrollHeight
                }, 1);

            });
            socket.on('connected', function(msg) {
                $('#messages').append($('<li style="margin-left:10px;color:blue;">').text(msg));

            });
            socket.on('totalusers', function(usernames, msg, username) {
                $('#usersList').text('');
                //    socketName=username;
                //$("#socketName").text("Your Name - "+socketName);
                for (var x = 0; x < usernames.length; x++) {
                    //      if(usernames[x]===socketName){
                    //        $('#usersList').append($('<li style="margin-left:10px;width=100px;color:red;">').text("You - "+usernames[x]));
                    //      }
                    //      else{
                    $('#usersList').append($('<li style="margin-left:10px;width=100px;color:blue;"><a href="/private/' + socketName + '/' + usernames[x] + '">' + usernames[x] + ' - Online</a>'));
                    //    }
                }
                $('#total').text(msg);

            });
            socket.on('disconnected', function(msg) {
                $('#messages').append($('<li style=" margin-left:10px; color:blue;">').text(msg));

            });
            var userVisability = 'hidden';
            $('#usersButton').on('click', function() {
                console.log("clicked!");
                if (userVisability === 'showing') {
                    $('#usersList').stop().hide(500);
                    $('#usersButton').text("Show people Online");
                    userVisability = 'hidden';
                }
                else if (userVisability === 'hidden') {
                    $('#usersList').stop().show(500);
                    $('#usersButton').text("Hide people Online");
                    userVisability = 'showing';
                }
            });
        });