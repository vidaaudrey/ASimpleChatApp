module.exports = function(passport, FacebookStrategy, config, mongoose){

	var chatUserSchema = new mongoose.Schema({
		profileID: String, 
		fullname: String,
		profilePic: String
	});

	var chatUserModel = mongoose.model('ChatUsers', chatUserSchema);

	// store the user info in the session and access using serialize and deserialize
	passport.serializeUser(function(user, done){
		done(null, user.id)
	});
	passport.deserializeUser(function(id,done){
		chatUserModel.findById(id, function(err,user){
			done(err, user);
		})
	});

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id','displayName','photos']
	},function(accessToken, refreshToken, profile, done){
		// check if the user exiists in mongodb, if not, create one, if yes, simple return the user
		chatUserModel.findOne({'profileID': profile.id}, function(err, result){
			if (result) {
				done(null, result);
			} else {
				var newChatUser = new chatUserModel({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || ''
				});
				newChatUser.save(function(err){
					done(null, newChatUser);
				})
			}
		})
	}));
}