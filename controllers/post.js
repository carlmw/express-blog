exports.postController = function(app){
	// GET single post
	app.get('/post/:url', function(req, res, next){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article){
				return next();
			}

			res.render('article', {
				locals:{
					title: article.title,
					article: article
				}
			});
		});
	});
	
	// POST single post comment
	app.post('/post/:url', function(req, res){
		app.set('db').model('Article').find({url: req.params.url}).one(function(article){
			if(!article || !article.comments_open){
				next();
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
};