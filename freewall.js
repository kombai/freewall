
// created by Minh Nguyen;
// version 1.04;

(function($) {
    
    // for zeptojs;
    $.isNumeric == null && ($.isNumeric = function(src) {
        return src != null && src.constructor === Number;
    });

    $.isFunction == null && ($.isFunction = function(src) {
        return src != null && src instanceof Function;
    });

    var $W = $(window);
    var $D = $(document);
    
    var layoutManager = {
        // default setting;
        defaultConfig: {
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
        plugin: {},
        totalGrid: 1,
        transition: false,
        loadBlock: function(item, setting) {
            var runtime = setting.runtime;
            var $item = $(item);
            var block = null;
            var gutterX = runtime.gutterX;
            var gutterY = runtime.gutterY;
            var fixSize = eval($item.attr('data-fixSize'));
            var blockId = runtime.lastId++ + '-' + this.totalGrid;
            
            //ignore dragging block;
            if ($item.hasClass('fw-float')) return;
            $item.attr({id: blockId, 'data-delay': item.index});

            //remove animation for speed render;
            if (setting.animate && this.transition) {
                this.setTransition(item, "");
            }
            
            // store original size;
            $item.attr('data-height') == null && $item.attr('data-height', $item.height());
            $item.attr('data-width') == null && $item.attr('data-width', $item.width());
            var height = 1 * $item.attr('data-height');
            var width = 1 * $item.attr('data-width');
            var fixPos = $item.attr('data-fixPos');

            var cellH = runtime.cellH;
            var cellW = runtime.cellW;
            
            var col = !width ? 0 : Math.round((width + gutterX) / cellW);
            var row = !height ? 0 : Math.round((height + gutterY) / cellH);

            // estimate size;
            if (!fixSize && setting.cellH == 'auto') {
                $item.width(cellW * col - gutterX);
                item.style.height = "";
                height = $item.height();
                row = !height ? 0 : Math.round((height + gutterY) / cellH);
            }

            if (!fixSize && setting.cellW == 'auto') {
                $item.height(cellH * row - gutterY);
                item.style.width = "";
                width = $item.width();
                col = !width ? 0 : Math.round((width + gutterX) / cellW);
            }
            
            // for none resize block;
            if ((fixSize != null) && (col > runtime.totalCol || row > runtime.totalRow)) {
                block = null;
            } else {
                // get smallest width and smallest height of block;
                // using for image runtime;
                row && row < runtime.minHoB && (runtime.minHoB = row);
                col && col < runtime.minWoB && (runtime.minWoB = col);

                // get biggest width and biggest height of block;
                row > runtime.maxHoB && (runtime.maxHoB = row);
                col > runtime.maxWoB && (runtime.maxWoB = col);

                width == 0 && (col = 0);
                height == 0 && (row = 0);

                block = {
                    id: blockId,
                    width: col,
                    height: row,
                    fixSize: fixSize
                };

                // for fix position;
                if (fixPos) {
                    fixPos = fixPos.split("-");
                    block.y = 1 * fixPos[0];
                    block.x = 1 * fixPos[1];
                    block.width = fixSize != null ? col : Math.min(col, runtime.totalCol - block.x);
                    block.height = fixSize != null ? row : Math.min(row, runtime.totalRow - block.y);
                    runtime.holes.push({
                        top: block.y,
                        left: block.x,
                        width: block.width,
                        height: block.height
                    });
                    this.setBlock(block, setting);
                }
            }

            // for css animation;
            if ($item.attr("data-state") == null) {
                $item.attr("data-state", "init");
            } else {
                $item.attr("data-state", "move");
            }
            return fixPos ? null : block;
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
                top: y * cellH,
                left: x  * cellW,
                width: cellW * width - gutterX,
                height: cellH * height - gutterY
            };
            

            realBlock.top = 1 * realBlock.top.toFixed(2);
            realBlock.left = 1 * realBlock.left.toFixed(2);
            realBlock.width = 1 * realBlock.width.toFixed(2);
            realBlock.height = 1 * realBlock.height.toFixed(2);

            block.id && ++runtime.length && (runtime.blocks[block.id] = realBlock);
            // for append feature;
            return realBlock;
        },
        showBlock: function(item, setting) {
            var runtime = setting.runtime;
            var method = setting.animate && !this.transition ? 'animate' : 'css';
            var block = runtime.blocks[item.id];
            var $item = $(item);
            var self = this;
            var start = $item.attr("data-state") != "move";
            var trans = start ? "width 0.5s, height 0.5s" : "top 0.5s, left 0.5s, width 0.5s, height 0.5s";
            
            item.delay && clearTimeout(item.delay);
            //ignore dragging block;
            if ($item.hasClass('fw-float')) return;
            
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
                        //opacity: 0,
                        width: 0,
                        height: 0
                    });
                } else {
                    if (block.fixSize) {
                        block.height = 1 * $item.attr("data-height");
                        block.width = 1 * $item.attr("data-width");
                    }

                    $item["css"]({
                        //opacity: 1,
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
                    self.nestedGrid(item, setting);
                }

                setting.onSetBlock.call(item, block, setting);

                runtime.length == 0 && setting.onComplete.call(item, block, setting);
            }

            setting.delay > 0 ? (item.delay = setTimeout(action, setting.delay * $item.attr("data-delay"))) : action(); 
        },
        nestedGrid: function(item, setting) {
            var innerWall, $item = $(item), runtime = setting.runtime;
            var gutterX = $item.attr("data-gutterX") || setting.gutterX;
            var gutterY = $item.attr("data-gutterY") || setting.gutterY;
            var method = $item.attr("data-method") || "fitZone";
            var nested = $item.attr('data-nested') || ":only-child";
            var cellH = $item.attr("data-cellH") || setting.cellH;
            var cellW = $item.attr("data-cellW") || setting.cellW;
            var block = runtime.blocks[item.id];
            
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
        adjustBlock: function(block, setting) {
            var runtime = setting.runtime;
            var $item = $("#" + block.id);
            var cellH = runtime.cellH;
            var cellW = runtime.cellW;
            var gutterX = runtime.gutterX;
            var gutterY = runtime.gutterY;

            if (setting.cellH = 'auto') {
                $item.width(block.width * cellW - gutterX);
                $item.get(0).style = "";
                block.height = Math.round(($item.height() + gutterY) / cellH);
            }
        },
        adjustWidth: function(width, setting) {
            var gutterX = setting.gutterX;
            var runtime = setting.runtime;
            var cellW = setting.cellW;

            $.isFunction(cellW) && (cellW = cellW(width));
            cellW = 1 * cellW;
            !$.isNumeric(cellW) && (cellW = 1);
            
            if ($.isNumeric(width)) {
                // adjust cell width via container;
                cellW < 1 && (cellW = cellW * width);

                // estimate total columns;
                var totalCol = Math.max(1, Math.floor(width / cellW));

                // adjust unit size for fit width;
                if (!$.isNumeric(gutterX)) {
                    gutterX = (width - totalCol * cellW) / Math.max(1, (totalCol - 1));
                    gutterX = Math.max(0, gutterX);
                }

                totalCol = Math.floor((width + gutterX) / cellW);
                runtime.cellW = (width + gutterX) / totalCol;
                runtime.cellS = runtime.cellW / cellW;
                runtime.gutterX = gutterX;
                runtime.totalCol = totalCol;
            } else {
                // adjust cell width via cell height;
                cellW < 1 && (cellW = runtime.cellH);
                runtime.cellW = cellW != 1 ? cellW * runtime.cellS : 1;
                runtime.gutterX = gutterX;
                runtime.totalCol = 666666;
            }
        },
        adjustHeight: function(height, setting) {
            var gutterY = setting.gutterY;
            var runtime = setting.runtime;
            var cellH = setting.cellH;

            $.isFunction(cellH) && (cellH = cellH(height));
            cellH = 1 * cellH;
            !$.isNumeric(cellH) && (cellH = 1);

            if ($.isNumeric(height)) {
                // adjust cell height via container;
                cellH < 1 && (cellH = cellH * height);

                // estimate total rows;
                var totalRow = Math.max(1, Math.floor(height / cellH));

                // adjust size unit for fit height;
                if (!$.isNumeric(gutterY)) {
                    gutterY = (height - totalRow * cellH) / Math.max(1, (totalRow - 1));
                    gutterY = Math.max(0, gutterY);
                }

                totalRow = Math.floor((height + gutterY) / cellH);
                runtime.cellH = (height + gutterY) / totalRow;
                runtime.cellS = runtime.cellH / cellH;
                runtime.gutterY = gutterY;
                runtime.totalRow = totalRow;
            } else {
                // adjust cell height via cell width;
                cellH < 1 && (cellH = runtime.cellW);
                runtime.cellH = cellH != 1 ? cellH * runtime.cellS : 1;
                runtime.gutterY = gutterY;
                runtime.totalRow = 666666;
            }
        },
        resetGrid: function(runtime) {
            runtime.blocks = {};
            runtime.length = 0;
            runtime.cellH = 0;
            runtime.cellW = 0;
            runtime.lastId = 1;
            runtime.matrix = {};
        },
        setDragable: function(item, option) {
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
                var set = $.extend({}, def, option);
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
                        
                        $D.bind("mouseup touchend", mouseUp);
                        $D.bind("mousemove touchmove", mouseMove); 
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

                    $D.unbind("mouseup touchend", mouseUp);
                     $D.unbind("mousemove touchmove", mouseMove);
                };

                // ignore drag drop on text field;
                $(this).find("iframe, form, input, textarea, .ignore-drag")
                .each(function() {
                    $(this).on("touchstart mousedown", function(evt) {
                        evt.stopPropagation();
                    });
                });
                
                $D.unbind("mouseup touchend", mouseUp);
                $D.unbind("mousemove touchmove", mouseMove);
                $ele.unbind("mousedown touchstart").bind("mousedown touchstart", mouseDown);

            });
        },
        setTransition: function(item, trans) {
            var style = item.style;
            var $item = $(item);
                
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
        getFreeArea: function(t, l, runtime) {
            var maxY = Math.min(t + runtime.maxHoB, runtime.totalRow);
            var maxX = Math.min(l + runtime.maxWoB, runtime.totalCol);
            var minX = maxX;
            var minY = maxY;
            var matrix = runtime.matrix;
            
            // find limit zone by horizon;
            for (var y = t; y < minY; ++y) {
                for (var x = l; x < maxX; ++x) {
                    if (matrix[y + '-' + x] == true) {
                        (l < x && x < minX) && (minX = x);
                    }
                }
            }
            
            // find limit zone by vertical;
            for (var y = t; y < maxY; ++y) {
                for (var x = l; x < minX; ++x) {
                    if (matrix[y + '-' + x] == true) {
                        (t < y && y < minY) && (minY = y);
                    }
                }
            }

            return {
                top: t,
                left: l,
                width: minX - l,
                height: minY - t
            };

        },
        setWallSize: function(runtime, container) {
            var totalRow = Math.max(1, runtime.totalRow);
            var totalCol = Math.max(1, runtime.totalCol);
            var gutterY = runtime.gutterY;
            var gutterX = runtime.gutterX;
            var cellH = runtime.cellH;
            var cellW = runtime.cellW;
            var totalWidth = cellW * totalCol - gutterX;
            var totalHeight = cellH * totalRow - gutterY;
            
            container.attr({
                'data-total-col': totalCol,
                'data-total-row': totalRow,
                'data-wall-width': Math.ceil(totalWidth),
                'data-wall-height': Math.ceil(totalHeight)
            });
        },
        testBlock: function(y, x, setting) {
            $("<div class='test-block'>").css({
                position: 'absolute',
                border: "1px solid orange",
                top: y * setting.runtime.cellH,
                left: x * setting.runtime.cellW,
                width: setting.runtime.cellW - 2,
                height: setting.runtime.cellH - 2
            }).appendTo("#freewall");
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
                holes = runtime.holes,
                block = null,
                matrix = runtime.matrix,
                bigLoop = Math.max(col, row),
                freeArea = null,
                misBlock = null,
                fitWidth = col < row ? 1 : 0,
                lastBlock = null,
                smallLoop = Math.min(col, row);

            // fill area with top, left, width, height;
            function fillMatrix(t, l, w, h) {
                for (var y = t; y < t + h;) {
                    for (var x = l; x < l + w;) {
                        matrix[y + '-' + x] = true;
                        ++x > maxX && (maxX = x);
                    }
                    ++y > maxY && (maxY = y);
                }
            }
            
            // set a hole on the wall;
            if (holes.length) {
                for (var i = 0; i < holes.length; ++i) {
                    fillMatrix(holes[i]['top'], holes[i]['left'], holes[i]['width'], holes[i]['height']);
                }
            }

            for (var b = 0; b < bigLoop; ++b) {
                if (!items.length) break;
                fitWidth ? (y = b) : (x = b);
                lastBlock = null;

                for (var s = 0; s < smallLoop; ++s) {
                    if (!items.length) break;
                    fitWidth ? (x = s) : (y = s);
                    if (runtime.matrix[y + '-' + x]) continue;
                    freeArea = layoutManager.getFreeArea(y, x, runtime);
                    block = null;
                    for (var i = 0; i < items.length; ++i) {
                        if (items[i].height > freeArea.height) continue;
                        if (items[i].width > freeArea.width) continue;
                        block = items.splice(i, 1)[0];
                        break;
                    }

                    // trying resize the other block to fit gap;
                    if (block == null && setting.fixSize == null) {
                        // resize near block to fill gap;
                        if (lastBlock && !fitWidth && runtime.minHoB > freeArea.height) {
                            lastBlock.height += freeArea.height;
                            fillMatrix(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
                            layoutManager.setBlock(lastBlock, setting);
                            continue;
                        } else if (lastBlock && fitWidth && runtime.minWoB > freeArea.width) {
                            lastBlock.width += freeArea.width;
                            fillMatrix(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
                            layoutManager.setBlock(lastBlock, setting);
                            continue;
                        } else {
                            // get other block fill to gap;
                            for (var i = 0; i < items.length; ++i) {
                                if (items[i]['fixSize'] != null) continue;
                                block = items.splice(i, 1)[0];
                                if (fitWidth) {
                                    block.width = freeArea.width;
                                    if (setting.cellH == 'auto') {
                                        layoutManager.adjustBlock(block, setting);
                                    }
                                    // for fitZone;
                                    block.height = Math.min(block.height, freeArea.height);
                                } else {
                                    block.height = freeArea.height;
                                    // for fitZone;
                                    block.width = Math.min(block.width, freeArea.width);
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

                        fillMatrix(lastBlock.y, lastBlock.x, lastBlock.width, lastBlock.height);
                        layoutManager.setBlock(lastBlock, setting);
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



    window.freewall = function(selector) {
        
        var container = $(selector);
        if (container.css('position') == 'static') {
            container.css('position', 'relative');
        }
        var MAX = Number.MAX_VALUE;
        var klass = this;
        // increase the instance index;
        layoutManager.totalGrid += 1;

        var setting = $.extend({}, layoutManager.defaultConfig);
        var runtime = {
            blocks: {}, // store all items;
            events: {}, // store custome events;
            matrix: {},
            holes: [], // forbidden zone;
            
            cellW: 0,
            cellH: 0, // unit adjust;
            cellS: 1, // unit scale;
            
            filter: '', // filter selector;
            
            lastId: 0,
            length: 0,

            maxWoB: 0, // max width of block;
            maxHoB: 0,
            minWoB: MAX, 
            minHoB: MAX, // min height of block;

            running: 0, // flag to check layout arranging;

            gutterX: 15, 
            gutterY: 15,

            totalCol: 1,
            totalRow: 1,
            
            currentMethod: null,
            currentArguments: []
        };
        setting.runtime = runtime;
        
        // check browser support transition;
        var bodyStyle = document.body.style;
        if (!layoutManager.transition) {
            (bodyStyle.webkitTransition != null ||
            bodyStyle.MozTransition != null ||
            bodyStyle.msTransition != null ||
            bodyStyle.OTransition != null ||
            bodyStyle.transition != null) &&
            (layoutManager.transition = true);
        }
        

        function setDragable(item) {
            
            var gutterX = runtime.gutterX;
            var gutterY = runtime.gutterY;
            var cellH = runtime.cellH;
            var cellW = runtime.cellW;

            layoutManager.setDragable(item, {
                start: function(event) {
                    if (setting.animate && layoutManager.transition) {
                        layoutManager.setTransition(this, "");
                    }
                    this.style.zIndex = 9999;
                    $(this).addClass('fw-float');
                },
                move: function(evt, tracker) {
                    var position = $(this).position();
                    var top = Math.round(position.top / cellH);
                    var left = Math.round(position.left / cellW);
                    var width = Math.round($(this).width() / cellW);
                    var height = Math.round($(this).height() / cellH);
                    top = Math.min(Math.max(0, top), runtime.totalRow - height);
                    left = Math.min(Math.max(0, left), runtime.totalCol - width);
                    klass.setHoles([{top: top, left: left, width: width, height: height}]);
                    klass.refresh();
                },
                end: function() {
                    var position = $(this).position();
                    var top = Math.round(position.top / cellH);
                    var left = Math.round(position.left / cellW);
                    var width = Math.round($(this).width() / cellW);
                    var height = Math.round($(this).height() / cellH);
                    $(this).removeClass('fw-float');
                    top = Math.min(Math.max(0, top), runtime.totalRow - height);
                    left = Math.min(Math.max(0, left), runtime.totalCol - width);

                    $(this).css({
                        top: top * cellH,
                        left: left * cellW
                    });
                    klass.fillHoles();
                    this.style.zIndex = "auto";
                }
            });
        }
        

        $.extend(klass, {
            
            addCustomEvent: function(name, func) {
                var events = runtime.events;
                name = name.toLowerCase();
                !events[name] && (events[name] = []);
                func.eid = events[name].length;
                events[name].push(func);
                return this;
            },

            appendBlock: function(item) {
                container.append(item);
                this.refresh();
                return this;
            },

            container: container,

            fillHoles: function() {
                runtime.holes = [];
                return this;
            },

            filter: function(filter) {
                runtime.filter = filter;
                this.refresh();
                return this;
            },

            fireEvent: function(name, object, setting) {
                var events = runtime.events;
                name = name.toLowerCase();
                if (events[name] && events[name].length) {
                    for (var i = 0; i < events[name].length; ++i) {
                        events[name][i].call(object, setting);
                    }
                }
                return this;
            },

            fitHeight: function(height) {
                var allBlock = container.find(setting.selector).removeAttr('id'),
                    items,
                    block = null,
                    activeBlock = [];

                height = height ? height : container.height() || $W.height();
                
                runtime.currentMethod = arguments.callee;
                runtime.currentArguments = arguments;
                
                layoutManager.resetGrid(runtime);
                layoutManager.adjustHeight(height, setting);
                layoutManager.adjustWidth('auto', setting);
                
                if (runtime.filter) {
                    items = allBlock.filter(runtime.filter).addClass('fw-filter');
                } else {
                    items = allBlock.removeClass('fw-filter');
                }

                klass.fireEvent('onGridReady', container, setting);

                items.each(function(index, item) {
                    item.index = ++index;
                    if (block = layoutManager.loadBlock(item, setting)) {
                        activeBlock.push(block);
                        klass.fireEvent('onBlockLoad', item, setting);
                    }
                });
                
                klass.fireEvent('onGridLoad', container, setting);

                engine[setting.engine](activeBlock, setting);
                
                layoutManager.setWallSize(runtime, container);

                klass.fireEvent('onGridArrange', container, setting);

                allBlock.each(function(index, item) {
                    setting.draggable && setDragable(item);
                    layoutManager.showBlock(item, setting);
                    klass.fireEvent('onBlockShow', item, setting);
                });

                klass.fireEvent('onGridShow', container, setting);
            },

            fitWidth: function(width) {
                var allBlock = container.find(setting.selector).removeAttr('id'),
                    items,
                    block = null,
                    activeBlock = [];

                width = width ? width : container.width() || $W.width();

                runtime.currentMethod = arguments.callee;
                runtime.currentArguments = arguments;
                
                layoutManager.resetGrid(runtime);
                layoutManager.adjustWidth(width, setting);
                layoutManager.adjustHeight('auto', setting);

                if (runtime.filter) {
                    items = allBlock.filter(runtime.filter).addClass('fw-filter');
                } else {
                    items = allBlock.removeClass('fw-filter');
                }
                
                klass.fireEvent('onGridReady', container, setting);

                items.each(function(index, item) {
                    item.index = ++index;
                    if (block = layoutManager.loadBlock(item, setting)) {
                        activeBlock.push(block);
                        klass.fireEvent('onBlockLoad', item, setting);
                    }
                });
                
                klass.fireEvent('onGridLoad', container, setting);
                
                engine[setting.engine](activeBlock, setting);

                layoutManager.setWallSize(runtime, container);
                
                klass.fireEvent('onGridArrange', container, setting);

                // don't set height when nesting block;
                if (!container.attr('data-height')) {
                    container.height(container.attr("data-wall-height"));
                }
                  
                allBlock.each(function(index, item) {
                    setting.draggable && setDragable(item);
                    layoutManager.showBlock(item, setting);
                    klass.fireEvent('onBlockShow', item, setting);
                });

                klass.fireEvent('onGridShow', container, setting);
            },

            fitZone: function(width, height) {
                var allBlock = container.find(setting.selector).removeAttr('id'),
                    items,
                    block = null,
                    activeBlock = [];

                height = height ? height : container.height() || $W.height();
                width = width ? width : container.width() || $W.width();
                
                runtime.currentMethod = arguments.callee;
                runtime.currentArguments = arguments;
                
                layoutManager.resetGrid(runtime);
                layoutManager.adjustWidth(width, setting);
                layoutManager.adjustHeight(height, setting);

                if (runtime.filter) {
                    items = allBlock.filter(runtime.filter).addClass('fw-filter');
                } else {
                    items = allBlock.removeClass('fw-filter');
                }
                
                klass.fireEvent('onGridReady', container, setting);

                items.each(function(index, item) {
                    item.index = ++index;
                    if (block = layoutManager.loadBlock(item, setting)) {
                        activeBlock.push(block);
                        klass.fireEvent('onBlockLoad', item, setting);
                    }
                });

                klass.fireEvent('onGridLoad', container, setting);

                engine[setting.engine](activeBlock, setting);
                
                layoutManager.setWallSize(runtime, container);
                
                klass.fireEvent('onGridArrange', container, setting);

                allBlock.each(function(index, item) {
                    setting.draggable && setDragable(item);
                    layoutManager.showBlock(item, setting);
                    klass.fireEvent('onBlockShow', item, setting);
                });

                klass.fireEvent('onGridShow', container, setting);
            },

            /*
            set block with special position, the top and left are multiple of unit width/height;
            example:

                wall.fixSize({
                    top: 0,
                    left: 0,
                    block: $('.free')
                });
            */
            fixPos: function(option) {
                $(option.block).attr({'data-fixPos': option.top + "-" + option.left});
                return this;
            },

            /*
            set block with special size, the width and height are multiple of unit width/height;
            example:

                wall.fixSize({
                    height: 5,
                    width: 2,
                    block: $('.free')
                });
            */
            fixSize: function(option) {
                option.width != null && $(option.block).attr({'data-width': option.width});
                option.height != null && $(option.block).attr({'data-height': option.height});
                return this;
            },

            prepend: function(items) {
                container.prepend(items);
                this.refresh();
                return this;
            },

            refresh: function() {
                var params = arguments.length ? arguments : runtime.currentArguments;
                runtime.currentMethod == null && (runtime.currentMethod = this.fitWidth);
                runtime.currentMethod.apply(this, Array.prototype.slice.call(params, 0));
                return this;
            },

            /*
            custom layout setting;
            example:

                wall.reset({
                    selector: '.brick',
                    animate: true,
                    cellW: 160,
                    cellH: 160,
                    delay: 50,
                    onResize: function() {
                        wall.fitWidth();
                    }
                });
            */
            reset: function(option) {
                $.extend(setting, option);
                return this;
            },

            /*
            create blank are on layout;
            example:
                
                wall.setHoles([
                    {
                        top: 2,
                        left: 2,
                        width: 2,
                        height: 2
                    }
                ]);
            */
            setHoles: function(holes) {
                runtime.holes = holes;
                return this;
            },

            unFilter: function() {
                delete runtime.filter;
                this.refresh();
                return this;
            }
            
        });
        
        container.attr('data-min-width', Math.floor($W.width() / 80) * 80);
        // execute plugins;
        for (var i in layoutManager.plugin) {
            if (layoutManager.plugin.hasOwnProperty(i)) {
                layoutManager.plugin[i].call(klass, setting, container);
            }
        }

        // setup resize event;
        $W.resize(function() {
            if (runtime.running) return;
            runtime.running = 1;
            setTimeout(function() {
                runtime.running = 0;
                setting.onResize.call(klass, container);
            }, 122);
            container.attr('data-min-width', Math.floor($W.width() / 80) * 80);
        });
    };


    /*
    support create new plugin;
    example:
        
        freewall.createPlugin({
            centering: function(setting, container) {
                console.log(this);
                console.log(setting);
            }
        }).addConfig({
            offsetLeft: 0
        });
    */
    freewall.createPlugin = function(pluginData) {
        // register new plugin;
        $.extend(layoutManager.plugin, pluginData);
        return {
            addConfig: function(newConfig) {
                // add default setting;
                $.extend(layoutManager.defaultConfig, newConfig);    
            }
        }
    };

    /*
    support create new arrange algorithm;
    example:

        freewall.createEngine({
            slice: function(items, setting) {
                // slice engine;
            }
        });
    */
    freewall.createEngine = function(engineData) {
        // create new engine;
        $.extend(engine, engineData);
    };
 
})(window.Zepto || window.jQuery);
