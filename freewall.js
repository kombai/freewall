
// created by Minh Nguyen;
// version 1.03;

(function($, doc, win) {

	// simple dragdrop;
	function setDragable(sel, opt) {
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
		
		$(sel).each(function() {
			var set = $.extend({}, def, opt);
			var ele = set.proxy || this;
			var $ele = $(ele);
			ignoreDrag(ele);
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
			
			$(this).unbind("mousedown touchstart").bind("mousedown touchstart", mouseDown);

		});
	}

	function ignoreDrag(ele) {
		$(ele).find("iframe, form, input, textarea, .ignore-drag")
		.each(function() {
			$(this).on("touchstart mousedown", function(evt) {
				evt.stopPropagation();
			});
		});
	}

	win.freewall = function(selector) {
		
		var flexIndex = Number.fw ? ++Number.fw : Number.fw = 1;
		var klass = this;
		var MAX = Number.MAX_VALUE;
		var container = $(selector);
		if (container.css('position') == 'static') {
			container.css('position', 'relative');
		}

		// default setting;
		var setting = {
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
			onGapFound: function() {},
			onComplete: function() {},
			onResize: function() {},
			onSetBlock: function() {}
		};
		
		var layout = {
			block: {}, // store all items;
			grid: {},
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
		
		// for zeptojs;
		$.isNumeric == null && ($.isNumeric = function(src) {
			return src != null && src.constructor === Number;
		});

		$.isFunction == null && ($.isFunction = function(src) {
			return src != null && src instanceof Function;
		});

		// setup resize event;
		$(win).resize(function() {
			if (layout.busy) return;
			layout.busy = 1;
			setTimeout(function() {
				layout.busy = 0;
				setting.onResize["call"](klass, container);
			}, 122);
			container.attr('data-min-width', Math.floor($(win).width() / 80) * 80);
		});

		container.attr('data-min-width', Math.floor($(self).width() / 80) * 80);

		function loadBlock(item, index) {

			var $item = $(item), block = null, id = layout.lastId++ + '-' + flexIndex;
			var gutterX = layout.gutterX, gutterY = layout.gutterY;
			var fixSize = eval($item.attr('data-fixSize'));
			
			//ignore dragging block;
			if ($item.hasClass('fw-dragging')) return;
			$item.attr({ id: id, 'data-delay': index});

			//remove animation for speed render;
			if (setting.animate && layout.transition) {
				setTransition(item, "");
			}

			/*
			if ($item.attr('data-width') == undefined) {
				// store init width;
				if (parseInt(item.style.width)) {
					$item.attr('data-width', $item.width());
				} else {
					$item.attr('data-width', "");
				}
			} else {
				// backup the width;
				$item.width($item.attr('data-width'));
			}
			

			if ($item.attr('data-height') == undefined) {
				// store init height;
				if (parseInt(item.style.height)) {
					$item.attr('data-height', $item.height());
				} else {
					$item.attr('data-height', "");
				}
			} else {
				// back up the height;
				$item.height($item.attr('data-height'));
			}

			var height = $item.height();
			var width = $item.width();
			*/
			
			// store original size;
            $item.attr('data-height') == null && $item.attr('data-height', $item.height());
            $item.attr('data-width') == null && $item.attr('data-width', $item.width());
			var height = 1 * $item.attr('data-height');
            var width = 1 * $item.attr('data-width');

			var cellH = layout.cellH;
			var cellW = layout.cellW;
			
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
			if ((fixSize != null) && (col > layout.totalCol || row > layout.totalRow)) {
				block = null;
			} else {
				// get smallest width and smallest height of block;
				// using for image layout;
				row && row < layout.minH && (layout.minH = row);
				col && col < layout.minW && (layout.minW = col);

				// get biggest width and biggest height of block;
				row > layout.maxH && (layout.maxH = row);
				col > layout.maxW && (layout.maxW = col);

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

			// dragging block;
			if (setting.draggable == true) {
				setDragable(item, {
					start: function(event) {
						if (setting.animate && layout.transition) {
							setTransition(this, "");
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
						top = Math.min(Math.max(0, top), layout.totalRow - height);
						left = Math.min(Math.max(0, left), layout.totalCol - width);
						klass.setHole([{top: top, left: left, width: width, height: height}]);
						klass.updateLayout();
					},
					end: function() {
						var position = $(this).position();
						var top = Math.round(position.top / (cellH + gutterY));
						var left = Math.round(position.left/ (cellW + gutterX));
						var width = Math.round($(this).width() / (cellW + gutterX));
						var height = Math.round($(this).height() / (cellH + gutterY));
						$(this).removeClass('fw-dragging');
						top = Math.min(Math.max(0, top), layout.totalRow - height);
						left = Math.min(Math.max(0, left), layout.totalCol - width);

						$(this).css({
							top: top * (cellH + gutterY),
							left: left * (cellW + gutterX)
						});
						klass.fillHole();
						this.style.zIndex = "auto";
					}
				});
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

		function setTransition(item, trans) {
			var style = item.style;
			if (style.webkitTransition != null) {
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
			$(item).stop();
		}

		function showBlock(item, id) {
			var method = setting.animate && !layout.transition ? 'animate' : 'css';
			var $item = $(item);
			var start = $item.attr("data-state") != "move";
			var trans = start ? "width 0.5s, height 0.5s" : "top 0.5s, left 0.5s";
			//ignore dragging block;
			if ($item.hasClass('fw-dragging')) return;

			if (setting.animate && layout.transition) {
				setTransition(item, trans);
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
			var gutterY = layout.gutterY;
			var gutterX = layout.gutterX;
			var cellH = layout.cellH;
			var cellW = layout.cellW;

			var totalWidth = totalCol ? cellW * totalCol + gutterX * (totalCol - 1) : cellW * totalCol;
			var totalHeight = totalRow ? cellH * totalRow + gutterY * (totalRow - 1) : cellH * totalRow;

			container.attr({ 'data-wall-width': Math.ceil(totalWidth), 'data-wall-height': Math.ceil(totalHeight) });
		}

		function resetLayout() {
			layout.length = 0;
			layout.block = {};
			layout.grid = null;
			layout.cellH = 0;
			layout.cellW = 0;
			layout.lastId = 1;
		}

		var engine = {
			// just a person name;
			// full name is Phan Dinh Giot;
			giot: function(items, col, row) {
				var smallLoop = Math.min(col, row),
				    bigLoop = Math.max(col, row),
				    grid = layout.grid || {},
				    hole = layout.hole,
				    wall = {},
				    maxX = 0,
				    maxY = 0,
				    freeArea = null,
				    fitWidth = col < row ? 1 : 0,
				    block, x, y, lastBlock, misBlock;

				// fill area with top, left, width, height;
				function fillGrid(t, l, w, h) { 
					for (var y = t; y < t + h;) {
						for (var x = l; x < l + w;) {
							grid[y + '-' + x] = true;
							++x > maxX && (maxX = x);
						}
						++y > maxY && (maxY = y);
					}
				}
				
				function getZone(t, l, w, h) {
					
					var maxY = Math.min(t + h, row);
					var maxX = Math.min(l + w, col);
					var minX = maxX;
					var minY = maxY;

					// find limit width and limit height of zone;
					for (var y = t; y < maxY; ++y) {
						for (var x = l; x < maxX; ++x) {
							if (grid[y + '-' + x] == true) {
								(t < y && y < minY) && (minY = y);
								(l < x && x < minX) && (minX = x);
 							}
						}
					}

					// find limit zone by horizon;
					var minLeft = maxX;
					for (var y = t; y < minY; ++y) {
						for (var x = l; x < maxX; ++x) {
							if (grid[y + '-' + x] == true) {
								(l < x && x < minLeft) && (minLeft = x);
							}
						}
					}
					// find limit zone by vertical;
					var minTop = maxY;
					for (var y = t; y < maxY; ++y) {
						for (var x = l; x < minX; ++x) {
							if (grid[y + '-' + x] == true) {
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
						fillGrid(hole[i]['top'], hole[i]['left'], hole[i]['width'], hole[i]['height']);
					}
				}

				
				for (var b = 0; b < bigLoop; ++b) {
					if (!items.length) break;
					fitWidth ? (y = b) : (x = b);
					lastBlock = null;

					for (var s = 0; s < smallLoop; ++s) {
						if (!items.length) break;
						fitWidth ? (x = s) : (y = s);
						if (grid[y + '-' + x]) continue;
						block = null;
						freeArea = getZone(y, x, layout.maxW, layout.maxH);
						for (var i = 0; i < items.length; ++i) {
							if (items[i].height > freeArea.height) continue;
							if (items[i].width > freeArea.width) continue;
							block = items.splice(i, 1)[0];
							break;
						}

						// trying resize the other block to fit gap;
						if (block == null && setting.fixSize == null) {
							// resize near block to fill gap;
							if (lastBlock && !fitWidth && layout.minH > freeArea.height) {
								lastBlock.height += freeArra.height;
								fillGrid(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
								continue;
							} else if (lastBlock && fitWidth && layout.minW > freeArea.width) {
								lastBlock.width += freeArea.width;
								fillGrid(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
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
							fillGrid(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
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
								
								while (grid[lastY + '-' + lastX]) {
									grid[lastY + '-' + x] = true;
									misBlock.height += 1;
									lastY += 1;
								}
							} else {
								misBlock.height = freeArea.height;
								misBlock.width = 0;
								var lastY = y - 1;
								var lastX = x;
								
								while (grid[lastY + '-' + lastX]) {
									grid[y + '-' + lastX] = true;
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


		var currentMethod = function() {};
		var currentArgs = [];

		$.extend(klass, {
			
			container: container,
			
			appendMore: function(items) {
				var allBlock = $(items);
				var activeBlock = [];

				allBlock.each(function(index, item) {
					container.append(item);
					block = loadBlock(item, ++index);
					block && activeBlock.push(block);
				});
				engine[setting.engine](activeBlock, layout.totalCol, layout.totalRow);
				
				if (!container.attr('data-height') && layout.totalCol < layout.totalRow) {
					container.height(container.attr("data-wall-height"));
				}

				allBlock.each(function(index, item) {
					showBlock(item, item.id);
				});
			},

			fitHeight: function(height) {
				height = height ? height : container.height() || $(window).height();
				currentMethod = arguments.callee;
				currentArgs = arguments;
				resetLayout();

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;

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
				currentMethod = arguments.callee;
				currentArgs = arguments;
				resetLayout();

				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;
				
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
				currentMethod = arguments.callee;
				currentArgs = arguments;
				resetLayout();
				
				var gutterX = setting.gutterX;
				var gutterY = setting.gutterY;
				var cellH = setting.cellH;
				var cellW = setting.cellW;
				layout.gutterX = gutterX;
				layout.gutterY = gutterY;

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

			setHole: function(holes) {
				/*
				the example of hole: 
				[{
					top: 2,
					left: 2,
					width: 2,
					height: 2
				}]
				*/
				layout.hole = holes;
				return this;
			},

			fillHole: function() {

				layout.hole = [];
				return this;
			},

			unsetFilter: function() {
				delete layout.filter;
				return this;
			},
			updateLayout: function() {
				var args = arguments.length ? arguments : currentArgs;
				currentMethod.apply(this, args);
			}
		});
	};
 
})(window.Zepto || window.jQuery, document, window);
