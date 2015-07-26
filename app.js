var express = require('express'),
	app = express(),
	path = require('path'), 
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session),
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy, 
	//rooms = [];
	rooms = [{
		room_name: 'Cloud Computing',
		room_number: 122121
	}];

// where to find views 
app.set('views',path.join(__dirname,'views'));
// use template engine
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

// deal with env mode, NODE_ENV is set by command ($ export NODE_ENV=development), default to development
var env = process.env.NODE_ENV || 'development';
if (env === 'development'){
	//app.use(session({secret: 'catscanfly', saveUninitialized: true, resave: true}));
	app.use(session({secret: config.sessionSecret, saveUninitialized: true, resave: true}));
} else {
	app.use(session({
		secret: config.sessionSecret, saveUninitialized: true, resave: true,
		store: new ConnectMongo({
			//url: config.dbURL,
			mongooseConnection: mongoose.connection,
			stringify: true
		})
	}));
}

// save data using mongoose
// var userSchema = mongoose.Schema({
// 	username: String,
// 	password: String
// })
// var Person = mongoose.model('users', userSchema);
// var John = new Person({
// 	username: 'jonedoe',
// 	password:'password'
// })
// John.save(function(error){
// 	console.log('Saved John');
// })




// Facebook login and user session
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

// app.route('/').get(function(req,res,next){
// 	//res.send('Hello World!');
// 	res.render('index', {title: 'Welcome to ChatCat!'})

// });

 require('./routes/routes.js')(express, app, passport, config, rooms);

// app.listen(3000, function(){
// 	console.log('Chat working o 3000');
// 	console.log('Mode:' + env);
// })
app.set('port', process.env.PORT || 3000); 
//var server = require('http').createServer(app);
var server = require('http').Server(app);
//var io = require('socket.io').listen(server);
var io = require('socket.io')(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function(){
	console.log('ChatCat working on' + app.get('port'));
})








