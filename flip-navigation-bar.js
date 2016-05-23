/*
 *	@author:			tomasran
 *	@createDate:		2016-04-27 17:22
 *	@last modified by:	tomasran
 */

/*
 *	@example:
 *		var flipNavigationBar = new FlipNavigationBar({
 *			'container': '',			// 外层传进来的容器
 *
 *			'navBarClass': '',			//（可选参数）翻页导航条容器class 
 *			'navContentClass': '',
 *			'navItemClass': '',			//（可选参数）翻页导航项class
 *			'navItemSelectedClass': '',	//（可选参数）翻页导航项选中后class
 *			'navBtnClass': '',			// 导航pre/next按钮class
 *			'navBtnActiveClass': '',	// pre/next按钮激活时class
 *			'navBtnDisableClass': '',	// pre/next按钮
 *
 *			'preBtn: {					// 前一页按钮配置
 *				'content': '',			//（可选参数）按钮的内容
 *				'className': '',		//（可选参数）按钮自定义class
 *				'activeClass': '',		//（可选参数）按钮处于激活状态的自定义class
 *				'disableClass': '',		//（可选参数）按钮处于禁用状态的自定义class
 *			},
 *
 *			'nextBtn': {				// 后一页按钮配置
 *				'className': '',
 *				'content': '',
 *				'activeClass': '',
 *				'disableClass': ''
 *			},
 *
 *			'navData': [{				// 滚动项数据
 *				'id': '',				//（必填参数）项唯一的id
 *				'content': '',			// 项的内容（默认为空）
 *			}, {
 *				...
 *			}],
 *			'jumpToSelected': '',		//（可选参数）选中是否跳到对应项 
 *			'defaultSelected': '',		// 默认选中的项 
 *			'callback': '',				// 选中项执行的callback
 *		});
 */

((function(global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function(jQuery) {
			return factory(jQuery);
		});
	} else if (typeof module !== undefined && module.exports) {
		module.exports = factory(require('jquery'));
	} else {
		root.FlipNavigationBar = factory(global.jQuery);
	}
})(window || {}, function($) {

	var createElement = function(tagName) {
		return $('<' + tagName + '>');
	};

	var FlipNavigationBar = function(options) {
		this.checkOptions(options);

		// 获得外层容器对象
		this.container = this.getContainer();

		if (this.container === null) {
			return false;
		}

		// 设置当前选中项（选中项id）
		this.selected = this.options.defaultSelected || (this.options.navData[0] && this.options.navData[0].id);

		// 当前的滚动距离
		this.scrollDistance = 0;

		// 生成滚动条容器
		this.navBar = createElement(this.NAV_BAR_TAG).attr({
			'class':  this.options.navBarClass
		}).css({
			'position': 'relative',
			'overflow': 'hidden'
		});

		this.container.append(this.navBar);

		// 构造pre/next按钮
		this.preBtn = this.constructButton(this.options.preBtn).css({
			'left': 0
		});
		this.nextBtn = this.constructButton(this.options.nextBtn).css({
			'right': 0
		});

		this.preActive = this.options.preBtn.activeClass || this.options.navBtnActiveClass;
		this.preDisable = this.options.preBtn.disableClass || this.options.navBtnDisableClass;
		this.nextActive = this.options.nextBtn.activeClass || this.options.navBtnActiveClass;
		this.nextDisable = this.options.nextBtn.disableClass || this.options.navBtnDisableClass;

		this.navBar.append(this.preBtn);
		this.navBar.append(this.nextBtn);

		this.preBtnWidth = this.getWidth(this.preBtn);
		this.nextBtnWidth = this.getWidth(this.nextBtn);

		this.preBtn.on('click', function(e) {
			this.prePage();
		}.bind(this));

		this.nextBtn.on('click', function(e) {
			this.nextPage();
		}.bind(this));

		this.render();
	};

	FlipNavigationBar.prototype = {
		CURSOR: 'pointer',

		DATA_PREFIX: 'data-',

		NAV_BAR_TAG: 'nav',
		NAV_BUTTON_TAG: 'span',
		NAV_MASK_TAG: 'div',
		NAV_CONTENT_TAG: 'div',
		NAV_ITEM_TAG: 'a',

		DEFAULT_NAV_BAR_CLASS: 'flip-nav-bar',
		DEFAULT_NAV_CONTENT_CLASS: 'flip-nav-content',
		DEFAULT_NAV_ITEM_CLASS: 'flip-nav-item',
		DEFAULT_NAV_BTN_CLASS: 'flip-nav-btn',
		DEFAULT_NAV_BTN_ACTIVE_CLASS: 'flip-nav-active-btn',
		DEFAULT_NAV_BTN_DISABLE_CLASS: 'flip-nav-disable-btn',
		DEFAULT_NAV_ITEM_SELECTED_CLASS: 'flip-nav-item-selected',

		checkOptions: function(options) {
			this.options = $.extend({
				'container': $(document.body),
				'navBarClass': this.DEFAULT_NAV_BAR_CLASS,
				'navContentClass': this.DEFAULT_NAV_CONTENT_CLASS,
				'navItemClass': this.DEFAULT_NAV_ITEM_CLASS,
				'navItemSelectedClass': this.DEFAULT_NAV_ITEM_SELECTED_CLASS,
				'navBtnClass': this.DEFAULT_NAV_BTN_CLASS,
				'navBtnActiveClass': this.DEFAULT_NAV_BTN_ACTIVE_CLASS,
				'navBtnDisableClass': this.DEFAULT_NAV_BTN_DISABLE_CLASS,
				'preBtn': {
					'content': '<<'
				},
				'nextBtn': {
					'content': '>>'
				},
				'navData': [],
				'defaultSelected': '',
				'jumpToSelected': true,
				'callback': function(data) {}
			}, options);
		},

		// 得到传入的外层容器对象
		getContainer: function() {
			if (typeof this.options.container === 'object') {
				return this.options.container;
			} else if (typeof this.options.container === 'string') {
				var container = $(this.options.container);

				if (container.length === 0) {
					return null;	
				} else {
					return container;	
				}
			}
		},

		// 构造pre/next按钮
		constructButton: function(btnOpts, type) {
			var btn = createElement(this.NAV_BUTTON_TAG).attr({
				'id': btnOpts.id,
				'class': btnOpts.className || this.options.navBtnClass
			}).css({
				'position': 'absolute',
				'top': 0, 
				'cursor': this.CURSOR
			}).html(btnOpts.content);

			return btn;
		},

		setItemData: function(item, data, exceptArr) {
			var exceptMap = {};

			$.each(exceptArr, function(i, ea) {
				exceptMap[ea] = true;
			});

			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					if (!exceptMap[prop]) {
						item.attr(this.DATA_PREFIX + prop, data[prop]);	
					}
				}
			}
		},

		getItemData: function(item) {
			var data = {};
			var attributes = item.attributes;
			var reg = new RegExp('^' + this.DATA_PREFIX + '*');

			for (var prop in attributes) {
				if (attributes.hasOwnProperty(prop)) {
					if (reg.test(attributes[prop].name)) {
						var attr = attributes[prop].name.replace(reg, '');

						data[attr] = attributes[prop].value;
					}
				}
			}

			return data;
		},

		// 构造滚动内容
		constructNavSection: function() {
			var self = this;

			var navMask = createElement(self.NAV_MASK_TAG).attr({
				'class': self.options.navContentClass
			}).css({
				'overflow': 'hidden'
			});

			var navContent = createElement(self.NAV_CONTENT_TAG).css({
				'position': 'relative',
				'width': '999999999999999px'
			});

			navMask.append(navContent);
			var items = [];

			$.each(self.options.navData, function(i, itemData) {
				var item = createElement(self.NAV_ITEM_TAG).attr({
					'class': self.options.navItemClass
				}).css({
					'cursor': self.CURSOR,
					'float': 'left'
				}).html(itemData.content);

				self.setItemData(item, itemData, ['content']);	

				items.push(item);
			});

			navContent.append(items);

			navContent.on('click', self.NAV_ITEM_TAG, function(e) {
				var id = $(this).attr(self.DATA_PREFIX + 'id');

				self.select(id);
			});

			self.navContent = navContent;
			self.navMask = navMask;

			return navMask;
		},

		getTargets: function(attrName, attrValue) {
			if (!attrValue || typeof attrValue === 'object') {
				return [];
			};

			return this.navBar.find('[' + attrName + '=' + attrValue + ']');
		},

		// 选中某个item
		select: function(id, passive) {
			var targets = this.getTargets(this.DATA_PREFIX + 'id', id + '');

			if (targets.length === 0) {
				return false;	
			}

			var item = targets[0];
			var data = this.getItemData(item);

			this.clearSelection();
			this.selected = id;
			$(item).addClass(this.options.navItemSelectedClass);

			if (this.options.jumpToSelected) {
				this.jumpToItem(id);	
			}

			this.options.callback.call(this, data);
		},

		clearSelection: function() {
			this.navBar.find(this.NAV_ITEM_TAG).removeClass(this.options.navItemSelectedClass);
		},

		getWidth: function(target, options) {
			var result = 0;
			var contentWidth = parseFloat(target.css('width'));
			var paddingRight = parseFloat(target.css('padding-right'));
			var paddingLeft = parseFloat(target.css('padding-left'));
			var marginRight = parseFloat(target.css('margin-right'));
			var marginLeft = parseFloat(target.css('margin-left'));
			var borderLeft = parseFloat(target.css('border-left-width')) 
				var borderRight = parseFloat(target.css('border-right-width'));
			var map = {
				'cw': contentWidth,
				'pr': paddingRight,
				'pl': paddingLeft,
				'mr': marginRight,
				'ml': marginLeft,
				'bl': borderLeft,
				'br': borderRight
			};

			if (options === undefined) {
				options = ['cw', 'pr', 'pl', 'mr', 'ml', 'bl', 'br'];	
			}

			$.each(options, function(i, opt) {
				result += map[opt];
			});

			return result;
		},

		// 得到滚动区域的总宽度
		getTotalNavItemWidth: function() {
			var length = this.navContent.children().length;

			if (length === 0) {
				return 0;	
			}

			var leftItem = this.navContent.children()[0];
			var rightItem = this.navContent.children()[length - 1];

			var width = $(rightItem).position().left - $(leftItem).position().left + this.getWidth($(rightItem));

			return Math.ceil(width);
		},

		// 是否有下一页
		hasNextPage: function() {
			var visualNavItemWidth = this.navMask.width();

			return Math.abs(this.scrollDistance) < (this.totalNavItemWidth - visualNavItemWidth);
		},

		// 是否有上一页
		hasPrePage: function() {
			return this.scrollDistance < 0;		
		},

		// 处理翻页按钮的状态
		handleBtn: function() {
			if (this.hasNextPage()) {
				this.nextBtn.removeClass(this.nextDisable).addClass(this.nextActive);
				this.nextBtn.css('cursor', 'pointer');
			} else {
				this.nextBtn.removeClass(this.nextActive).addClass(this.nextDisable);
				this.nextBtn.css('cursor', 'auto');
			}

			if (this.hasPrePage()) {
				this.preBtn.removeClass(this.preDisable).addClass(this.preActive);
				this.preBtn.css('cursor', 'pointer');
			} else {
				this.preBtn.removeClass(this.preActive).addClass(this.preDisable);
				this.preBtn.css('cursor', 'auto');
			}		  
		},

		getPreOffset: function() {
			var items = this.navContent.children();	
			var currentDistance = Math.abs(this.scrollDistance);
			var distance = 0;

			for (var i = 0; i < items.length; i++) {
				var itemWidth = this.getWidth($(items[i]), ['cw', 'br', 'bl', 'pr', 'pl']);	

				distance = itemWidth + parseFloat($(items[i]).css('margin-left')) + $(items[i]).position().left;

				if (distance > currentDistance) {
					return distance - currentDistance;
				} else if (distance === currentDistance) {
					var target = items[i+1] ? items[i+1] : null;

					return target ? parseFloat($(target).css('margin-left')) + parseFloat($(items[i]).css('margin-right')) : 0;	
				}
			}
		},

		getNextOffset: function() {
			var items = this.navContent.children();	
			var currentDistance = Math.abs(this.scrollDistance);
			var distance = 0;

			for (var i = 0; i < items.length; i++) {
				var itemWidth = this.getWidth($(items[i]), ['cw', 'br', 'bl', 'pr', 'pl']);

				distance = itemWidth + parseFloat($(items[i]).css('margin-left')) + $(items[i]).position().left;

				if (distance > currentDistance) {
					return itemWidth - (distance - currentDistance);
				} else if (distance === currentDistance) {
					var target = items[i+1] ? items[i+1] : null;

					return target ? - parseFloat($(target).css('margin-left')) - parseFloat($(items[i]).css('margin-right')) : 0;	
				}
			}
		},

		// 上一项
		preItem: function() {
			var targets = this.getTargets(this.DATA_PREFIX + 'id', this.selected + '');

			if (targets.length === 0) {
				return false;
			}

			var index = $(targets[0]).index();

			if (index === 0) {
				return false;	
			} else {
				var id = $(this.navContent.children()[index - 1]).attr(this.DATA_PREFIX + 'id');

				this.select(id, true);
			}
		},

		// 下一项
		nextItem: function() {
			var targets = this.getTargets(this.DATA_PREFIX + 'id', this.selected + '');

			if (targets.length === 0) {
				return false;
			}

			var lastIndex = this.navContent.children().length - 1;
			var index = $(targets[0]).index();

			if (lastIndex === index) {
				return false;	
			} else {
				var id = $(this.navContent.children()[index + 1]).attr(this.DATA_PREFIX + 'id');

				this.select(id, true);
			}
		},

		// 上一页 
		prePage: function() {
			var visualNavItemWidth = this.navMask.width();

			if (this.hasPrePage()) {
				var offset = this.getPreOffset();

				this.scrollDistance += visualNavItemWidth; 

				if (!this.hasPrePage()) {
					this.scrollDistance = 0;
				} else if (offset !== 0) {
					this.scrollDistance -= offset;	
				}

				this.navContent.css('margin-left', this.scrollDistance + 'px');
			}

			this.handleBtn();
		},

		// 下一页	
		nextPage: function() {
			var visualNavItemWidth = this.navMask.width();

			if (this.hasNextPage()) {
				this.scrollDistance -= visualNavItemWidth; 

				var offset = this.getNextOffset();

				if (!this.hasNextPage()) {
					this.scrollDistance = visualNavItemWidth - this.totalNavItemWidth;
				} else if (offset !== 0) {
					this.scrollDistance += offset;
				}

				this.navContent.css('margin-left', this.scrollDistance + 'px');
			}

			this.handleBtn();
		},

		// 滚动到指定项
		jumpToItem: function(id) {
			var visualNavItemWidth = this.navMask.width();
			var targets = this.getTargets(this.DATA_PREFIX + 'id', id + '');

			if (targets.length === 0) {
				return false;	
			}

			var itemWidth = this.getWidth($(targets[0]), ['ml', 'cw']);
			var left = $(targets[0]).position().left;
			var cur = Math.abs(this.scrollDistance);

			if (left >= cur && left <= cur + visualNavItemWidth - itemWidth) {
				return;	
			}

			this.scrollDistance = -$(targets[0]).position().left - this.getWidth($(targets[0]), ['ml'])

				if (!this.hasPrePage()) {
					this.scrollDistance = 0;	
				} else if (!this.hasNextPage()) {
					this.scrollDistance = visualNavItemWidth - this.totalNavItemWidth;	
				}

			this.navContent.css('margin-left', this.scrollDistance + 'px');
			this.handleBtn();
		},

		// 修改指定项的状态
		changeItemStatus: function(id, targetStatus) {
			var targets = this.getTargets(this.DATA_PREFIX + 'id', id + '');

			if (targets.length === 0) {
				return false;
			}

			var item = $(targets[0]);
			var originStatus = item.attr(this.DATA_PREFIX + 'status');

			item.removeClass(originStatus);
			item.attr(this.DATA_PREFIX + 'status', targetStatus);
		},

		// 得到指定项的状态
		getItemStatus: function(id) {
			var targets = this.getTargets(this.DATA_PREFIX + 'id', id + '');

			if (targets.length === 0) {
				return false;	
			}

			var item = $(targets[0]);

			return item.attr(this.DATA_PREFIX + 'status');
		},

		render: function() {
			this.containerWidth = parseFloat(this.container.css('width'));

			var navSection = this.constructNavSection();

			this.navMask.css('margin-left', this.preBtnWidth);
			this.navMask.css('margin-right', this.nextBtnWidth);

			this.preBtn.after(navSection);

			// 设置整个翻页区域的总宽度
			this.totalNavItemWidth = this.getTotalNavItemWidth();

			this.select(this.selected);
			this.handleBtn();
		}

	};

	return FlipNavigationBar;
}));


