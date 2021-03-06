// https://api.instagram.com/v1/tags/javielskerukm/media/recent?client_id=d81afea83c3f40b5a5485418e2a53aa7


var Util = {
	getWindowHash: function() {
		return window.location.hash;
	},
	setWindowHash: function(hash) {
		if (typeof hash == "string") {
			window.location.hash = Util.removeLeadingHash(hash);
		}
	},
	removeLeadingHash: function (str) {
		if (typeof str == "string" && str.charAt(0) == '#') {
			return str.substring(1);
		}
		return str;
	}
}

var HashViewer = {
	CLIENT_ID: 'd81afea83c3f40b5a5485418e2a53aa7',
	next_url: undefined,
	last_tag: '',
	no_of_pictures: 0,

	reset: function() {
		HashViewer.no_of_pictures = 0;
		HashViewer.next_url = undefined;
		jQuery("#gallery").html('');
		jQuery("#more-btn").addClass('hidden');
	},

	splitHashtags: function(text) {
		var result = text[0];
		for(var i = 1; i < text.length; i++) {
			if(text[i]=='#' && text[i-1]!=' ') {
				result += ' ';
			}
			result += text[i];
		}
		return result;
	},

	createGalleryBlock: function(post) {
		var image = post.images.low_resolution;
		var user = post.user;
		var caption = post.caption;

		var out = '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">'
			out += '<div width="'+image.width+'px" class="gallery-block text-center">';
			out +=		'<a href="'+post.link+'"><img width="'+image.width+'px" class="gallery-image col-sm-12" src ="'+image.url+'" /></a><br/>';
			out +=		'<em>Username: <a href="http://instagram.com/'+user.username+'">'+user.username+'</a></em>';
			if (caption) {
				out +=	'<p>'+this.splitHashtags(caption.text)+'</p>';
			}
			out +=  '</div>' //width-fix END
			out += '</div>';
		
		return out;
	}, 

	displayError: function(message) {
		jQuery('#error-container').html('<span>'+message+'</span>').removeClass('hidden');
		console.log(message);
	},

	updateWindowHash: function() {
		console.log("updating window hash");
		 Util.setWindowHash( $("input[id='tag-text']").val() );
	},

	updateGallery: function(event, in_tag) {
		jQuery('#error-container').addClass('hidden');
		var tag = in_tag || Util.getWindowHash() || jQuery("input[id='tag-text']").val();
		tag = Util.removeLeadingHash(tag);
		if (tag == "") return;
		if (HashViewer.last_tag != tag) {
			HashViewer.reset();
			HashViewer.last_tag = tag;
		}

		url = HashViewer.next_url || 'https://api.instagram.com/v1/tags/'+tag+'/media/recent?client_id='+HashViewer.CLIENT_ID;
		console.log(url)

		jQuery.ajax({
			url: url,
			type: 'get',
			dataType: 'jsonp'
		})
		.done(function(res) {
			if (res.meta.code >= 400) { // if requests responds with HTTP error codes
				HashViewer.displayError("ERROR: "+res.meta.error_message);
			} else {
				var new_i;
				jQuery.each(res.data, function(i, post) {
					if (HashViewer.no_of_pictures %4==0) jQuery("#gallery").append('<div class="clearfix visible-lg visible-sm">');
					else if(HashViewer.no_of_pictures %2==0) jQuery("#gallery").append('<div class="clearfix visible-sm">');
					if (HashViewer.no_of_pictures %3==0) jQuery("#gallery").append('<div class="clearfix visible-md">');
					jQuery("#gallery").append(HashViewer.createGalleryBlock(post));
					HashViewer.no_of_pictures += 1;
					/**/
				});

				if (res.pagination.next_url) {
					jQuery("#more-btn").removeClass('hidden');
					HashViewer.next_url = res.pagination.next_url;
				} else {
					jQuery("#more-btn").addClass('hidden');
				}
			}

		})
		.fail(function(err) {
			console.log("fail");
			HashViewer.displayError("FAILURE:"+err);
		})
		.error(function(XHR, status, err) {
			console.log("error");
			HashViewer.displayError("ERROR:"+err);
		})
		
		return this;
	}
};

jQuery(document).ready(function($) {
	// $("button[id='tag-btn']").bind('click', HashViewer.updateWindowHash()); 

	$("input[id='tag-text']").keypress(function (e) { // enter-fix for search
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $("button[id='tag-btn']").click();
            $(this).blur();	
            return false;
        } else {
            return true;
        }
    });

	jQuery(window).bind('hashchange', function(event) {
		var tag = window.location.hash.slice(1);
		HashViewer.updateGallery(event, tag)
	});
	HashViewer.updateGallery();

});