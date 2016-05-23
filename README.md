# flip-navigation-bar

![](https://travis-ci.org/TomasRan/flip-navigation-bar.svg?branch=master)
[![Code Climate](https://codeclimate.com/github/TomasRan/flip-navigation-bar/badges/gpa.svg)](https://codeclimate.com/github/TomasRan/flip-navigation-bar)
[![bitHound Overall Score](https://www.bithound.io/github/TomasRan/flip-navigation-bar/badges/score.svg)](https://www.bithound.io/github/TomasRan/flip-navigation-bar)
[![Issue Count](https://codeclimate.com/github/TomasRan/flip-navigation-bar/badges/issue_count.svg)](https://codeclimate.com/github/TomasRan/flip-navigation-bar)

## Description

Here is [demo](http://tomasran.github.io/flip-navigation-bar/demo/demo.html);

## Install

```
# use npm
$ npm install flip-navigation-bar

# use bower
$ bower install flip-navigation-bar
```

## Usage

```
	var FlipNavBar = require('flip-navigation-bar');

	var flipNavBar = new FilpNavBar({
		'container': '.main',
		'navData': [{
			'id': '',
			'content': '',
			'status': ''
		}, ... ],
		'defaultSelected': '3',
		'calllback': function() {}
	});
```

### Options
> container

##### description:
It's a string or a jquery selector passed to contain the flip nav bar.

> navBarClass

> navContentClass

##### description:
the class of navigation section

> navItemClass

##### description:
the class of single navigation item

> navItemSelectedClass

##### description:
the class of single navigation item when selected

> navBtnClass

##### description:
the class of both of pre and next btn

> btnActiveClass

##### description:
the class of pre/next which represents it can be clicked

> btnDisableClass:

##### description:
the class of pre/next which represents it cannot be clicked

> defaultSelected

##### description:
default selected navigation item's id

> jumpToSelected

##### description:
whether jump to selected item

> callback(data)

##### description:
callback when the navigation item is selected, and the data contains attributes: `id` and `status` of current selected.

> preBtn/nextBtn

##### description:
configuration of pre/next button

|attribute|description|
|:--|:--|
|content| content of button |
|className| class of button (if not set, it will inherit `navBtnClass`) |
|activeClass| active class of button (if not set , it will inherit `btnActiveClass`)|
|disableClass| disable class of button (if not set, it will inherit `btnDisableClass`)|

> navData

##### description:
data of navigation section, an array of objects, each object contains:

|attribute|description|
|:--|:--|
|id| id of each item |
|content| display content of each item |
|status| customrized status of each item |

### Methods
> select(id)

##### description:
select the specific navigation item's id

> changeItemStatus(id, status)

##### description:
change the item's status

## License
The MIT License (MIT)
Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUTNOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRIN GEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
