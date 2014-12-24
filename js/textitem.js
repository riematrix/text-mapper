/**
 * Created by Stanley Zhou on 2014/12/21.
 */

/**
 * text item editor
 * display as row of localize editor
 *
 * @param data
 * @constructor
 */
function TextItem(data) {
    this.text = data.text;
    this.alias = data.alias || this.text;
    this.key = data.key || "";
    this.path = data.path;
    this.createByHand = data.createByHand;
	this.hash = typeof data.hash !== "undefined" ? data.hash : location.hash;

    var dom = data.dom;
    if (!dom && this.path) {
        try {
            dom = Xpath.getFrameElements(document, this.path)[0]
        } catch (e) {
        }
    }
    this.textDom = dom;

    this.init(document);

    if (!this.textDom) {
        console.warn("can not retrieve dom for path ", this.path, " with original text " + this.text);
        if (!this.createByHand || location.hash != this.hash) {
            this.inactive()
        }
    } else {
        if (this.text != this.textDom.innerText) {
            console.warn("current dom text " + this.textDom.innerText + " from path " + this.path + " doesn't match original text " + this.text);
            this.inactive()
        } else {
            this.active()
        }
    }

    this._update = [];
    this._remove = [];
    this._inactive = [];
    this._active = [];
    this._focus = [];
}
TextItem.prototype = {
    init: function(doc) {
        var row = doc.createElement("p");
        var label = doc.createElement("label"),
            span = doc.createElement("span"),
            textInput = doc.createElement("input"),
            keyInput = doc.createElement("input"),
            removeLink = doc.createElement("a");

        textInput.className = "text-value-edit hidden";
        label.title = span.innerText = this.alias;
        label.appendChild(span);
        label.appendChild(textInput);

        row.appendChild(label);
        row.appendChild(keyInput);
        row.appendChild(removeLink);
        row.className = "mapper-localize-text-item";
        this.dom = row;

        var self = this;
        keyInput.value = self.key;
        keyInput.onkeyup = function(e) {
            if (e.keyCode == 13) {
                self.update("key change");
                return
            }
            self.key = this.value
        };
        keyInput.onblur = function(e) {
            self.key = this.value;
            self.update("key blur")
        };
        this.keyInput = keyInput;

        span.onclick = function(e) {
            addClass(this, "hidden");
            removeClass(textInput, "hidden");
            textInput.value = this.innerText
        };

        textInput.onblur = function(e) {
            addClass(this, "hidden");
            removeClass(span, "hidden");
            label.title = span.innerText = self.alias = this.value;
            self.update()
        };
        textInput.onkeyup = function(e) {
            if (e.keyCode == 13) {
                this.blur()
            }
        };

        removeLink.innerText = "x";
        removeLink.className = "remove-link";
        removeLink.onclick = function() {
            self.remove();
        }
    },
    renderText: function() {
    },
    linkDataList: function(id) {
        this.keyInput.setAttribute("list", id)
    },
    inactive: function() {
        this.activeStatus = false;
        addClass(this.dom, "inactive");
        return this
    },
    oninactive: function(fn) {
        this._inactive.push(fn)
    },
    active: function() {
        this.activeStatus = true;
        removeClass(this.dom, "inactive");
        return this;
    },
    onactive: function(fn) {
        this._active.push(fn);
    },
    focus: function() {
        this.keyInput.focus();
        this.applyHandlers(this._focus, [this]);
    },
    onfocus: function(fn) {
        this._focus.push(fn);
    },
    linkage: function(nodes, drill) {
        var dom = this.dom, targets = dom._linkageTargets || [], node;
        dom._linkageTargets = targets;
        for (var i = 0; i < nodes.length; i++) {
            node = typeof drill === "function" ? drill(nodes[i]) : nodes[i];
            node._linkageTargets = [dom];
            node.addEventListener("mouseover", linkageMouseOverListener);
            node.addEventListener("mouseout", linkageMouseOutListener);
            targets.push(node)
        }
        dom.addEventListener("mouseover", linkageMouseOverListener);
        dom.addEventListener("mouseout", linkageMouseOutListener);
        return this;
    },
    unlinkage: function() {
        var dom = this.dom, node, nodes = dom._linkageTargets;
        if (nodes) {
            for (var c = 0; c < nodes.length; c++) {
                node = nodes[c];
                removeClass(node, "mapper-localize-active");
                node.removeEventListener("mouseover", linkageMouseOverListener);
                node.removeEventListener("mouseout", linkageMouseOutListener);
                node._linkageTargets = []
            }
        }
        dom.removeEventListener("mouseover", linkageMouseOverListener);
        dom.removeEventListener("mouseout", linkageMouseOutListener);
        dom._linkageTargets = []
    },
    remove: function() {
        this.unlinkage();
        this.dom.parentElement.removeChild(this.dom);
        this.applyHandlers(this._remove, [this])
    },
    update: function(ev) {
        this.applyHandlers(this._update, [this,ev])
    },
    onupdate: function(fn) {
        this._update.push(fn)
    },
    onremove: function(fn) {
        this._remove.push(fn)
    },
    applyHandlers: function(fns, args) {
        var c = fns.length;
        while (c--) {
            fns[c].apply(null, args)
        }
    },
    serialise: function() {
        return {
            text: this.text,
            path: this.path,
            key: this.key,
            alias: this.alias,
            createByHand: this.createByHand,
			hash: this.hash
        }
    },
    invalid: function(){
        addClass(this.dom,"invalid");
    },
    valid: function(){
        removeClass(this.dom,"invalid");
    }
};