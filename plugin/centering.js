
// created by Minh Nguyen;
// centering plugin;

// to make grid center in container;
freewall.createPlugin({
	centering: function(setting, container) {
		var runtime = setting.runtime;
		this.addCustomEvent("onGridArrange", function(setting) {
			var gridWidth = container.attr("data-wall-width") * 1;
			var realWidth = container.width();
			var offsetLeft = (realWidth - gridWidth) / 2;
			for (var i in runtime.blocks) {
				var block = runtime.blocks[i];
				block.left != null && (block.left += offsetLeft);
			}
		});
	}
})