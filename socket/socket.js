module.exports = function(io, rooms){
	// audrey, below is testing for connection
	io.on('connection', function(socket){
	  console.log('a user connected');
	});
	io.on('disconnect', function(){
	    console.log('user disconnected');
	 });

	// io.on('connection', function(socket){
	//   io.on('chat message', function(msg){
	//     console.log('message: ' + msg);
	//   });
	// });

	var chatrooms = io
	  .of('/roomlist')
	  .on('connection', function (socket) {
	  	console.log('ChatRooms connection established at server');

	  	//whenever the connection is established, the client will receive all the rooms.
	  	socket.emit('roomupdate', JSON.stringify(rooms)); 

	  	socket.on('newroom', function(data){
	 		rooms.push(data);
	 		socket.broadcast.emit('roomupdate', JSON.stringify(rooms)); 
	 		socket.emit('roomupdate', JSON.stringify(rooms)); 
	 	})
	   // socket.emit('item', { news: 'item' });
	  })

	  var messages = io.of('/messages').on('connection', function(socket){
	  	console.log('Individual ChatRoom connection established at server');
	  	socket.on('joinroom', function(data){
	  		console.log('server message:' + data.user + 'joined room');
	  		socket.username = data.user;
	  		socket.userPic = data.userPic;
	  		socket.join(data.room); // allow active user to join the room. Push user into this partition
	 		updateUserList(data.room, true);
	  	})

	  	socket.on('newMessage', function(data){
	  		console.log("broadcasting the message")
	  		socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
	  	})

	  	function updateUserList(room, updateAll){
	  		//var getUsers = io.of('/messages').clients(room); 
	  		var getUsers = getUsersFromRoom(room); 
	  		var userList = [];
	  		for (var i in getUsers) {
	  			userList.push({user: getUsers[i].username, userPic: getUsers[i].userPic});
	  		}
	  		socket.to(room).emit('updateUsersList', JSON.stringify(userList));
	  		if (updateAll){
	  			socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
	  		}
	  	}

	  	function getUsersFromRoom(room){
			var usersArray = [];
			var nsp = io.of('/messages');
			var clientsInRoom = nsp.adapter.rooms[room];
			for(var client in clientsInRoom){
				usersArray.push(nsp.connected[client]);
			}
			return usersArray;
		}

	  	socket.on('updateList', function(data){
	  		updateUserList(data.room);
	  	})
	  })




	// var chatrooms = io.of('/roomlist').on('connection', function(socket){
	// 	console.log('Connection established on the server');
	// })
}