

// demo for freewall layout;
// created by Minh Nguyen;
(function($) {
	
	var setting = {},
		wall,
		demo,
		ewall;
	
	var colour = [
		"#0C465D",
		"#608A0D",
		"#760B48",
		"#94530D",
		"#181867",
		"#450E63",
		"#8A0D25",
		"#503b22"
	];

	var func = {
		color: function(value) {
			var color = colour.concat(colour);
			$(".free-wall .brick").each(function() {
				$(this).css({
					backgroundColor:  color.splice(color.length * Math.random() << 0, 1)
					//backgroundColor: '#' + (16777216 * Math.random() << 0).toString(16)
				});
			});
		},
		layout: function() {
			var lwidth = $(window).width();
			wall = new freewall('.free-wall');
			wall.container.width('96%')
			wall.reset({
				selector: '.brick',
				animate: true,
				block: {
					flex: true
				},
				cell: {
					width: 160,
					height: 160
				},
				fillGap: false,
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
					ewall && ewall.fitWidth(cwidth);
				}
			});
			wall.fitWidth();
			demo = wall.container.find('.example');

			// for responsive demo;
			$(".reponsive-block li>a").click(function() {
				$(".reponsive-block li>a").removeClass("active");
				var preWidth = $(this).data("width");
				$(this).addClass("active");
				wall.container.width(preWidth);
				
				var cwidth = wall.container.width();
				wall.container.find('.full-width')
				.each(function(index, item){
					wall.fixSize({
						block: item,
						width: cwidth
					});
				});
				wall.fitWidth();
				ewall && ewall.fitWidth(cwidth);
				
			});

		},
		options: function() {
			$('.free-wall .options').click(function() {
				var cwidth = wall.container.width();
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
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".options");
				dna.removeClass('full-width');
				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 320,
					height: 320
				});
				wall.fitWidth();
			});
		},
		events: function() {
			$('.free-wall .events').click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					dna.addClass('full-width');
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 480
					});
					wall.setFilter('.events');
					wall.fitWidth();
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".events");
				dna.removeClass('full-width');
				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
		},
		methods: function() {
			$('.free-wall .methods').click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					dna.addClass('full-width');
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 1500
					});
					wall.setFilter('.methods');
					wall.fitWidth();
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".methods");
				dna.removeClass('full-width');
				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 320,
					height: 320
				});
				wall.fitWidth();
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
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".filter");
				dna.removeClass('open');
				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
		},
		fitHeight: function() {
			$(".free-wall .fit-height").click(function() {
				var dna = $(this);
				if (!dna.hasClass('open')) {
					dna.addClass('open');
					wall.fixSize({
						block: dna,
						width: 320,
						height: 320
					});
					wall.fitHeight(340);
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".fit-height");
				dna.removeClass('open');
				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
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
		layoutFlex: function() {
			
			$(".free-wall .flex-layout").click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					wall.container.attr('data-layout', 'flex');
					dna.addClass('full-width');
					
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 480
					});
					wall.setFilter('.flex-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-image: url(i/photo/{index}.jpg)'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 49;
					for (var i = 0; i < limitItem; ++i) {
						h = 1 + 3 * Math.random() << 0;
						w = 1 + 3 * Math.random() << 0;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h*150)
								.replace(/\{width\}/g, w*150)
								.replace("{index}", i + 1);
					}
					demo.html(html);
					ewall = new freewall(demo);
				
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: 1
						},
						cell: {
							width: 160,
							height: 160
						},
						fillGap: true
					});
					ewall.fitWidth(cwidth);
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".flex-layout");
				wall.container.removeAttr('data-layout');
				dna.removeClass('full-width');
				demo.html("");

				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
		},
		layoutGrid: function() {
			
			$(".free-wall .grid-layout").click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					wall.container.attr('data-layout', 'grid');
					dna.addClass('full-width');
					
					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 480
					});
					wall.setFilter('.grid-layout, .example');
					wall.fitWidth();
					
					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-image: url(i/photo/{index}.jpg)'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 49;
					for (var i = 0; i < limitItem; ++i) {
						h = 180;
						w = 180;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h)
								.replace(/\{width\}/g, w)
								.replace("{index}", i + 1);
					}
					demo.html(html);
					ewall = new freewall(demo);
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: 1
						},
						cell: {
							width: 180,
							height: 180
						},
						fillGap: false
					});
					ewall.fitWidth(cwidth);
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".grid-layout");
				wall.container.removeAttr('data-layout');
				dna.removeClass('full-width');
				demo.html("");

				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
		},
		layoutImage: function() {
			
			$(".free-wall .image-layout").click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					wall.container.attr('data-layout', 'image');
					dna.addClass('full-width');

					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 480
					});
					wall.fixSize({
						block: demo,
						width: 0,
						height: 0
					});
					wall.setFilter('.image-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-image: url(i/photo/{index}.jpg)'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 49;
					for (var i = 0; i < limitItem; ++i) {
						h = 1;
						w = 90 +  30 * (5 * Math.random() << 0);
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h*150)
								.replace(/\{width\}/g, w)
								.replace("{index}", i + 1);
					}
					demo.html(html);

					ewall = new freewall(demo);
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: true
						},
						cell: {
							width: 30,
							height: 160
						},
						fillGap: 1
					});
					ewall.fitWidth(cwidth);
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".image-layout");
				wall.container.removeAttr('data-layout');
				dna.removeClass('full-width');
				demo.html("");

				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
		},
		layoutPinterest: function() {

			$(".free-wall .pinterest-layout").click(function() {
				var cwidth = wall.container.width();
				var dna = $(this);
				if (!dna.hasClass('full-width')) {
					wall.container.attr('data-layout', 'pinterest');
					dna.addClass('full-width');

					wall.fixSize({
						block: dna,
						width: cwidth,
						height: 500
					});
					wall.fixSize({
						block: demo,
						width: 0,
						height: 0
					});
					wall.setFilter('.pinterest-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-image: url(i/photo/{index}.jpg)'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 49;
					for (var i = 0; i < limitItem; ++i) {
						h = 200 + 200 * Math.random() << 0;
						w = 2;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h)
								.replace(/\{width\}/g, w*120)
								.replace("{index}", i + 1);
					}
					demo.html(html);

					ewall = new freewall(demo);
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: 1
						},
						cell: {
							width: 120,
							height: 10
						},
						gutter: 'auto',
						fillGap: false
					});
					ewall.fitWidth(cwidth);
				}
			}).find(".back-icon").click(function(evt) {
				evt.stopPropagation();
				var dna = $(this).parents(".pinterest-layout");
				wall.container.removeAttr('data-layout');
				dna.removeClass('full-width');
				demo.html("");

				wall.unsetFilter();
				wall.fixSize({
					block: dna,
					width: 160,
					height: 160
				});
				wall.fitWidth();
			});
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
		}
	};


})(jQuery);
