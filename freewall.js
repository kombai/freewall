
// created by Minh Nguyen;
// version 1.02;

(function($) {

	self.freewall = function(selector) {
		
		var flexIndex = Number.fw ? ++Number.fw : Number.fw = 1;
		var klass = this;
		var MAX = Number.MAX_VALUE;
		var container = $(selector);
		if (container.css('position') == 'static') {
			container.css('position', 'relative');
		}

		// default setting;
		var setting = {
			animate: true,
			cellW: 100, // function(container) {return 100;}
			cellH: 100, // function(container) {return 100;}
			delay: 0, // slowdown active block;
			engine: 'giot', // 'giot' is a person name;
			fixSize: null, // resize + adjust = fill gap;
			//fixSize: 0, allow adjust size = no fill gap;
			//fixSize: 1, no resize + no adjust = no fill gap;
			gutterX: 15, // width spacing between blocks;
			gutterY: 15, // height spacing between blocks;
			selector: '.item',
			onGapFound: function() {},
			onComplete: function() {},
			onResize: function() {},
			onSetBlock: function() {}
		};
		
		var layout = {
			block: {}, // store all items;
			grid: {},
			busy: 0,

			cellW: 0,
			cellH: 0, // unit adjust;
			
			filter: '', // filter selector;
			
			lastId: 0,
			length: 0,

			refesh: 0, // refresh layout after append new item;

			minCol: MAX,
			minRow: MAX,

			gutterX: 10, 
			gutterY: 10,
			
			totalCol: 1,
			totalRow: 1,
			
			transition: 0
		};

		// check browser support transition;
		var style = document.body.style;
		(style.webkitTransition != null ||
		style.MozTransition != null ||
		style.msTransition != null ||
		style.OTransition != null ||
		style.transition != null) &&
		(layout.transition = true);
	    
		container.attr('data-min-width', Math.floor($(self).width() / 80) * 80);
		
		// for zeptojs;
		$.isNumeric == null && ($.isNumeric = function(src) {
			return src != null && src.constructor === Number;
		});

		$.isisFunction == null && ($.isFunction = function(src) {
			return src != null && src instanceof Function;
		});

		// setup resize event;
		$(window).resize(function() {
			if (layout.busy) return;
			layout.busy = 1;
			setTimeout(function() {
				layout.busy = 0;
				setting.onResize["call"](klass, container);
			}, 255);
			container.attr('data-min-width', Math.floor($(window).width() / 80) * 80);
		});


		function loadBlock(item, index) {
			var $item = $(item), block = null, id = layout.lastId++ + '-' + flexIndex;
			var gutterX = layout.gutterX, gutterY = layout.gutterY;
			// store original size;
			$item.attr('data-height') == null && $item.attr('data-height', $item.height());
			$item.attr('data-width') == null && $item.attr('data-width', $item.width());
			$item.attr({ id: id, 'data-delay': index });
			var fixSize = eval($item.attr('data-fixSize'));
			fixSize == null && (fixSize = setting.fixSize);

			var height = 1 * $item.attr('data-height');
			var width = 1 * $item.attr('data-width');
			var cellW = layout.cellW;
			var cellH = layout.cellH;
			
			var col = !width ? 0 : Math.round((width + gutterX) / (cellW + gutterX));
			var row = !height ? 0 : Math.round((height + gutterY) / (cellH + gutterY));
			
			// for none resize block;
			if ((fixSize != null) && (col > layout.totalCol || row > layout.totalRow)) {
				block = null;
			} else {
				// get min width and min height;
				row < layout.minRow && (layout.minRow = row);
				col < layout.minCol && (layout.minCol = col);
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
		}

		function setBlock(block) {
			var gutterX = layout.gutterX;
			var gutterY = layout.gutterY;
			var height = block.height;
			var width = block.width;
			var cellH = layout.cellH;
			var cellW = layout.cellW;
			var x = block.x;
			var y = block.y;

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

			block.id && ++layout.length && (layout.block[block.id] = realBlock);
			// for append feature;
			return realBlock;
		}

		function showBlock(item, id) {
			var method = setting.animate && !layout.transition ? 'animate' : 'css';
			var $item = $(item);
			var style = item.style;
			var start = $item.attr("data-state") != "move";
			var trans = start ? "width 0.5s, height 0.5s" : "top 0.5s, left 0.5s";
			
			if (setting.animate && layout.transition) {
				if (style.webkitTransition != null) {
					style.webkitTransition = trans;
				} else if (style.MozTransition != null) {
					style.MozTransition = trans;
				} else if (style.msTransition) {
					style.msTransition = trans;
				} else if (style.OTransition) {
					style.OTransition = trans;
				} else {
					style.transition = trans;
				}
			}
			
			// kill the old transition;
			$item.stop && $item.stop();
			item.delay && clearTimeout(item.delay);
			
			function action() {
				// start to arrange;
				start && $item.attr("data-state", "start");
				
				// for hidden block;
				if (!layout.block[id]) {
					$item[method]({
						opacity: 0,
						width: 0,
						height: 0
					});
				} else {
					var block = layout.block[id];
					layout.length -= 1;
					if (block.fixSize) {
						block.height = 1 * $item.attr("data-height");
						block.width = 1 * $item.attr("data-width");
					}
					$item["css"]({
						position: 'absolute',
						opacity: 1,
						width: block.width,
						height: block.height
					});

					// for animating by javascript;
					$item[method]({
						top: block.top,
						left: block.left
					});
				}

				if ($item.attr('data-nested') != null) {
					nestedBlock($item, id);
				}

				setting.onSetBlock["call"](item, block);

				layout.length == 0 && setting.onComplete["call"](klass, container);
			}

			setting.delay > 0 ? (item.delay = setTimeout(action, setting.delay * $item.attr("data-delay"))) : action(); 
		}

		function nestedBlock($item, id) {
			var gutterX = $item.attr("data-gutterX") || layout.gutterX;
			var gutterY = $item.attr("data-gutterY") || layout.gutterY;
			var method = $item.attr("data-method") || "fitZone";
			var nested = $item.attr('data-nested') || ":only-child";
			var cellH = $item.attr("data-cellH") || setting.cellH;
			var cellW = $item.attr("data-cellW") || setting.cellW;
			var block = layout.block[id], innerWall;
			
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
		}

		function setZoneSize (totalCol, totalRow) {
			var gutterX = layout.gutterX;
			var gutterY = layout.gutterY;
			var cellH = layout.cellH;
			var cellW = layout.cellW;

			var totalWidth = totalCol ? cellW * totalCol + gutterX * (totalCol - 1) : cellW * totalCol;
			var totalHeight = totalRow ? cellH * totalRow + gutterY * (totalRow - 1) : cellH * totalRow;

			container.attr({ 'data-wall-width': Math.ceil(totalWidth), 'data-wall-height': Math.ceil(totalHeight) });
		}


		var engine = {

			slice: function(items, col, row) {
				if (layout.grid == null) {
					var block = items.shift(), wall = {};
					wall[block.id] = {
						id: block.id,
						x: 0,
						y: 0,
						width: col,
						height: row,
						originWidth: block.width,
						originHeight: block.height
					};
				} else {
					var block, wall = layout.grid;
				}

				function getBigBlock() {
					var brick, idx, max = 0, less = false;
					for (var i in wall) {
						if (!wall.hasOwnProperty(i)) continue; 
						brick = wall[i];
						less = brick.height <= brick.originHeight;
						less = less && brick.width <= brick.originWidth;
						if (less) continue;

						if (brick.width * brick.height > max) {
							max = brick.width * brick.height;
							idx = i;
						}
					}
					return wall[idx];
				}

				var bigBlock = null, newBlock = null;
				
				while (items.length) {
					
					bigBlock = getBigBlock();
					if (!bigBlock) break;
					
					// slice the big block;
					if (bigBlock.height > bigBlock.originHeight) {
						//slice by height;
						newBlock = {
							x: bigBlock.x,
							y: bigBlock.y + bigBlock.originHeight,
							width: bigBlock.width,
							height: bigBlock.height - bigBlock.originHeight
						};

					} else {
						// slice by width;
						newBlock = {
							x: bigBlock.x + bigBlock.originWidth,
							y: bigBlock.y,
							width: bigBlock.width - bigBlock.originWidth,
							height: bigBlock.height 
						};
					}

					block = null;
					for (var i = 0; i < items.length; ++i) {
						if (items[i].height > newBlock.height) continue;
						if (items[i].width > newBlock.width) continue;
						block = items.splice(i, 1)[0];
						break;
					}
					// change size for fit with new block;
					!block && (block = items.shift());
					
					if (bigBlock.height > bigBlock.originHeight) {
						bigBlock.height = bigBlock.originHeight;

					} else {
						bigBlock.width = bigBlock.originWidth;

					}

					newBlock.originHeight = block.height;
					newBlock.originWidth = block.width;
					newBlock.id = block.id;
					
					wall[block.id] = newBlock;

				}

				for (var i in wall) {
					wall.hasOwnProperty(i) && setBlock(wall[i]);
				}

				setZoneSize(col, row);

				layout.grid = wall;
				// let layout refesh;
				layout.refresh = true;
			},
			// just a person name;
			// full name is Phan Dinh Giot;
			giot: function(items, col, row) {
				var smallLoop = Math.min(col, row),
				    bigLoop = Math.max(col, row),
				    wall = {},
				    grid = layout.grid || {},
				    maxX = 0,
				    maxY = 0,
				    fitWidth = col < row ? 1 : 0,
				    block, next, x, y, rest, lastBlock, misBlock;
				
				function fillGrid(x, y, w, h) {
					for (var i = x; i < x + w;) {
						for (var j = y; j < y + h;) {
							grid[i + '-' + j] = true;
							++j > maxY && (maxY = j);
						}
						++i > maxX && (maxX = i);
					}
				}

				for (var b = 0; b < bigLoop; ++b) {
					if (!items.length) break;
					fitWidth ? (y = b) : (x = b);
					lastBlock = null;

					for (var s = 0; s < smallLoop; ++s) {
						if (!items.length) break;
						fitWidth ? (x = s) : (y = s);
						if (grid[x + '-' + y]) continue;
						
						for (var n = s; n < smallLoop; ++n) {
							next = fitWidth ? (n + '-' + b) : (b + '-' + n);
							if (grid[next] == true) break;
						}
						
						rest = n - s;
						block = null;
						// find item fit in to gap;
						for (var i = 0; i < items.length; ++i) {
							if (items[i].height > (bigLoop - b) && fitWidth) continue;
							if (items[i].height > rest && !fitWidth ) continue;
							if (items[i].width > rest && fitWidth) continue;
							if (items[i].width > (bigLoop - b) && !fitWidth) continue;
							block = items.splice(i, 1)[0];
							break;
						}
						
						// trying resize the next block to fit gap;
						if (block == null && setting.fixSize == null) {
							// resize near block to fill gap;
							if (layout.minRow > rest && !fitWidth && lastBlock) {
								lastBlock.height += rest;
								fillGrid(lastBlock.x, lastBlock.y, lastBlock.width, lastBlock.height);
								continue;
							} else if (layout.minCol > rest && fitWidth && lastBlock) {
								lastBlock.width += rest;
								fillGrid(lastBlock.x, lastBlock.y, lastBlock.width, lastBlock.height);
								continue;
							} else {
								// get other block fill to gap;
								for (var i = 0; i < items.length; ++i) {
									if (items[i]['fixSize'] != null) continue;
									block = items.splice(i, 1)[0];
									if (fitWidth) {
										block.width = rest;
										// for fitZone;
										block.height = Math.min(block.height, bigLoop - b);
									} else {
										// for fitZone;
										block.width = Math.min(block.width, bigLoop - b);
										block.height = rest;
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
							
							// don't fill block-point on grid;
							if (block.width * block.height == 0) {
								s -= 1;
							} else {
								// keep success block for next round;
								lastBlock = wall[block.id];
								fillGrid(lastBlock.x, lastBlock.y, lastBlock.width, lastBlock.height);
							}
						} else {
							// get expect area;
							var misBlock = {
								fixSize: 0,
								x: x,
								y: y
							};
							if (fitWidth) {
								misBlock.width = rest;
								misBlock.height = 0;
								var lastX = x - 1;
								var lastY = y;
								
								while (grid[lastX + '-' + lastY]) {
									grid[x + '-' + lastY] = true;
									misBlock.height += 1;
									lastY += 1;
								}
							} else {
								misBlock.height = rest;
								misBlock.width = 0;
								var lastY = y - 1;
								var lastX = x;
								
								while (grid[lastX + '-' + lastY]) {
									grid[lastX + '-' + y] = true;
									misBlock.width += 1;
									lastX += 1;
								}
							}
							setting.onGapFound(setBlock(misBlock));
						}
					}

				}

				for (var i in wall) {
					wall.hasOwnProperty(i) && setBlock(wall[i]);
				}
				
				setZoneSize(maxX, maxY);

				layout.grid = grid;
			}
		};


		$.extend(klass, {
			
			container: container,
			
			appendMore: function(items) {
				var allBlock = $(items);
				var activeBlock = [];
				layout.refresh = false;

				allBlock.each(function(index, item) {
					container.append(item);
					block = loadBlock(item, ++index);
					block && activeBlock.push(block);
				});
				engine[setting.engine](activeBlock, layout.totalCol, layout.totalRow);
				
				if (!container.attr('data-height') && layout.totalCol < layout.totalRow) {
					container.height(container.attr("data-wall-height"));
				}

				layout.refresh && (allBlock = container.find(setting.selector));
				
				allBlock.each(function(index, item) {
					showBlock(item, item.id);
				});
			},

			fitHeight: function(height) {
				height = height ? height : container.height() || $(window).height();
				layout.length = 0;
				layout.block = {};
				layout.grid = null;
				layout.cellH = 0;
				layout.cellW = 0;
				layout.lastId = 1;

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;

				// dynamic type of unit;
				if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}
				if ($.isFunction(cellW)) {
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
					gutterY = layout.gutterY = Math.max(0, gutterY);
				} else {
					totalRow = Math.max(1, Math.round(height / (cellH + gutterY)));
				}

				if (!$.isNumeric(gutterX)) {
					layout.gutterX = layout.gutterY;
				}
				
				var deltaY = 0;
				// adjust cell unit for fit height;
				deltaY = (height + gutterY) / totalRow - (cellH + gutterY);
				layout.cellH = cellH + deltaY;
				layout.cellW = cellW + (deltaY * cellW / cellH);
				
				var allBlock = container.find(setting.selector).attr('id', '');
				var items, block = null, activeBlock = [];
				if (layout.filter) {
					items = allBlock.filter(layout.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}

				var totalCol = 666666;
				layout.totalCol = totalCol;
				layout.totalRow = totalRow;

				items.each(function(index, item) {
					block = loadBlock(item, ++index);
					block && activeBlock.push(block);
				});
				
				engine[setting.engine](activeBlock, totalCol, totalRow);
				
				allBlock.each(function(index, item) {
					showBlock(item, item.id);
				});
			},

			fitWidth: function(width) {
				width = width ? width : container.width() || $(window).width();
				layout.length = 0;
				layout.block = {};
				layout.grid = null;
				layout.cellH = 0;
				layout.cellW = 0;
				layout.lastId = 1;

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;
				
				// dynamic type of unit;
				if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}
				if ($.isFunction(cellW)) {
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
					gutterX = layout.gutterX = Math.max(0, gutterX);
				} else {
					// correct total column with gutter;
					totalCol = Math.max(1, Math.round(width / (cellW + gutterX)));
				}

				if (!$.isNumeric(gutterY)) {
					layout.gutterY = layout.gutterX;
				}

				var deltaX = 0;
				// adjust cell unit for fit width;
				deltaX = (width + gutterX) / totalCol - (cellW + gutterX);
				layout.cellW = cellW + deltaX;
				layout.cellH = cellH + (deltaX * cellH / cellW);

				var allBlock = container.find(setting.selector).removeAttr('id');
				var items, block = null, activeBlock = [];
				if (layout.filter) {
					items = allBlock.filter(layout.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}
				
				var totalRow = 666666;
				layout.totalCol = totalCol;
				layout.totalRow = totalRow;

				items.each(function(index, item) {
					block = loadBlock(item, ++index);
					block && activeBlock.push(block);
				});
				engine[setting.engine](activeBlock, totalCol, totalRow);
				
				!container.attr('data-height') && container.height(container.attr("data-wall-height"));
				allBlock.each(function(index, item) {
					showBlock(item, item.id);
				});
			},

			fitZone: function(width, height) {
				height = height ? height : container.height() || $(window).height();
				width = width ? width : container.width() || $(window).width();
				layout.length = 0;
				layout.block = {};
				layout.grid = null;
				layout.cellH = 0;
				layout.cellW = 0;
				layout.lastId = 1;
				
				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;

				// dynamic type of unit;
				if ($.isFunction(cellH)) {
					cellH = cellH.call(this, container);
				}
				if ($.isFunction(cellW)) {
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
					gutterX = layout.gutterX = Math.max(0, gutterX);
				} else {
					// correct total column with gutter;
					totalCol = Math.max(1, Math.round(width / (cellW + gutterX)));
				}

				// adjust size unit for fit height;
				if (!$.isNumeric(gutterY)) {
					gutterY = (height - totalRow * cellH) / Math.max(1, (totalRow - 1));
					gutterY = layout.gutterY = Math.max(0, gutterY);
				} else {
					totalRow = Math.max(1, Math.round(height / (cellH + gutterY)));
				}

				var deltaX = 0, deltaY = 0;
				// adjust cell unit for fit width;
				deltaX = (width + gutterX) / totalCol - (cellW + gutterX);
				layout.cellW = cellW + deltaX;

				// adjust cell unit for fit height;
				deltaY = (height + gutterY) / totalRow - (cellH + gutterY);
				layout.cellH = cellH + deltaY;

				var allBlock = container.find(setting.selector).attr('id', '');
				var items, block = null, activeBlock = [];
				if (layout.filter) {
					items = allBlock.filter(layout.filter).addClass('fw-filter');
				} else {
					items = allBlock.removeClass('fw-filter');
				}

				layout.totalCol = totalCol;
				layout.totalRow = totalRow;

				items.each(function(index, item) {
					block = loadBlock(item, ++index);
					block && activeBlock.push(block);
				});

				engine[setting.engine](activeBlock, totalCol, totalRow);
				
				allBlock.each(function(index, item) {
					showBlock(item, item.id);
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

			reset: function(option) {
				$.extend(setting, option);
				return this;
			},

			setFilter: function(selector) {
				layout.filter = selector;
				return this;
			},

			unsetFilter: function() {
				delete layout.filter;
				return this;
			}
		});
	};
 
})(window.Zepto || window.jQuery);
