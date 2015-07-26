module.exports = function(express, app, passport, config, rooms){
	var router = express.Router();

	router.get('/', function(req, res, next){
		res.render('index', {title: "Welcome to Chatcat"});
	})

	// add a midware 
	function securePages(req,res,next){
		if (req.isAuthenticated()){
			return next();
		} else {
			res.redirect('/');
		}
	}
	router.get('/auth/facebook', passport.authenticate('facebook'));
	router.get('/auth/facebook/callback', passport.authenticate('facebook',{
		successRedirect: '/chatrooms',
		failureRedirect:'/'
	}))

	router.get('/chatrooms', securePages, function(req,res,next){
		res.render('chatrooms', {title: 'Chatrooms', user: req.user, config: config});
	})

	router.get('/room/:id', securePages, function(req, res, next){
		var room_name = findRoomName(req.params.id);
		res.render('room', {user: req.user, room_number: req.params.id, room_name: room_name, config: config});
	})
	function findRoomName(room_id){
		var n = 0; 
		while (n < rooms.length){
			if (rooms[n].room_number == room_id){
				return rooms[n].room_name;
				break;
			} else {
				n++; 
				continue;
			}
		}
	}


	router.get('/logout', function(req,res,next){
		req.logout();
		res.redirect('/');
	})

	// router.get('/chatrooms', function(req,res,next){
	// 	res.render('chatrooms',{title: 'Chatrooms'});
	// })

	router.get('/setcolor', function(req,res,next){
		req.session.favColor = "Red";
		res.send('Settign fav color to be red');
	})
	router.get('/getcolor', function(req,res,next){
		res.send('Fav color:' + (req.session.favColor === undefined? 'Undefined':req.session.favColor));
	})

	// set default route
	app.use('/', router);
}