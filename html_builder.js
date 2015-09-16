
function HtmlBuilder(parent, tagName) {
    var self = this;
    this._parent = parent;
    this._tagName = tagName;
    this._attributes = [];
    this._classes = [];
    this._style = [];
    this._children = [];

    this.build = function() {
        var ele = document.createElement(self._tagName);
        for(var i=0; i<self._attributes.length; i++) {
            ele.setAttribute(self._attributes[i][0], self._attributes[i][1]);
        }
        for(var i=0; i<self._style.length; i++) {
            ele.style[self._style[i][0]] = self._style[i][1];
        }
        ele.className = this._classes.join(" ");

        for(var i=0; i<self._children.length; i++) {
            ele.appendChild(self._children[i].build());
        }
        return ele;
    };

    this.style = function(name, value) {
        self._style.push([name, value]);
        return self;
    };

    this.addClass = function(className) {
        self._classes.push(className);
        return self;
    };

    this.ele = function(name) {
        var builder = new HtmlBuilder(self, name);
        self._children.push(builder);
        return builder;
    };

    this.up = function() {
        if(self._parent == null) {
            return self;
        }
        return self._parent;
    };

    this.attr = function(name, value) {
        self._attributes.append([name, value]);
        return self;
    };

    this.text = function(text) {
        self._children.push(new _TextNodeBuilder(self, text));
        return self;
    };

    this.appendTo = function(ele) {
        ele.appendChild(this.build());
    };
}

function _TextNodeBuilder(parent, text) {
    var self = this;
    this._parent = parent;
    this._text = text;

    this.build = function() {
        return document.createTextNode(self._text);
    };

    this.up = function() {
        if(self._parent == null) {
            return self;
        }
        return self._parent;
    };

}

