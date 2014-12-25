/**
 * Created by Stanley Zhou on 2014/9/5.
 */

 /**
 main entry
 */

function checkAllowedDomains(){
	var allowExecuteDomains = localStorage.getItem("localize_domains");
	allowExecuteDomains = allowExecuteDomains ? JSON.parse(allowExecuteDomains) : [];
	for(var i=0;i<allowExecuteDomains.length;i++){
		var domain = allowExecuteDomains[i];
		if(location.host === domain){
			return true;
		}
	}
	return false;
}

if(!checkAllowedDomains){
	throw new Error("domain " + location.host + "is not allowed to execute, script will exit");
}
 
var textDictionary = top.textDictionary || {
    textDictionaryPath: "text_dictionary_path.json",
    serializedDataLoaded: false,
    data: {},
    keyTextMap: {},
    total: 0,
    fs: new Filesystem(PERSISTENT, 2 * 1024 * 1024),
    init: function() {
        var self = this, deferred = new Deferred();
        self.fs.init().done(function() {
            self.fs.readFile(self.textDictionaryPath).done(function(data) {
                var dataArray, text;
                try{
                    dataArray = JSON.parse(data);
                }
                catch(e){
                    console.error(e);
                    deferred.reject(e);
                    self.removeAll();
                    return;
                }
                for (var c = 0; c < dataArray.length; c++) {
                    var item = dataArray[c];
                    text = item.text;
                    self.data[text] = item;
                    if(item.key) self.keyTextMap[item.key] = text;
                }
                self.serializedDataLoaded = true;
                deferred.resolve(dataArray)
            }).fail(function(c) {
                deferred.reject();
                if (FileError.NOT_FOUND_ERR == c.code) {
                    self.removeAll();
                }
            })
        });
        return deferred.promise()
    },
    add: function(item) {
        var textId = item.text;
        if (!this.data[textId]) {
            this.data[textId] = item;
            if(item.key) this.keyTextMap[item.key] = textId;
            this.save()
        } else {
            //console.warn("text item key conflicts: " + textId)
        }
    },
    remove: function(textId,item) {
        delete this.data[textId];
        delete this.keyTextMap[item.key];
        this.save()
    },
    update: function(textItem) {
        var textId = textItem.text;
        if (this.data[textId]) {
            this.data[textId] = textItem;
            if(textItem.key) this.keyTextMap[textItem.key] = textId;
            this.save()
        } else {
            console.warn("text item does not exist: " + textId)
        }
    },
    removeAll: function() {
        this.data = {};
        this.keyTextMap = {};
        this.fs.createFile(this.textDictionaryPath, "[]")
    },
    save: function() {
        var data = this.serialise();
        this.fs.createFile(this.textDictionaryPath, data)
    },
    serialise: function(){
        var data = [];
        this.each(function(text, item) {
            data.push(item);
        });
        return JSON.stringify(data);
    },
    toCsv: function() {
        var prefix = "\ufeff";
        this.each(function(text, item) {
            prefix += item.key + "," + item.alias + "\n"
        });
        return prefix
    },
    each: function(fn) {
        var data = this.data;
        for (var text in data) {
            if (data.hasOwnProperty(text)) {
                var item = data[text];
                if (item) {
                    fn.apply(data, [text, item])
                }
            }
        }
    },
    revert: function(data){
        this.fs.createFile(this.textDictionaryPath, data);
        location.href = location.href;// TODO re-inject
    },
    synchronize: function(url){
        var self = this;
        ajax(url,function(data){    //TODO data source admin
            self.fs.createFile(this.textDictionaryPath, data);
        });
    }
};

function collectTargetListener(ev) {
    if (ev.button === 0 && ev.ctrlKey) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        var el = ev.target, path = Xpath.getFrameElementsXpath(el);
        var text = el.innerText.trim();
        if (isDescendant(localizeArea.dom, el)) {
        } else {
            if (text != "") {
                var textNodes = textNodeCollection.current[text];
                localizeArea.createTextItem({dom: el,path: path,text: text, hash: location.hash}
                    , textNodes)
            }
        }
    }
}

var textNodeCollection = {
    current: {},
    frames: {},
    each: function(fn) {
        var current = this.current;
        for (var text in current) {
            if (current.hasOwnProperty(text)) {
                fn.apply(this, [text, current[text]])
            }
        }
        var children = this.frames;
        for (var iframeId in children) {
            if (children.hasOwnProperty(iframeId)) {
                children[iframeId].each(fn)
            }
        }
    }
};

(function collectTextNodes() {
    var current = textNodeCollection.current;
    var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = treeWalker.nextNode()) {
        var text = node.nodeValue.trim(), nodes = current[text];
        if (text != "") {
            if (!nodes) {
                current[text] = nodes = []
            }
            var textContainer = node.parentNode;
            nodes.push({dom: textContainer,path: Xpath.getFrameElementsXpath(textContainer),text: text});
            textContainer.addEventListener("click", collectTargetListener)
        }
    }
    var frameElement = window.frameElement;
    if (!frameElement || !frameElement.id) {
    } else {
        parent.textNodeCollection.frames[frameElement.id] = textNodeCollection
    }
})();

var localizeArea = top.localizeArea || null;
(function init() {
    var frameElement = window.frameElement;
    if (!frameElement) {
        //var b = document.getElementById("outerContainer"); TODO
        var container = document.body;
        localizeArea = new LocalizeEditor(container, textDictionary);
        localizeArea.init(top.textNodeCollection).render();
        window.onresize = function() {
            localizeArea.render()
        }
    } else {
        try {
            localizeArea.initTextItems(top.textNodeCollection)
        } catch (e) {
        }
    }
    document.addEventListener("click", collectTargetListener);
    document.addEventListener("keydown", function(e) {
        if (e.keyCode === 73 && e.ctrlKey) { // Ctrl + i
            localizeArea.toggle();
        }
		else if (e.keyCode === 27) { // ESC 
            locator.hide();
        }
    })
})();


var locator = top.locator || new Locator();
locator.show();
