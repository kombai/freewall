

// demo for freewall layout;
// create by Minh Nguyen;
(function($) {
	
	var setting = {};

	var wall, demo;
	
	var colour = [
		"rgb(25, 42, 27)",
		"rgb(43, 44, 83)",
		"rgb(47, 118, 197)",
		"rgb(56, 36, 74)",
		"rgb(57, 137, 34)",
		"rgb(62, 68, 9)",
		"rgb(73, 70, 57)",
		"rgb(75, 35, 130)",
		"rgb(77, 55, 90)",
		"rgb(89, 42, 112)",
		"rgb(93, 16, 27)",
		"rgb(108, 76, 105)",
		"rgb(110, 114, 24)",
		"rgb(114, 43, 129)",
		"rgb(126, 80, 8)",
		"rgb(131, 73, 4)",
		"rgb(135, 111, 33)",
		"rgb(136, 61, 204)",
		"rgb(137, 34, 6)",
		"rgb(151, 16, 12)",
		"rgb(156, 127, 182)",
		"rgb(158, 42, 10)",
		"rgb(162, 21, 179)",
		"rgb(173, 49, 162)",
		"rgb(184, 35, 118)"
	];

	var func = {

		color: function(value) {
			$(".free-wall .brick").each(function() {
				$(this).css({
					backgroundColor:  colour[colour.length * Math.random() << 0]
					//backgroundColor: '#' + (16777216 * Math.random() << 0).toString(16)
				});
			});
		},
		layout: function() {
			var lwidth = $(window).width();
			wall = new freewall('.free-wall');
			lwidth < 1100 ? wall.container.width('100%') : wall.container.width('80%'); 
			wall.reset({
				selector: '.brick',
				animate: true,
				block: {
					flex: true
				},
				cell: {
					width: 150,
					height: 150
				},
				fillGap: false,
				onResize: function() {
					var lwidth = $(window).width();
					lwidth < 1100 ? wall.container.width('100%') : wall.container.width('80%');
					var cwidth = wall.container.width();
					wall.container.find('.full-width').each(function(index, item){
						wall.fixSize({
							block: item,
							width: cwidth
						});
					});
					this.fitWidth();
				}
			});
			wall.fitWidth();
			demo = wall.container.find('.example');
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
						height: 1100
					});
					wall.setFilter('.options');
					wall.fitWidth();
				} else {
					dna.removeClass('full-width');
					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 300,
						height: 300
					});
					wall.fitWidth();
				}
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
				} else {
					dna.removeClass('full-width');
					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 300,
						height: 150
					});
					wall.fitWidth();
				}
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
						height: 1300
					});
					wall.setFilter('.methods');
					wall.fitWidth();
				} else {
					dna.removeClass('full-width');
					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 300,
						height: 300
					});
					wall.fitWidth();
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
						width: 300,
						height: 300
					});
					wall.fitWidth();
				} else {
					dna.removeClass('open');
					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
				}
			});
		},
		fitHeight: function() {
			$(".free-wall .fit-height").click(function() {
				var dna = $(this);
				if (!dna.hasClass('open')) {
					dna.addClass('open');
					wall.fixSize({
						block: dna,
						width: 300,
						height: 150
					});
					wall.fitHeight(320);
				} else {
					dna.removeClass('open');
					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
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

			 $(".free-wall .twitter-share").click(function() {
				window.open("https://twitter.com/intent/tweet?original_referer=''&url=''&text=" + encodeURIComponent(location.href) , '_blank', windowFeatures);
			});
		},
		layoutFlex: function() {
			
			var dheight = 450;
			var dwidth = 300;

			$(".free-wall .flex-layout").click(function() {
				var cwidth = wall.container.width() - dwidth;
				var dna = $(this);
				if (!dna.hasClass('open')) {
					wall.container.attr('data-layout', 'flex');
					dna.addClass('open');
					
					wall.fixSize({
						block: dna,
						width: dwidth,
						height: dheight
					});
					wall.setFilter('.flex-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-color: {color}'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 72;
					for (var i = 0; i < limitItem; ++i) {
						h = 1 + 3 * Math.random() << 0;
						w = 1 + 3 * Math.random() << 0;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h*150)
								.replace(/\{width\}/g, w*150)
								.replace("{color}", c);
					}
					demo.html(html);
					var ewall = new freewall(demo);
				
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: 1
						},
						cell: {
							width: 150,
							height: 150
						},
						fillGap: true
					});
					ewall.fitWidth(cwidth);
				} else {
					wall.container.removeAttr('data-layout');
					dna.removeClass('open');
					demo.html("");

					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
				}
			});
		},
		layoutGrid: function() {
			
			var dheight = 450;
			var dwidth = 300;

			$(".free-wall .grid-layout").click(function() {
				var cwidth = wall.container.width() - dwidth;
				var dna = $(this);
				if (!dna.hasClass('open')) {
					wall.container.attr('data-layout', 'grid');
					dna.addClass('open');
					
					wall.fixSize({
						block: dna,
						width: dwidth,
						height: dheight
					});
					wall.setFilter('.grid-layout, .example');
					wall.fitWidth();
					
					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-color: {color}'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 72;
					for (var i = 0; i < limitItem; ++i) {
						h = 180;
						w = 180;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h)
								.replace(/\{width\}/g, w)
								.replace("{color}", c);
					}
					demo.html(html);
					var ewall = new freewall(demo);
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
				} else {
					wall.container.removeAttr('data-layout');
					dna.removeClass('open');
					demo.html("");

					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
				}
			});
		},
		layoutImage: function() {
			
			var dheight = 450;
			var dwidth = 300;

			$(".free-wall .image-layout").click(function() {
				var cwidth = wall.container.width() - dwidth;
				var dna = $(this);
				if (!dna.hasClass('open')) {
					wall.container.attr('data-layout', 'image');
					dna.addClass('open');

					wall.fixSize({
						block: dna,
						width: dwidth,
						height: dheight
					});
					wall.fixSize({
						block: demo,
						width: 0,
						height: 0
					});
					wall.setFilter('.image-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-color: {color}'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 72;
					for (var i = 0; i < limitItem; ++i) {
						h = 1;
						w = 90 +  30 * (5 * Math.random() << 0);
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h*150)
								.replace(/\{width\}/g, w)
								.replace("{color}", c);
					}
					demo.html(html);

					var ewall = new freewall(demo);
					ewall.reset({
						selector: '.cell',
						animate: false,
						block: {
							flex: true
						},
						cell: {
							width: 30,
							height: 150
						},
						fillGap: 1
					});
					ewall.fitWidth(cwidth);
				} else {
					wall.container.removeAttr('data-layout');
					dna.removeClass('open');
					demo.html("");

					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
				}
			});
		},
		layoutPinterest: function() {

			var dheight = 450;
			var dwidth = 300;

			$(".free-wall .pinterest-layout").click(function() {
				var cwidth = wall.container.width() - dwidth;
				var dna = $(this);
				if (!dna.hasClass('open')) {
					wall.container.attr('data-layout', 'pinterest');
					dna.addClass('open');

					wall.fixSize({
						block: dna,
						width: dwidth,
						height: dheight
					});
					wall.fixSize({
						block: demo,
						width: 0,
						height: 0
					});
					wall.setFilter('.pinterest-layout, .example');
					wall.fitWidth();

					var temp = "<div class='cell' style='width:{width}px; height: {height}px; background-color: {color}'></div>";
					var w = 1, h = 1, c ='', html = '', limitItem = 72;
					for (var i = 0; i < limitItem; ++i) {
						h = 200 + 200 * Math.random() << 0;
						w = 2;
						c = '#' + (16777216 * Math.random() << 0).toString(16);
						html += temp.replace(/\{height\}/g, h)
								.replace(/\{width\}/g, w*120)
								.replace("{color}", c);
					}
					demo.html(html);

					var ewall = new freewall(demo);
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
						fillGap: false
					});
					ewall.fitWidth(cwidth);
				} else {
					wall.container.removeAttr('data-layout');
					dna.removeClass('open');
					demo.html("");

					wall.unsetFilter();
					wall.fixSize({
						block: dna,
						width: 150,
						height: 150
					});
					wall.fitWidth();
				}
			});
		}
	};
	
	window.vnjs = {
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
