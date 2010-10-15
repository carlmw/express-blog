const SECONDS_IN_MINUTE = 60, 
	  SECONDS_IN_HOUR = 3600,
	  SECONDS_IN_DAY = 86400
	  SECONDS_IN_MONTH = 2629743,
	  SECONDS_IN_YEAR = 31556926,

Date.prototype.toISO8601 = function(){
	var d = this.getUTCDate()+'',
		m = (this.getUTCMonth()+1)+'',
		y = this.getUTCFullYear()+'',
		h = this.getUTCHours()+'',
		mi = this.getUTCMinutes()+'',
		s = this.getUTCSeconds()+'';

	return y+'-'+((m.length == 1)?'0'+m:m)+'-'+((d.length == 1)?'0'+d:d)
		+'T'+((h.length == 1)?'0'+h:h)+':'+((mi.length == 1)?'0'+mi:mi)+':'+((s.length == 1)?'0'+s:s)+'Z';
};

Date.prototype.humanString = (function(){
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

	return function(){
		var d = this.getUTCDate()+' ',
			m = this.getUTCMonth(),
			y = ' '+this.getUTCFullYear();

		return d+months[m]+y;
	};
})();

Date.prototype.timeSince = function(){
	var t = (new Date().getTime()-this.getTime())/1000,
		d, n, unit;

	if(t < SECONDS_IN_MINUTE){
		return 'just now';
	}
	if(t < SECONDS_IN_HOUR){
		d = SECONDS_IN_MINUTE;
		unit = 'minute';
	}else if(t < SECONDS_IN_DAY){
		d = SECONDS_IN_HOUR;
		unit = 'hour';
	}else if(t < SECONDS_IN_MONTH){
		d = SECONDS_IN_DAY;
		unit = 'day';
	}else if(t < SECONDS_IN_YEAR){
		d = SECONDS_IN_MONTH;
		unit = 'month';
	}else{
		d = SECONDS_IN_YEAR;
		unit = 'year';
	}

	n = Math.floor(t/d);

	return n+' '+unit+((n>1)?'s':'')+' ago';
};

String.prototype.sanitise = function(){
	return this.trim().replace(/<([^>]*)>/, '&;lt;$1&gt');
};

exports.Helpers = (function(){
	var crypto = require('crypto');
	
	return {
		gravatar:function(email){
			return 'http://www.gravatar.com/avatar/'+
				crypto.createHash('md5').
					update(email.trim().toLowerCase()).digest('hex')+
				'?s=48';
		}
	};
})();