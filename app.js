console.log('SWEETNR> INIT DRAGONS...');

const DB_CONNECT_STRING = 'mongodb://localhost/db',
	  BLOG_DETAILS = {
	  	title: 		'My Awesome blog',
		tagline: 	'Epic awesomesauce',
		name: 		'Bender Bending Rodriguez',
		item_limit: 10,
		username: 'admin',
		password: require('crypto').createHash('md5').update('changeme').toString('ascii') // SHOULD be replaced with a real hash
	  };

var connect = require('connect'),
	express = require('express'),
	mongoose = require('mongoose').Mongoose,
	app = express.createServer(
		connect.staticProvider(__dirname + '/public'),
		connect.bodyDecoder(),
		express.cookieDecoder(),
		express.session()
	);

// Config
app.set('view engine', 'jade');
app.set('db', mongoose.connect(DB_CONNECT_STRING));
app.set('blog-details', BLOG_DETAILS);
app.use(app.router);

// Models
require('./models/article').ArticleModel(mongoose);

// Controllers
require('./controllers/post').postController(app);
require('./controllers/list').listController(app);
require('./controllers/admin').adminController(app);

// Helpers
app.helpers(require('./helpers').Helpers);

// Error handling
app.get('/404', function(req, res){
	res.header('HTTP/1.1 404 Not Found');
	throw new NotFound;
});

app.get('/500', function(req, res, next){
	next(new Error('Internal Server Error'));
});

app.error(function(err, req, res, next){
	if(err instanceof NotFound){
		res.render('404');
	}else{
		next(err);
	}
});

app.error(function(err, req, res){
	console.log(err);
	res.render('500');
});

var NotFound = function(path){
	this.name = 'NotFound';
	if(path){
		Error.call(this, 'Cannot find ' + path);
		this.path = path;
	}else{
		Error.call(this, 'Not Found');
	}
	Error.captureStackTrace(this, arguments.callee);
};
app.set('NotFound', NotFound);
app.use(function(req, res, next){
	next(new NotFound(req.url));
});

app.set('NotFound', NotFound);

require('sys').inherits(NotFound, Error);

// Export for spark
module.exports = app;