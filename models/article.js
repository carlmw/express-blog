exports.ArticleModel = function(mongoose){
	// Article model
	mongoose.model('Article', {
		properties:[
			'url',
			'title',
			'excerpt',
			'body',
			'created',
			'updated',
			'published',
			'comments_open',
			'comments_disabled',
			{'categories':[]},
			{'tags':[]},
			{'comments':[[
				'author',
				'email',
				'url',
				'comment',
				'published',
				'updated'
			]]}
		],
		indexes:['tags', 'url'],
		getters: {
			created_date: function(){
				return this.created.toISO8601();
			},
			updated_date: function(){
				return this.updated.toISO8601();
			},
			updated_since: function(){
				return this.updated.timeSince();
			},
			tag_string: function(){
				return this.tags.join(' ');
			},
			category_string: function(){
				return this.categories.join(' ');
			},
			published_comments: function(){
				return this.comments.filter(function(v){
					return (v.published);
				});
			}
		},
		methods:{
			save: function(fn){
				if(this.isNew){
					this.created = new Date;
					this.updated = new Date;
					this.url = this.title.toLowerCase().
						replace(/^\s+|\s+$/g, "").
						replace(/[_|\s]+/g, "-").
						replace(/[^a-z0-9-]+/g, "").
						replace(/[-]+/g, "-").
						replace(/^-+|-+$/g, "");
				}
				this.__super__(fn);
			},
			pushComment: function(comment){
				comment.created = new Date();
				this.comments.push(comment);
			},
			validateComment: (function(){
				var validators = {
						author: {
							pattern:/^.{1,}$/,
							required:true
						},
						email: {
							pattern:/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
							required:true
						},
						url:{
							pattern:/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?/
						},
						comment:{
							pattern:/^.{8,}$/m,
							required:true
						}
					},
					Validate = require('../vendor/validate/lib/validate').Validate;

				return function(data){
					return new Validate(validators, data);
				};	
			})()
		},
		static:{
			fetch: function(where, page, limit, callback){
				return this.find(where).skip(limit * page).limit(limit + 1).sort([['created', 'descending']]).all(callback);
			}
		}
	});
};