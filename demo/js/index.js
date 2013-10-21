

// demo for freewall layout;
// created by Minh Nguyen;
(function($) {
	
	var setting = {}, wall;
	
	var colour = [
		"#16A085",
		"#27AE60",
		"#2980B9",
		"#8E44AD",
		"#2C3E50",
		"#F39C12",
		"#D35400",
		"#C0392B",
		"#870000"
	];

	var func = {
		preload: function() {
			var images = []
			for (var i = 1 ; i < 50 ; ++i) {
				images[i] = new Image();
				images[i].src = "demo/i/photo/" + i + ".jpg";
				images[i].onload = function() {
					window["console"] && console.log(this.src);
				}
			}
		},
		color: function(value) {
			var color = colour.concat(colour);
			$(".free-wall .brick").each(function() {
				this.style.backgroundColor =  "" + color.splice(color.length * Math.random() << 0, 1);
				this.setAttribute("data-bgcolor", this.style.backgroundColor);
			});
		},
		layout: function() {
			var lwidth = $(window).width();
			wall = new freewall('.free-wall');
			//wall.container.width('auto')
			wall.reset({
				selector: '.brick',
				animate: true,
				cell: {
					width: 160,
					height: 160
				},
				onResize: function() {
					var cwidth = wall.container.width();
					wall.container.find('.full-width')
					.each(function(index, item){
						wall.fixSize({
							block: item,
							width: cwidth
						});
					});
					wall.fitWidth();
				}
			});
			wall.fitWidth();
			$(window).trigger("resize");

			wall.container.find(".brick").each(function() {
				var $item = $(this);
				$item.attr({
					"data-class": $item.attr("class"),
					"data-style": $item.attr("style")
				});
			});

			// for responsive demo;
			$(".reponsive-block li>a").click(function() {
				var viewWidth = $(window).width();
				var preWidth = $(this).data("width");
				
				if (preWidth != "auto" && (preWidth - viewWidth) > 0) {
					alert('The screen\'s width not enought to test this size');
					return;
				}

				$(".reponsive-block li>a").removeClass("active");
				var preWidth = $(this).data("width");
				var margin = "10px auto";
				preWidth == "auto" && (margin = "10px");
				wall.container.css({
					margin: margin,
					width: preWidth
				});

				$(this).addClass("active");
				var cwidth = wall.container.width();
				wall.container.find('.full-width')
				.each(function(index, item){
					wall.fixSize({
						block: item,
						width: cwidth * 0.88
					});
				});
				wall.fitWidth();
			});

			if ("onhashchange" in window) {
			    window.onhashchange = function () {
			        hashChanged(window.location.hash);
			    }
			} else {
			    var storedHash = window.location.hash;
			   	setInterval(function () {
			        if (window.location.hash != storedHash) {
			            storedHash = window.location.hash;
			            hashChanged(storedHash);
			        }
			    }, 100);
			}

			function hashChanged(hash) {
				if (!hash || hash == "#") {
					wall.container.find(".brick").each(function() {
						var $item = $(this).removeAttr("style");

						$item.removeAttr("data-width");
						$item.removeAttr("data-height");
						
						$item.attr({
							"class": $item.attr("data-class")
						});

						$item.css({
							backgroundColor: $item.attr("data-bgcolor")
						});
					});
					
					wall.unsetFilter();
					wall.fitWidth();

					$(".back-button").hide();
					$(".header")[0].scrollIntoView(true);
				} else {
					$(hash).trigger("click");
					$(".back-button").show();
				}
			}

			// for back-button;
			$(".back-button .back-icon").click(function() {
				window.location.hash = "";
			});
		},
		options: function() {
			$('.free-wall .options').click(function() {
				var cwidth = wall.container.width() - 10;
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					dna.addClass('full-width');
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 1200
					});
					wall.setFilter('.options');
					wall.fitWidth();
					window.location.hash = "options";
				}
			});
		},
		events: function() {
			$('.free-wall .events').click(function() {
				var cwidth = wall.container.width() - 10;
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					dna.addClass('full-width');
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 720
					});
					wall.setFilter('.events');
					wall.fitWidth();
					window.location.hash = "events";
				}
			});
		},
		methods: function() {
			$('.free-wall .methods').click(function() {
				var cwidth = wall.container.width() - 10;
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					dna.addClass('full-width');
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 1700
					});
					wall.setFilter('.methods');
					wall.fitWidth();
					window.location.hash = "methods";
				}
			});
		},
		filter: function() {
			$(".free-wall .filter").click(function() {
				var dna = $(this);
				if (!dna.hasClass('open')) {
					dna.addClass('open');
					wall.setFilter('.size22, .size11');
					wall.fixSize({
						block: dna,
						width: 320,
						height: 320
					});
					wall.fitWidth();
					window.location.hash = "demo-filter";
				}
			});
		},
		share: function() {
			var leftPosition, topPosition, width = 500, height = 300;
				leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
				topPosition = (window.screen.height / 2) - ((height / 2) + 50);
			var windowFeatures = "status=no, height=" + height + ", width=" + width + ", resizable=yes, left=" + leftPosition + ", top=" + topPosition + ", screenX=" + leftPosition + ", screenY=" + topPosition + ", toolbar=no, menubar=no, scrollbars=no, location=no, directories=no";
			
			$(".free-wall .facebook-share").click(function() {
				window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(location.href), 'sharer', windowFeatures);
			});

			$(".free-wall .google-share").click(function() {
				window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href), 'sharer', windowFeatures);
			});

			$(".free-wall .twitter-share").click(function() {
				window.open("https://twitter.com/intent/tweet?original_referer=''&url=''&text=" + encodeURIComponent(location.href) , '_blank', windowFeatures);
			});
		},
		finish: function() {
			if (window.location.hash && $(window.location.hash).length) {
				$(window.location.hash).trigger("click");
				$('.back-button').show();
			} 
		}
	};
	
	window.app = {
		config: function(key, data) {
			setting[key] = data;
		},
		setup: function(options) {
			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					func[i](options[i]);
				}
			}
			func['finish']();
		}
	};


})(jQuery);
