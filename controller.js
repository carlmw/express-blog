exports.Controller = function(app){
	var db = app.set('db'),
		conf = app.set('blog-details');
		
	const ITEM_LIMIT = conf.item_limit;
	
	// GET single post
	app.get('/post/:url', function(req, res, next){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article){
				next();
			}
			res.render('article', {
				locals:{
					title: article.title,
					article: article,
					errors: []
				}
			});
		});
	});
	
	// POST single post comment
	app.post('/post/:url', function(req, res){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article || !article.comments_open){
				throw new NotFound;
			}
		
			// Validate the new comment and insert if valid
			var validate = article.validateComment(req.body);

			if(!validate.isValid){
				res.render('article', {
					locals:{
						title: article.title,
						article: article,
						errors: validate.failed
					}
				});
			}else{
				article.pushComment({
					author: req.body.author.sanitise(),
					email: req.body.email.sanitise(),
					url: req.body.url.sanitise(),
					comment: req.body.comment.sanitise()
				});
				article.save(function(){
					req.flash('saved', 'Comment saved; your comment must be approved before it will be published.');
					res.redirect(req.url);
				});
			}
		});
	});

	// GET articles matching tag
	app.get(/\/(tag)\/([^\/]*)\/?(page\/(\d))?$/, function(req, res){
		var page = (parseInt(req.params[3])||1)-1;
		
		app.set('db').model('Article').fetch({published: true, tags: req.params[1]}, page, ITEM_LIMIT, function(articles){
			res.render('index', {
				locals:{
					articles: articles
				}
			});
		});
	});

	// GET Articles matching category
	app.get(/\/(category)\/([^\/]*)\/?(page\/(\d))?$/, function(req, res){
		var page = (parseInt(req.params[3])||1)-1;
		
		app.set('db').model('Article').fetch({published: true, categories: req.params[1]}, page, ITEM_LIMIT, function(articles){
			res.render('index', {
				locals:{
					articles: articles
				}
			});
		});
	});
	
	// GET Index
	app.get(/\/(page\/(\d))?$/, function(req, res){
		var page = (parseInt(req.params[1])||1)-1;

		app.set('db').model('Article').fetch({published: true}, page, ITEM_LIMIT, function(articles){
			res.render('index', {
				locals:{
					articles: articles
				}
			});
		});
	});
	
	// GET Atom feed
	app.get('/feed', function(req, res){
		res.header('Content-Type', 'application/atom+xml');
		db.model('Article').fetch({published: true, categories: 'article'},0 , 10, function(articles){
			res.render('feed', {
				locals:{
					articles: articles
				},
				layout:false
			});
		});
	});

	// Admin


	// Errors
	app.error(function(err, req, res, next){
		if(err instanceof NotFound){
			res.render('404', {
				locals: {
					title: 'File Not Found',
					error: err
				}
			});
		}else{
			next(err);
		}
	});

	app.error(function(err, req, res){
		console.log(err);
		res.render('500', {
			locals: {
				title: 'Internal Server Error',
				error: err
			} 
		});
	});

	app.get('/404', function(req, res){
		res.header('HTTP/1.1 404 Not Found');
		throw new NotFound;
	});

	app.get('/500', function(req, res, next){
		next(new Error('Internal Server Error'));
	});
	
	function NotFound(path){
		this.name = 'NotFound';
		if(path){
			Error.call(this, 'Cannot find ' + path);
			this.path = path;
		}else{
			Error.call(this, 'Not Found');
		}
		Error.captureStackTrace(this, arguments.callee);
	};
	app.use(function(req, res, next){
		next(new NotFound(req.url));
	});

	require('sys').inherits(NotFound, Error);
};