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
 *			'navBarId': '',				//（可选参数）翻页导航条容器自定义id
 *			'navBarClass': '',			//（可选参数）翻页导航条容器自定义class 
 *			'navBarWidth': '',			//（可选参数）翻页导航条宽度
 *			'navItemWidth': '',			//（可选参数）翻页导航项宽度
 *			'navBtnWidth': '',			//（可选参数）翻页导航按钮宽度
 *			'navContentClass': '',		//（可选参数）翻页导航区域的自定义class
 *			'navItemClass': '',			//（可选参数）翻页导航项的自定义class
 *			'itemSelectedClass': '',	//（可选参数）翻页导航项选中后的自定义class
 *			'statusClassMap': {},		// 用户自定义的状态与对应状态class的映射关系
 *			'defaultSelected': '',		// 默认选中的项 
 *			'jumpToSelected': '',		// 选中是否跳到对应项 
 *			'callback': '',				// 选中项执行的callback
 *
 *			'preBtn: {					// 前一页按钮配置
 *				'id': '',				//（可选参数）按钮的自定义id
 *				'content': '',			//（可选参数）按钮的内容（默认是‘pre’）
 *				'className': '',		//（可选参数）按钮自定义class
 *				'activeClass': '',		//（可选参数）按钮处于激活状态的自定义class
 *				'disableClass': '',		//（可选参数）按钮处于禁用状态的自定义class
 *			},
 *
 *			'nextBtn': {				// 后一页按钮配置
 *				'id': '',
 *				'className': '',
 *				'content': '',
 *				'activeClass': '',
 *				'disableClass': ''
 *			},
 *
 *			'navData': [{			// 滚动项数据
 *				'id': '',				//（必填参数）项唯一的id
 *				'content': '',			// 项的内容（默认为空）
 *				'status': ''			// 项的当前状态（项的当前状态不包含选中状态，是用户自定义的状态）
 *			}, {
 *				...
 *			}]
 *		});
 */

((function(global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function(jquery) {
			return factory(jquery);	
		});
	} else if (typeof module !== undefined && module.exports) {
		module.exports = factory(require('jquery'));
	} else {
		global.FlipNavigationBar = factory(global.jQuery);
	}
})(window || {}, function($) {
	var createElement = function(tagName) {
		return $(document.createElement(tagName));
	};

	var addCssStyle = function (cssString) {
		var style = document.createElement('style');

		style.setAttribute('type', 'text/css');

		if (style.styleSheet) {  
			style.styleSheet.cssText = cssString;  
		} else {  
			var cssText = document.createTextNode(cssString);  
			
			style.appendChild(cssText);  
		}  

		var head = document.getElementsByTagName('head');

		if (head.length) {
			head[0].appendChild(style);
		} else {
			document.documentElement.appendChild(style);
		}
	};

	var FlipNavigationBar = function(options) {
		this.checkOptions(options);

		// 设置当前选中项（选中项id）
		this.selected = this.options.defaultSelected || '';

		// 获得外层容器对象
		this.container = this.getContainer();

		// 当前的滚动距离
		this.scrollDistance = 0;

		// 滚动内容单个选择项的宽度
		this.navItemWidth = parseFloat(this.options.navItemWidth) || 0;

		// 生成滚动条容器
		this.navBar = createElement(this.NAV_BAR).attr({
			'id': this.options.navBarId
		}).css({
			'width': parseFloat(this.options.navBarWidth) + 'px' || 0,
			'white-space': 'nowrap',
			'overflow': 'hidden'
		});

		this.navBar.addClass(this.options.navBarClass);

		this.container.append(this.navBar);
		this.setNavBarSize();

		// 构造pre/next按钮
		this.preBtn = this.constructButton(this.options.preBtn, 'left');
		this.nextBtn = this.constructButton(this.options.nextBtn, 'right');

		this.navBar.append(this.preBtn);
		this.navBar.append(this.nextBtn);

		this.preBtnWidth = this.getOccupationWidth(this.preBtn, ['all']);
		this.nextBtnWidth = this.getOccupationWidth(this.nextBtn, ['all']);

		this.bindEvent(this.preBtn, 'click', function(e) {
			this.handlePreAction();
			this.handleBtn();
		}.bind(this));

		this.bindEvent(this.nextBtn, 'click', function(e) {
			this.handleNextAction();
			this.handleBtn();
		}.bind(this));

		// 滚动区域可视内容宽度
		this.setVisualNavWidth(); 

		this.render();
	};

	FlipNavigationBar.prototype = {
		CURSOR: 'pointer',

		NAV_BAR: 'div',
		NAV_BUTTON: 'span',
		NAV_MASK: 'div',
		NAV_CONTENT: 'div',
		NAV_ITEM: 'a',

		DEFAULT_NAV_BAR_WIDTH: 320,
		DEFAULT_NAV_ITEM_WIDTH: 32,
		DEFAULT_NAV_BTN_WIDTH: 30,

		DEFAULT_NAV_BAR_ID: 'flip-nav-bar',
		DEFAULT_NAV_BAR_CLASS: 'flip-nav-bar',
		DEFAULT_NAV_ITEM_CLASS: 'flip-nav-item',
		DEFAULT_NAV_BTN_CLASS: 'flip-nav-btn',
		DEFAULT_NAV_BTN_ACTIVE_CLASS: 'flip-nav-active-btn',
		DEFAULT_NAV_BTN_DISABLE_CLASS: 'flip-nav-disable-btn',
		DEFAULT_NAV_ITEM_SELECTED_CLASS: 'flip-nav-item-selected',

		DEFAULT_STYLE: {
			'flip-nav-bar': 'font-family: "Microsoft YaHei", arial, helvetica, sans-serif',

			'flip-nav-item': 'padding: 5px 0px;' +
				'border-top: 1px solid #d1d1d1;' +
				'border-bottom: 1px solid #d1d1d1;' +
				'color: #3a86d2;' +
				'text-align: center;',

			'flip-nav-btn': 'padding:5px 0px;' +
				'border: 1px solid #d1d1d1;' +
				'text-align: center;',

			'flip-nav-active-btn': 'color: #3a86d2;',

			'flip-nav-disable-btn': 'color: #d2d2d2',

			'flip-nav-item-selected': 'background: #3a86d2;color:#fff;'
		},

		getDefaultStyle: function() {
			var cssString = '';

			for (var prop in this.DEFAULT_STYLE) {
				if (this.DEFAULT_STYLE.hasOwnProperty(prop)) {
					cssString += '.'+  prop + 
						'{' + 
						this.DEFAULT_STYLE[prop] +
						'}' + '\n';	
				}
			}			

			return cssString;
		},

		checkOptions: function(options) {
			addCssStyle(this.getDefaultStyle());

			this.options = $.extend({
				'container': $(document.body),
				'navBarId': this.DEFAULT_NAV_BAR_ID,
				'navBarClass': this.DEFAULT_NAV_BAR_CLASS,
				'navItemClass': this.DEFAULT_NAV_ITEM_CLASS,
				'navItemSelectedClass': this.DEFAULT_NAV_ITEM_SELECTED_CLASS,
				'navBarWidth': this.DEFAULT_NAV_BAR_WIDTH,
				'navItemWidth': this.DEFAULT_NAV_ITEM_WIDTH,
				'navBtnWidth': this.DEFAULT_NAV_BTN_WIDTH,
				'preBtn': {
					'id': 'pre-btn',
					'className': this.DEFAULT_NAV_BTN_CLASS,
					'activeClass': this.DEFAULT_NAV_BTN_ACTIVE_CLASS,
					'disableClass': this.DEFAULT_NAV_BTN_DISABLE_CLASS,
					'content': '<<'
				},
				'nextBtn': {
					'id': 'next-btn',
					'className': this.DEFAULT_NAV_BTN_CLASS,
					'activeClass': this.DEFAULT_NAV_BTN_ACTIVE_CLASS,
					'disableClass': this.DEFAULT_NAV_BTN_DISABLE_CLASS,
					'content': '>>'
				},
				'navData': [],
				'statusClassMap': {},
				'defaultSelected': '',
				'jumpToSelected': true,
				'callback': function(data) {console.log(data)}
			}, options);

			this.options.navBarWidth = parseFloat(this.options.navBarWidth) || 0;
			this.options.navItemWidth = parseFloat(this.options.navItemWidth) || 0;
			this.options.navBtnWidth = parseFloat(this.options.navBtnWidth) || 0;
		},

		// 获取滚动条的高度和宽度
		setNavBarSize: function() {
			this.navBarWidth = parseFloat(this.navBar.css('width')) || 0;
			this.navBarHeight = parseFloat(this.navBar.css('height')) || 0;
		},

		// 得到传入的外层容器对象
		getContainer: function() {
			if (typeof this.options.container === 'object') {
				return this.options.container;
			} else if (typeof this.options.container === 'string') {
				return $(this.options.container);
			}
		},

		// 构造pre/next按钮
		constructButton: function(btnOpts, position) {
			var btn = createElement(this.NAV_BUTTON).attr({
				'id': btnOpts.id,
				'class': btnOpts.className 
			}).css({
				'float': position,
				'cursor': this.CURSOR
			}).html(btnOpts.content);

			if (this.options.navBtnWidth) {
				btn.css('width', this.options.navBtnWidth + 'px');
			}

			return btn;
		},

		// 得到滚动可视区域的宽度
		setVisualNavWidth: function() {
			this.visualNavWidth = Math.round(this.navBarWidth - this.preBtnWidth - this.nextBtnWidth);
		},

		// 构造滚动内容
		constructNavSection: function() {
			var navMask = createElement(this.NAV_MASK).css({
				'float': 'left',
				'width': this.visualNavWidth + 'px',
				'overflow': 'hidden'
			});

			var navContent = createElement(this.NAV_CONTENT).attr({
				'class': this.options.navContentClass
			}).css({
				'white-space': 'nowrap'
			});

			navContent.appendTo(navMask);

			$.each(this.options.navData, function(i, itemData) {
				var item = createElement(this.NAV_ITEM).attr({
					'class': this.options.navItemClass,
					'data-id': itemData.id,
					'data-current-status': itemData.status
				}).css({
					'display': 'inline-block',
					'cursor': this.CURSOR
				}).html(itemData.content).appendTo(navContent);

				if (this.navItemWidth) {
					item.css('width', this.navItemWidth + 'px');
				}

				item.addClass(this.options.statusClassMap[itemData.status]);
			}.bind(this));

			this.bindEvent(navContent, 'click', function(e) {
				if (e.target.nodeName.toLowerCase() === this.NAV_ITEM) {
					var id = $(e.target).attr('data-id');

					this.select(id, true);
				}
			}.bind(this));

			this.navContent = navContent;
			this.navMask = navMask;

			return navMask;
		},

		getTargetById: function(id) {
			return this.navBar.find('[data-id=' + id + ']');
		},

		// 选中某个item
		select: function(id, initiative) {
			var target = this.getTargetById(id);

			var data = {
				'id': id,
				'status': target.attr('data-current-status')
			};

			this.clearSelection();
			target.addClass(this.options.navItemSelectedClass);
			this.selected = id;

			if (!initiative && this.options.jumpToSelected) {
				this.jumpToItem(id);	
			}

			if (initiative) {
				this.options.callback.call(this, data);
			}
		},

		clearSelection: function() {
			this.navBar.find(this.NAV_ITEM).removeClass(this.options.navItemSelectedClass);
		},

		// 修改指定项的状态
		setItemStatus: function(id, targetStatus) {
			var item = this.getTargetById(id);
			var originStatus = item.attr('data-current-status');

			item.removeClass(this.options.statusClassMap[originStatus]);
			item.attr('data-current-status', currentStatus);
			item.addClass(this.options.statusClassMap[currentStatus]);
		},

		// 得到元素占据空间的宽度
		getOccupationWidth: function(element, args) {
			var contentWidth = parseFloat(element.css('width')) || 0;
			var marginWidth = parseFloat(element.css('margin-left')) + parseFloat(element.css('margin-right')) || 0;
			var paddingWidth = parseFloat(element.css('padding-left')) + parseFloat(element.css('padding-right')) || 0;
			var borderWidth = parseFloat(element.css('border-left-width')) + parseFloat(element.css('border-right-width')) || 0;

			var data = {
				'content': contentWidth,
				'margin': marginWidth,
				'padding': paddingWidth,
				'border': borderWidth,
				'all': contentWidth + marginWidth + paddingWidth + borderWidth
			};

			var result = 0;

			for (var i = 0; i < args.length; i++) {
				if (args[i] !== undefined) {
					result += data[args[i]];
				}
			}

			return result;
		},

		// 得到滚动区域的总宽度
		getTotalNavWidth: function() {
			var width = 0;

			$.each(this.navContent.children(), function(i, item) {
				width += this.getOccupationWidth($(item), ['margin', 'padding', 'border']);	
				width += this.navItemWidth;
			}.bind(this));

			return width;
		},

		// 判断是否有下一页
		hasNext: function() {
			return Math.abs(this.scrollDistance) < (this.totalNavWidth - this.visualNavWidth);
		},

		// 判断是否有上一页
		hasPre: function() {
			return this.scrollDistance < 0;		
		},

		// 处理 pre/next 按钮的状态
		handleBtn: function() {
			var preActive = this.options.preBtn.activeClass;
			var preDisable = this.options.preBtn.disableClass;
			var nextActive = this.options.nextBtn.activeClass;
			var nextDisable = this.options.nextBtn.disableClass;

			if (this.hasNext()) {
				this.nextBtn.removeClass(nextDisable).addClass(nextActive);
				this.nextBtn.css('cursor', 'pointer');
			} else {
				this.nextBtn.removeClass(nextActive).addClass(nextDisable);
				this.nextBtn.css('cursor', 'auto');
			}

			if (this.hasPre()) {
				this.preBtn.removeClass(preDisable).addClass(preActive);
				this.preBtn.css('cursor', 'pointer');
			} else {
				this.preBtn.removeClass(preActive).addClass(preDisable);
				this.preBtn.css('cursor', 'auto');
			}		  
		},

		// 处理pre按钮翻页操作
		handlePreAction: function() {
			if (this.hasPre()) {
				var totalItems = Math.abs(this.scrollDistance) / this.navItemWidth;
				var percent = totalItems - Math.floor(totalItems);
				var offset = percent ? this.navItemWidth * (1 - percent) : 0;

				this.scrollDistance += this.visualNavWidth; 

				if (!this.hasPre()) {
					this.scrollDistance = 0;
				} else if (offset !== 0) {
					this.scrollDistance -= offset;	
				}

				this.navContent.css('margin-left', this.scrollDistance + 'px');
			}
		},

		// 处理next按钮翻页操作
		handleNextAction: function() {
			if (this.hasNext()) {
				this.scrollDistance -= this.visualNavWidth; 

				var totalItems = Math.abs(this.scrollDistance) / this.navItemWidth;
				var percent = totalItems - Math.floor(totalItems);
				var offset = this.navItemWidth * percent;

				if (!this.hasNext()) {
					this.scrollDistance = this.visualNavWidth - this.totalNavWidth;
				} else if (offset !== 0) {
					this.scrollDistance += offset;
				}

				this.navContent.css('margin-left', this.scrollDistance + 'px');
			}
		},

		// 滚动到指定项
		jumpToItem: function(id) {
			var target = this.getTargetById(id);

			if (target.length === 0) {
				return false;	
			}

			this.scrollDistance = -(target.index() * this.navItemWidth);
			this.navContent.css('margin-left', this.scrollDistance + 'px');
			this.handleBtn();
		},

		render: function() {
			var navSection = this.constructNavSection();

			this.preBtn.after(navSection);
			this.totalNavWidth = this.getTotalNavWidth();
			this.navItemWidth = this.totalNavWidth / this.navContent.children().length;

			this.select(this.selected, true);
			this.handleBtn();

			// todo: resize
			/*	$(window).resize(function() {
					this.setNavBarSize();
					this.setVisualNavWidth();
					this.navMask.css({
						'width': this.visualNavWidth + 'px'
					});
					this.handleBtn();
				}.bind(this));*/
		},

		bindEvent: function(target, eventType, callback) {
			target.on(eventType, function(e) {
				callback(e);
			});
		},
	};

	return FlipNavigationBar;
}))
