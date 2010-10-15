exports.adminController = function(app){
	var blog = app.set('blog-details');
	
	// GET login page
	app.get('/auth', function(req, res){
		req.session.admin = false;
		res.render('auth');
	});

	// POST login page
	app.post('/auth', function(req, res){
		
		// Hash the incoming password
		var password = require('crypto').createHash('md5').update(req.body.password);
		
		if(req.body.username == blog.username && password.toString('ascii') == blog.password){
			req.session.admin = true;
			res.redirect('/manage');
		}else{
			res.redirect('/auth');
		}
	});

	// GET admin index
	app.get('/manage', function(req, res){
		if(!req.session.admin){
			res.redirect('/auth');
		}
		
		// List entries
		app.set('db').model('Article').find().sort([['_id','descending']]).all(function(articles){
			res.render('admin', {
				locals:{
					articles: articles
				}
			});
		});
	});

	// POST admin index, new post
	app.post('/manage/new', function(req, res){
		var Article = app.set('db').model('Article'),
			body = req.body;
			
		// Create a new post
		new Article({
			title: body.title.trim(),
			excerpt: body.excerpt.trim(),
			body: body.body.trim(),
			published: (body.published)?true:false,
			comments_open: (body.comments_open)?true:false,
			comments_disabled: (body.comments_disabled)?true:false,
			tags: body.tags.split(' '),
			categories: body.categories.split(' '),
		}).save(function(){
			res.redirect('/manage');
		});
	});

	// GET single post
	app.get('/manage/edit/:url', function(req, res, next){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article){
				next();
			}

			res.render('edit', {
				locals:{
					article: article
				}
			});
		});
	});

	app.post('/manage/edit/:url', function(req, res, next){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article){
				next();
			}
			
			var body = req.body;
			
			// Delete
			if(body.remove){
				article.remove(function(){
					res.redirect('/manage');
				});
			}
			
			// Update properties
			article.title = body.title.trim();
			article.excerpt = body.excerpt.trim();
			article.updated = new Date;
			article.body = body.body.trim();
			article.published = (body.published)?true:false;
			article.comments_open = (body.comments_open)?true:false;
			article.comments_disabled = (body.comments_disabled)?true:false;
			article.tags = body.tags.trim().split(' ');
			article.categories = body.categories.trim().split(' ');
			
			// Update comments
			var comments = body.comments;
			for(var i in comments){
				article.comments[i].comment = comments[i].comment;
				article.comments[i].published = (comments[i].published)?true:false;
				if(comments[i].remove){
					delete article.comments[i];
				}
			}
			article.comments = article.comments.filter(function(v){
				return (v != null);
			})

			// Save
			article.save(function(){
				res.redirect(req.url);
			});
		});
	});	
};