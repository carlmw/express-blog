exports.listController = function(app){
	const ITEM_LIMIT = app.set('blog-details').item_limit;
	
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
};