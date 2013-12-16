
// created by Minh Nguyen;
// version 1.03;

(function($, doc, win) {
	
	// for zeptojs;
	$.isNumeric == null && ($.isNumeric = function(src) {
		return src != null && src.constructor === Number;
	});

	$.isFunction == null && ($.isFunction = function(src) {
		return src != null && src instanceof Function;
	});

	
	var layoutManager = {
		defaultSetting: {
			animate: false,
			cellW: 100, // function(container) {return 100;}
			cellH: 100, // function(container) {return 100;}
			delay: 0, // slowdown active block;
			engine: 'giot', // 'giot' is a person name;
			fixSize: null, // resize + adjust = fill gap;
			//fixSize: 0, allow adjust size = no fill gap;
			//fixSize: 1, no resize + no adjust = no fill gap;
			gutterX: 15, // width spacing between blocks;
			gutterY: 15, // height spacing between blocks;
			selector: ':only-child',
			draggable: false,
			rightToLeft: false,
			bottomToTop: false,
			onStartSet: function() {},
			onGapFound: function() {},
			onComplete: function() {},
			onResize: function() {},
			onSetBlock: function() {}
		},
		transition: false,
		index: 1,
		loadBlock: function(item, index, setting) {
			var runtime = setting.runtime,
				$item = $(item),
				block = null,
				id = runtime.lastId++ + '-' + this.index,
				gutterX = runtime.gutterX,
				gutterY = runtime.gutterY,
				fixSize = eval($item.attr('data-fixSize'));
			
			//ignore dragging block;
			if ($item.hasClass('fw-dragging')) return;
			$item.attr({id: id, 'data-delay': index});

			//remove animation for speed render;
			if (setting.animate && this.transition) {
				this.setTransition(item, "");
			}
			
			// store original size;
			$item.attr('data-height') == null && $item.attr('data-height', $item.height());
			$item.attr('data-width') == null && $item.attr('data-width', $item.width());
			var height = 1 * $item.attr('data-height');
			var width = 1 * $item.attr('data-width');

			var cellH = runtime.cellH;
			var cellW = runtime.cellW;
			
			var col = !width ? 0 : Math.round((width + gutterX) / (cellW + gutterX));
			var row = !height ? 0 : Math.round((height + gutterY) / (cellH + gutterY));

			// estimate size;
			if (!fixSize && setting.cellH == 'auto') {
				$item.width(col ? cellW * col + gutterX * (col - 1) : cellW * col);
				height = $item.height();
				row = !height ? 0 : Math.round((height + gutterY) / (cellH + gutterY));
			}

			if (!fixSize && setting.cellW == 'auto') {
				$item.height(row ? cellH * row + gutterY * (row - 1) : cellH * row);
				width = $item.width();
				col = !width ? 0 : Math.round((width + gutterX) / (cellW + gutterX));
			}
			
			// for none resize block;
			if ((fixSize != null) && (col > runtime.totalCol || row > runtime.totalRow)) {
				block = null;
			} else {
				// get smallest width and smallest height of block;
				// using for image runtime;
				row && row < runtime.minH && (runtime.minH = row);
				col && col < runtime.minW && (runtime.minW = col);

				// get biggest width and biggest height of block;
				row > runtime.maxH && (runtime.maxH = row);
				col > runtime.maxW && (runtime.maxW = col);

				width == 0 && (col = 0);
				height == 0 && (row = 0);

				block = {
					id: id,
					width: col,
					height: row,
					fixSize: fixSize
				};
			}

			// for css animation;
			if ($item.attr("data-state") == null) {
				$item.attr("data-state", "init");
			} else {
				$item.attr("data-state", "move");
			}

			return block;
		},
		setBlock: function(block, setting) {
			var runtime = setting.runtime;
			var gutterX = runtime.gutterX;
			var gutterY = runtime.gutterY;
			var height = block.height;
			var width = block.width;
			var cellH = runtime.cellH;
			var cellW = runtime.cellW;
			var x = block.x;
			var y = block.y;

			if (setting.rightToLeft) {
				x = runtime.totalCol - x - width;
			}
			if (setting.bottomToTop) {
				y = runtime.totalRow - y - height;
			}
			var realBlock = {
				fixSize: block.fixSize,
				top: y * (cellH + gutterY),
				left: x * (cellW + gutterX),
				width: width ? cellW * width + gutterX * (width - 1) : cellW * width,
				height: height ? cellH * height + gutterY * (height - 1) : cellH * height
			};
			
			realBlock.top = 1 * realBlock.top.toFixed(2);
			realBlock.left = 1 * realBlock.left.toFixed(2);
			realBlock.width = 1 * realBlock.width.toFixed(2);
			realBlock.height = 1 * realBlock.height.toFixed(2);

			block.id && ++runtime.length && (runtime.block[block.id] = realBlock);
			// for append feature;
			return realBlock;
		},
		showBlock: function(item, setting) {
			var runtime = setting.runtime;
			var method = setting.animate && !this.transition ? 'animate' : 'css';
			var block = runtime.block[item.id];
			var $item = $(item);
			var self = this;
			var start = $item.attr("data-state") != "move";
			var trans = start ? "width 0.5s, height 0.5s" : "top 0.5s, left 0.5s";
			
			item.delay && clearTimeout(item.delay);
			//ignore dragging block;
			if ($item.hasClass('fw-dragging')) return;
			
			// kill the old transition;
			self.setTransition(item, "");
			item.style.position = "absolute";
			setting.onStartSet.call(item, block, setting);
			
			function action() {
				// start to arrange;
				start && $item.attr("data-state", "start");
				// add animation by using css3 transition;
				if (setting.animate && self.transition) {
					self.setTransition(item, trans);
				}

				// for hidden block;
				if (!block) {
					$item[method]({
						opacity: 0,
						width: 0,
						height: 0
					});
				} else {
					if (block.fixSize) {
						block.height = 1 * $item.attr("data-height");
						block.width = 1 * $item.attr("data-width");
					}

					$item["css"]({
						opacity: 1,
						width: block.width,
						height: block.height
					});

					// for animating by javascript;
					$item[method]({
						top: block.top,
						left: block.left
					});

					runtime.length -= 1;
				}

				if ($item.attr('data-nested') != null) {
					self.nestedBlock(item, setting);
				}

				setting.onSetBlock.call(item, block, setting);

				runtime.length == 0 && setting.onComplete.call(item, block, setting);
			}

			setting.delay > 0 ? (item.delay = setTimeout(action, setting.delay * $item.attr("data-delay"))) : action(); 
		},
		nestedBlock: function(item, setting) {
			var runtime = setting.runtime;
			var $item = $(item);
			var gutterX = $item.attr("data-gutterX") || setting.gutterX;
			var gutterY = $item.attr("data-gutterY") || setting.gutterY;
			var method = $item.attr("data-method") || "fitZone";
			var nested = $item.attr('data-nested') || ":only-child";
			var cellH = $item.attr("data-cellH") || setting.cellH;
			var cellW = $item.attr("data-cellW") || setting.cellW;
			var block = runtime.block[item.id], innerWall;
			
			if (block) {
				innerWall = new freewall($item);
				innerWall.reset({
					cellH: cellH,
					cellW: cellW,
					gutterX: 1 * gutterX,
					gutterY: 1 * gutterY,
					selector: nested
				});

				switch (method) {
					case "fitHeight":
						innerWall[method](block.height);
						break;
					case "fitWidth":
						innerWall[method](block.width);
						break;
					case "fitZone":
						innerWall[method](block.width, block.height);
						break;
				}
			}
		},
		resetLayout: function(runtime) {
			runtime.length = 0;
			runtime.block = {};
			runtime.cellH = 0;
			runtime.cellW = 0;
			runtime.lastId = 1;
			runtime.matrix = null;
		},
		setDragable: function(item, opt) {
			var touch = false;
			var def = {
				sX: 0, //start clientX;
				sY: 0, 
				top: 0,
				left: 0,
				proxy: null,
				end: function() {},
				move: function() {},
				start: function() {}
			};
			
			$(item).each(function() {
				var set = $.extend({}, def, opt);
				var ele = set.proxy || this;
				var $ele = $(ele);
				
				var posStyle = $ele.css("position");
				posStyle != "absolute" && $ele.css("position", "relative");
				

				function mouseDown(evt) {
					evt.stopPropagation();
					evt = evt.originalEvent;

					if (evt.touches) {
						touch = true;
						evt = evt.changedTouches[0];
					}
					
					set.start.call(ele, evt);

					if (evt.button != 2 && evt.which != 3) {
						set.sX = evt.clientX;
						set.sY = evt.clientY;
						set.top = parseInt($ele.css("top")) || 0;
						set.left = parseInt($ele.css("left")) || 0;
						
						$(doc).bind("mouseup touchend", mouseUp);
						$(doc).bind("mousemove touchmove", mouseMove); 
					}

					return false;
				};
				
						
				function mouseMove(evt) {
					evt = evt.originalEvent;
					touch && (evt = evt.changedTouches[0]);
					
					$ele.css({
						top: set.top - (set.sY - evt.clientY),
						left: set.left - (set.sX - evt.clientX)
					});
					
					set.move.call(ele, evt);
				};
				
				function mouseUp(evt) {
					evt = evt.originalEvent;
					touch && (evt = evt.changedTouches[0]);
		
					set.end.call(ele, evt);

					$(doc).unbind("mouseup touchend", mouseUp);
				 	$(doc).unbind("mousemove touchmove", mouseMove);
				};

				// ignore drag drop on text field;
				$(this).find("iframe, form, input, textarea, .ignore-drag")
				.each(function() {
					$(this).on("touchstart mousedown", function(evt) {
						evt.stopPropagation();
					});
				});
				
				$(doc).unbind("mouseup touchend", mouseUp);
				$(doc).unbind("mousemove touchmove", mouseMove);
				$(this).unbind("mousedown touchstart").bind("mousedown touchstart", mouseDown);

			});
		},
		setTransition: function(item, trans) {
			var style = item.style,
				$item = $(item);
				
			// remove animation;
			if (!this.transition && $item.stop) {
				$item.stop();
			} else if (style.webkitTransition != null) {
				style.webkitTransition = trans;
			} else if (style.MozTransition != null) {
				style.MozTransition = trans;
			} else if (style.msTransition != null) {
				style.msTransition = trans;
			} else if (style.OTransition != null) {
				style.OTransition = trans;
			} else {
				style.transition = trans;
			}
		},
		setWallSize: function(runtime, container) {
			var totalRow = Math.max(1, runtime.totalRow);
			var totalCol = Math.max(1, runtime.totalCol);
			var gutterY = runtime.gutterY;
			var gutterX = runtime.gutterX;
			var cellH = runtime.cellH;
			var cellW = runtime.cellW;
			var totalWidth = cellW * totalCol + gutterX * (totalCol - 1);
			var totalHeight = cellH * totalRow + gutterY * (totalRow - 1);
			container.attr({
				'data-total-col': totalCol,
				'data-total-row': totalRow,
				'data-wall-width': Math.ceil(totalWidth),
				'data-wall-height': Math.ceil(totalHeight)
			});
		}
	};

	

	var engine = {
		// Giot just a person name;
		giot: function(items, setting) {
			var runtime = setting.runtime,
				row = runtime.totalRow,
				col = runtime.totalCol,
				x = 0,
				y = 0,
			    maxX = 0,
			    maxY = 0,
			    wall = {},
			    hole = runtime.hole,
			    block = null,
			    matrix = runtime.matrix || {},
			    bigLoop = Math.max(col, row),
			    freeArea = null,
			    misBlock = null,
			    fitWidth = col < row ? 1 : 0,
			    lastBlock = null,
			    smallLoop = Math.min(col, row);

			// fill area with top, left, width, height;
			function fillMatrix(id, t, l, w, h) { 
				for (var y = t; y < t + h;) {
					for (var x = l; x < l + w;) {
						matrix[y + '-' + x] = true;
						++x > maxX && (maxX = x);
					}
					++y > maxY && (maxY = y);
				}
				wall[id] && layoutManager.setBlock(wall[id], setting);
			}
			
			function getZone(t, l, w, h) {
				
				var maxY = Math.min(t + h, row);
				var maxX = Math.min(l + w, col);
				var minX = maxX;
				var minY = maxY;

				// find limit width and limit height of zone;
				for (var y = t; y < maxY; ++y) {
					for (var x = l; x < maxX; ++x) {
						if (matrix[y + '-' + x] == true) {
							(t < y && y < minY) && (minY = y);
							(l < x && x < minX) && (minX = x);
							}
					}
				}

				// find limit zone by horizon;
				var minLeft = maxX;
				for (var y = t; y < minY; ++y) {
					for (var x = l; x < maxX; ++x) {
						if (matrix[y + '-' + x] == true) {
							(l < x && x < minLeft) && (minLeft = x);
						}
					}
				}
				// find limit zone by vertical;
				var minTop = maxY;
				for (var y = t; y < maxY; ++y) {
					for (var x = l; x < minX; ++x) {
						if (matrix[y + '-' + x] == true) {
							(t < y && y < minTop) && (minTop = y);
						}
					}
				}

				var compare = minLeft * minY - minX * minTop;
				
				var free = {
					top: t,
					left: l,
					width: compare ? minLeft - l : minX - l,
					height: compare ? minY - t : minTop - t
				};

				return free;
			}

			// set a hole on the wall;
			if (hole.length) {
				for (var i = 0; i < hole.length; ++i) {
					fillMatrix(true, hole[i]['top'], hole[i]['left'], hole[i]['width'], hole[i]['height']);
				}
			}

			for (var b = 0; b < bigLoop; ++b) {
				if (!items.length) break;
				fitWidth ? (y = b) : (x = b);
				lastBlock = null;

				for (var s = 0; s < smallLoop; ++s) {
					if (!items.length) break;
					fitWidth ? (x = s) : (y = s);
					if (matrix[y + '-' + x]) continue;
					block = null;
					freeArea = getZone(y, x, runtime.maxW, runtime.maxH);
					for (var i = 0; i < items.length; ++i) {
						if (items[i].height > freeArea.height) continue;
						if (items[i].width > freeArea.width) continue;
						block = items.splice(i, 1)[0];
						break;
					}

					// trying resize the other block to fit gap;
					if (block == null && setting.fixSize == null) {
						// resize near block to fill gap;
						if (lastBlock && !fitWidth && runtime.minH > freeArea.height) {
							lastBlock.height += freeArra.height;
							fillMatrix(lastBlock.id, lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
							continue;
						} else if (lastBlock && fitWidth && runtime.minW > freeArea.width) {
							lastBlock.width += freeArea.width;
							fillMatrix(lastBlock.id, lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
							continue;
						} else {
							// get other block fill to gap;
							for (var i = 0; i < items.length; ++i) {
								if (items[i]['fixSize'] != null) continue;
								block = items.splice(i, 1)[0];
								if (fitWidth) {
									block.width = freeArea.width;
									// for fitZone;
									block.height = Math.min(block.height, freeArea.height);
								} else {
									// for fitZone;
									block.width = Math.min(block.width, freeArea.width);
									block.height = freeArea.height;
								}
								break;
							}
						}
					}
					
					if (block != null) {
						wall[block.id] = {
							id: block.id,
							x: x,
							y: y,
							width: block.width,
							height: block.height,
							fixSize: block.fixSize
						};
						
						// keep success block for next round;
						lastBlock = wall[block.id];
						fillMatrix(lastBlock.id, lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
					} else {
						// get expect area;
						var misBlock = {
							x: x,
							y: y,
							fixSize: 0
						};
						if (fitWidth) {
							misBlock.width = freeArea.width;
							misBlock.height = 0;
							var lastX = x - 1;
							var lastY = y;
							
							while (matrix[lastY + '-' + lastX]) {
								matrix[lastY + '-' + x] = true;
								misBlock.height += 1;
								lastY += 1;
							}
						} else {
							misBlock.height = freeArea.height;
							misBlock.width = 0;
							var lastY = y - 1;
							var lastX = x;
							
							while (matrix[lastY + '-' + lastX]) {
								matrix[y + '-' + lastX] = true;
								misBlock.width += 1;
								lastX += 1;
							}
						}
						setting.onGapFound(layoutManager.setBlock(misBlock, setting), setting);
					}
				}

			}

			runtime.matrix = matrix;
			runtime.totalRow = maxY;
			runtime.totalCol = maxX;
		}
	};



	win.freewall = function(selector) {
		
		var container = $(selector);
		if (container.css('position') == 'static') {
			container.css('position', 'relative');
		}
		var klass = this;
		var MAX = Number.MAX_VALUE;

		// default setting;
		var setting = $.extend({}, layoutManager.defaultSetting);
		// increase the instance index;
		layoutManager.index += 1;
		
		var runtime = {
			block: {}, // store all items;
			matrix: {},
			hole: [], // drop zone;
			busy: 0,
			
			maxW: 0, // max width of block;
			maxH: 0,
			minW: MAX, 
			minH: MAX, // min height of block;

			cellW: 0,
			cellH: 0, // unit adjust;
			
			filter: '', // filter selector;
			
			lastId: 0,
			length: 0,


			gutterX: 15, 
			gutterY: 15,
			
			totalCol: 1,
			totalRow: 1,

			currentMethod: null,
			currentArguments: []
		};


		setting.runtime = runtime;

		// check browser support transition;
		var style = document.body.style;
		(style.webkitTransition != null ||
		style.MozTransition != null ||
		style.msTransition != null ||
		style.OTransition != null ||
		style.transition != null) &&
		(layoutManager.transition = true);
		

		// setup resize event;
		$(win).resize(function() {
			if (runtime.busy) return;
			runtime.busy = 1;
			setTimeout(function() {
				runtime.busy = 0;
				setting.onResize.call(klass, container);
			}, 122);
			container.attr('data-min-width', Math.floor($(win).width() / 80) * 80);
		});

		container.attr('data-min-width', Math.floor($(win).width() / 80) * 80);

		function setDragable(item) {
			var cellH = runtime.cellH;
			var cellW = runtime.cellW;
			var gutterX = runtime.gutterX;
			var gutterY = runtime.gutterY;

			layoutManager.setDragable(item, {
				start: function(event) {
					if (setting.animate && layoutManager.transition) {
						layoutManager.setTransition(this, "");
					}
					this.style.zIndex = 999;
					$(this).addClass('fw-dragging');
				},
				move: function(evt, tracker) {
					var position = $(this).position();
					var top = Math.round(position.top / (cellH + gutterY));
					var left = Math.round(position.left/ (cellW + gutterX));
					var width = Math.round($(this).width() / (cellW + gutterX));
					var height = Math.round($(this).height() / (cellH + gutterY));
					top = Math.min(Math.max(0, top), runtime.totalRow - height);
					left = Math.min(Math.max(0, left), runtime.totalCol - width);
					klass.setHoles([{top: top, left: left, width: width, height: height}]);
					klass.refesh();
				},
				end: function() {
					var position = $(this).position();
					var top = Math.round(position.top / (cellH + gutterY));
					var left = Math.round(position.left/ (cellW + gutterX));
					var width = Math.round($(this).width() / (cellW + gutterX));
					var height = Math.round($(this).height() / (cellH + gutterY));
					$(this).removeClass('fw-dragging');
					top = Math.min(Math.max(0, top), runtime.totalRow - height);
					left = Math.min(Math.max(0, left), runtime.totalCol - width);

					$(this).css({
						top: top * (cellH + gutterY),
						left: left * (cellW + gutterX)
					});
					klass.fillHoles();
					this.style.zIndex = "auto";
				}
			});
		}
		
		$.extend(klass, {
			
			appendMore: function(items) {
				this.container.append(items);
				this.refesh();
				return this;
			},

			container: container,

			fillHoles: function() {
				runtime.hole = [];
				return this;
			},

			filter: function(filter) {
				runtime.filter = filter;
				this.refesh();
				return this;
			},

			fitHeight: function(height) {
				height = height ? height : container.height() || $(window).height();
				runtime.currentMethod = arguments.callee;
				runtime.currentArguments = arguments;
				layoutManager.resetLayout(runtime);

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				runtime.gutterX = gutterX;
				runtime.gutterY = gutterY;

				// dynamic type of unit;
				if (cellH == 'auto') {
					cellH = 20;
				} else if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}

				if (cellW == 'auto') {
					cellW = 20;
				} else if ($.isFunction(cellW)) {
					cellW = cellW.call(this, container);
				}

				// correct unit to number;
				cellW = 1 * cellW;
				cellH = 1 * cellH;
				cellH <= 1 && (cellH *= height);
				cellW <= 1 && (cellW = cellH);

				// estimate total rows;
				var totalRow = Math.max(1, Math.floor(height / cellH));

				// adjust size unit for fit height;
				if (!$.isNumeric(gutterY)) {
					gutterY = (height - totalRow * cellH) / Math.max(1, (totalRow - 1));
					gutterY = runtime.gutterY = Math.max(0, gutterY);
				} else {
					totalRow = Math.max(1, Math.round(height / (cellH + gutterY)));
				}

				if (!$.isNumeric(gutterX)) {
					runtime.gutterX = runtime.gutterY;
				}
				
				var deltaY = 0;
				// adjust cell unit for fit height;
				deltaY = (height + gutterY) / totalRow - (cellH + gutterY);
				runtime.cellH = cellH + deltaY;
				runtime.cellW = cellW + (deltaY * cellW / cellH);
				
				var allBlock = container.find(setting.selector).attr('id', '');
				var items, block = null, activeBlock = [];
				if (runtime.filter) {
					items = allBlock.filter(runtime.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}

				var totalCol = 666666;
				runtime.totalCol = totalCol;
				runtime.totalRow = totalRow;

				items.each(function(index, item) {
					block = layoutManager.loadBlock(item, ++index, setting);
					block && activeBlock.push(block);
				});
				
				engine[setting.engine](activeBlock, setting);
				layoutManager.setWallSize(runtime, container);

				allBlock.each(function(index, item) {
					setting.draggable && setDragable(item);
					layoutManager.showBlock(item, setting);
				});
			},

			fitWidth: function(width) {
				width = width ? width : container.width() || $(window).width();
				runtime.currentMethod = arguments.callee;
				runtime.currentArguments = arguments;
				layoutManager.resetLayout(runtime);

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				runtime.gutterX = gutterX;
				runtime.gutterY = gutterY;
				
				// dynamic type of unit;
				if (cellH == 'auto') {
					cellH = 2;
				} else if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}

				if (cellW == 'auto') {
					cellW = 2;
				} else if ($.isFunction(cellW)) {
					cellW = cellW.call(this, container);
				}

				// correct unit to number;
				cellW = 1 * cellW;
				cellH = 1 * cellH;
				cellW <= 1 && (cellW *= width);
				cellH <= 1 && (cellH = cellW);

				// estimate total columns;
				var totalCol = Math.max(1, Math.floor(width / cellW));

				// adjust unit size for fit width;
				if (!$.isNumeric(gutterX)) {
					gutterX = (width - totalCol * cellW) / Math.max(1, (totalCol - 1));
					gutterX = runtime.gutterX = Math.max(0, gutterX);
				} else {
					// correct total column with gutter;
					totalCol = Math.max(1, Math.round(width / (cellW + gutterX)));
				}

				if (!$.isNumeric(gutterY)) {
					runtime.gutterY = runtime.gutterX;
				}

				var deltaX = 0;
				// adjust cell unit for fit width;
				deltaX = (width + gutterX) / totalCol - (cellW + gutterX);
				runtime.cellW = cellW + deltaX;
				runtime.cellH = cellH + (deltaX * cellH / cellW);

				var allBlock = container.find(setting.selector).removeAttr('id');
				var items, block = null, activeBlock = [];
				if (runtime.filter) {
					items = allBlock.filter(runtime.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}
				
				var totalRow = 666666;
				runtime.totalCol = totalCol;
				runtime.totalRow = totalRow;

				items.each(function(index, item) {
					block = layoutManager.loadBlock(item, ++index, setting);
					block && activeBlock.push(block);
				});
				engine[setting.engine](activeBlock, setting);
				layoutManager.setWallSize(runtime, container);
				
				// ignore incase nested grid;
				if (!container.attr('data-height')) {
					container.height(container.attr("data-wall-height"));
				}
 				 
				allBlock.each(function(index, item) {
					setting.draggable && setDragable(item);
					layoutManager.showBlock(item, setting);
				});
			},

			fitZone: function(width, height) {
				height = height ? height : container.height() || $(window).height();
				width = width ? width : container.width() || $(window).width();
				runtime.currentMethod = arguments.callee;
				runtime.currentArguments = arguments;
				layoutManager.resetLayout(runtime);
				
				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				runtime.gutterX = gutterX;
				runtime.gutterY = gutterY;

				// dynamic type of unit;
				if (cellH == 'auto') {
					cellH = 20;
				} else if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}

				if (cellW == 'auto') {
					cellW = 20;
				} else if ($.isFunction(cellW)) {
					cellW = cellW.call(this, container);
				}

				// correct unit to number;
				cellW = 1 * cellW;
				cellH = 1 * cellH;
				cellW <= 1 && (cellW *= width);
				cellH <= 1 && (cellH *= height);

				// estimate total columns;
				var totalCol = Math.max(1, Math.floor(width / cellW));
				// estimate total rows;
				var totalRow = Math.max(1, Math.floor(height / cellH));
				
				// adjust unit size for fit width;
				if (!$.isNumeric(gutterX)) {
					gutterX = (width - totalCol * cellW) / Math.max(1, (totalCol - 1));
					gutterX = runtime.gutterX = Math.max(0, gutterX);
				} else {
					// correct total column with gutter;
					totalCol = Math.max(1, Math.round(width / (cellW + gutterX)));
				}

				// adjust size unit for fit height;
				if (!$.isNumeric(gutterY)) {
					gutterY = (height - totalRow * cellH) / Math.max(1, (totalRow - 1));
					gutterY = runtime.gutterY = Math.max(0, gutterY);
				} else {
					totalRow = Math.max(1, Math.round(height / (cellH + gutterY)));
				}

				var deltaX = 0, deltaY = 0;
				// adjust cell unit for fit width;
				deltaX = (width + gutterX) / totalCol - (cellW + gutterX);
				runtime.cellW = cellW + deltaX;

				// adjust cell unit for fit height;
				deltaY = (height + gutterY) / totalRow - (cellH + gutterY);
				runtime.cellH = cellH + deltaY;

				var allBlock = container.find(setting.selector).attr('id', '');
				var items, block = null, activeBlock = [];
				if (runtime.filter) {
					items = allBlock.filter(runtime.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}

				runtime.totalCol = totalCol;
				runtime.totalRow = totalRow;

				items.each(function(index, item) {
					block = layoutManager.loadBlock(item, ++index, setting);
					block && activeBlock.push(block);
				});

				engine[setting.engine](activeBlock, setting);
				layoutManager.setWallSize(runtime, container);


				allBlock.each(function(index, item) {
					setting.draggable && setDragable(item);
					layoutManager.showBlock(item, setting);
				});
			},
			
			fixSize: function(option) {
				var config = {
					block: null,
					width: null,
					height: null
				};
				$.extend(config, option);
				
				config.width != null && $(config.block).attr({'data-width': config.width});
				config.height != null && $(config.block).attr({'data-height': config.height});

				return this;
			},

			prepend: function(items) {
				this.container.prepend(items);
				this.refesh();
				return this;
			},

			refesh: function() {
				var args = arguments.length ? arguments : runtime.currentArguments;
				runtime.currentMethod.apply(this, Array.prototype.slice.call(args, 0));
			},

			reset: function(option) {
				$.extend(setting, option);
				return this;
			},

			setHoles: function(hole) {
				/*
				the hole example: 
				[{
					top: 2,
					left: 2,
					width: 2,
					height: 2
				}]
				*/
				runtime.hole = hole;
				return this;
			},

			unFilter: function() {
				delete runtime.filter;
				this.refesh();
				return this;
			}
			
		});
	};

	freewall.createPlugin = function(pluginData) {
		/*
		pluginData = {
			setting: {},
			plugin: {}
		};
		*/

		// register new plugin;
		$.extend(layoutManager.plugin, {plugin: {}}, pluginData.plugin);
		// extend defaultSetting;
		$.extend(layoutManager.defaultSetting, {setting: {}}, pluginData.setting);
	};
 
})(window.Zepto || window.jQuery, document, window);
