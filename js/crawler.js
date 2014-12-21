/**
 * Created by Stanley Zhou on 2014/9/5.
 */
/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
 console.log(request)
 switch (request.method) {
 case 'collect_persistent_info':
 console.log("collect");
 sendResponse({status: ""});
 break;
 default:
 sendResponse({});
 break;
 }
 });*/

/*var rightClicke dElement;
 (function init(){
 document.addEventListener("mousedown",function(e){
 if(e.button === 2){
 rightClickedElement = e.target;
 }
 })
 })();

 function collectPersistentInfo(info){
 var path = Xpath.getElementXPath(rightClickedElement);
 console.log(rightClickedElement.innerText,path);
 }

 function collectTemporaryInfo(info){
 console.log(info);
 }*/

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
        if (!this.createByHand) {
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
        keyInput.onkeyup = function(i) {
            if (i.keyCode == 13) {
                self.update();
                return
            }
            self.key = this.value
        };
        keyInput.onblur = function(e) {
            self.key = this.value;
            self.update()
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
    update: function() {
        this.applyHandlers(this._update, [this])
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
            createByHand: this.createByHand
        }
    },
    invalid: function(){
        addClass(this.dom,"invalid");
    },
    valid: function(){
        removeClass(this.dom,"invalid");
    }
};

/**
 * auto complete data list
 * @param data
 * @param drill
 * @constructor
 */
function DataList(data, drill) {
    this.data = {};
    var datalist = document.createElement("datalist");
    this.dom = datalist;
    this.id = datalist.id = "datalist_" + new Date().getTime();
    if (data) {
        this.addOptions(data, drill)
    }
}
DataList.prototype = {
    addOption: function(option) {
        if (!this.hasOption(option)) {
            var optionDom = document.createElement("option");
            optionDom.value = option;
            this.data[option] = optionDom;
            this.dom.appendChild(optionDom);
            return true;
        }
        return false;
    },
    addOptions: function(options, drill) {
        var l = options.length, needDrill = typeof drill === "function";
        for (var d = 0; d < l; d++) {
            var option = options[d];
            option = needDrill ? drill(option) : option;
            this.addOption(option);
        }
    },
    removeOption: function(option) {
        if (this.hasOption(option)) {
            var optionDom = this.data[option];
            this.dom.removeChild(optionDom);
            delete this.data[option]
        }
    },
    hasOption: function(option) {
        var exist = this.data[option];
        return typeof exist !== "undefined"
    }
};

/**
 * main editor controller
 * @param parent
 * @param textDictionary
 * @constructor
 */
function LocalizeEditor(parent, textDictionary) {
    this.textDictionary = textDictionary;
    this.textItems = {};

    var container = document.createElement("div");
    container.className = "mapper-localize-area hidden";

    var toolbar = document.createElement("div");
    toolbar.className = "mapper-localize-area-toolbar";

    var create = document.createElement("a");
    create.innerText = "Create";
    toolbar.appendChild(create);
    this.createLink = create;

    var clear = document.createElement("a");
    clear.innerText = "Clear All";
    toolbar.appendChild(clear);
    this.clearLink = clear;

    var exportLink = document.createElement("a");
    exportLink.innerText = "Export";
    toolbar.appendChild(exportLink);
    this.exportLink = exportLink;

    var dumpLink = document.createElement("a");
    dumpLink.innerText = "Dump";
    toolbar.appendChild(dumpLink);
    this.dumpLink = dumpLink;

    var revertLink = document.createElement("a");
    revertLink.innerText = "Revert";
    toolbar.appendChild(revertLink);
    this.revertLink = revertLink;

    var counter = document.createElement("span");
    counter.style["float"] = "right";
    counter.style["color"] = "#ffffff";
    toolbar.appendChild(counter);
    this.counter = counter;

    container.appendChild(toolbar);
    var dataGrid = document.createElement("div");
    dataGrid.className = "mapper-localize-area-gird";
    this.editorGrid = dataGrid;
    container.appendChild(dataGrid);

    this.recommendDataList = new DataList([], function(item) {
        return item.key
    });
    container.appendChild(this.recommendDataList.dom);
    this.dom = container;
    parent.appendChild(container);
}
LocalizeEditor.prototype = {
    width: 400,
    currentWidth: 0,
    contentWidth: undefined,
    expanded: localStorage.getItem("localize_area_expanded") === "true",
    init: function(textCollection) {
        var self = this;
        var dictionary = this.textDictionary;
        dictionary.init().done(function(data) {
            for (var d = 0; d < data.length; d++) {
                self.appendTextItem(data[d])
            }
            self.initTextItems(textCollection);
        });

        this.createLink.onclick = function() {
            self.createTextItem({text: "New_Text_" + new Date().getTime(),createByHand: true})
        };

        this.exportLink.onclick = function() {
            exportCsvData("result.csv", dictionary.toCsv())
        };

        this.clearLink.onclick = function() {
            dictionary.removeAll()
        };

        var fileupload = document.createElement("input");
        fileupload.type = "file";
        fileupload.style.display = "none";
        fileupload.onchange = function(e){
            var f = e.target.files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function(e) {
                    console.log(e.target.result);
                    fileupload.style.display = "none";
                    dictionary.revert(e.target.result);
                };
                r.readAsText(f);
            }
        };
        this.revertLink.appendChild(fileupload);
        this.revertLink.onclick = function(){
            var display = fileupload.style.display;
            fileupload.style.display = display === "none" ? "" : "none";
        };
        this.revertLink.onblur = function(){
            fileupload.style.display = "none";
        };

        this.dumpLink.onclick = function(){
            var filename = "data.jte",
                data = dictionary.serialise();
            exportTextData(filename, data);
        };

        if (this.expanded) {
            this.currentWidth = this.width
        }
        return this;
    },
    render: function() {
        var dom = this.dom,
        // c = document.getElementById("rightPanel"), 
            shrinkTarget = document.body,
            targetWidth = shrinkTarget.offsetWidth;
//            targetWidth = Number(shrinkTarget.style.width.replace("px", ""));
        dom.style.width = this.currentWidth + "px";
        targetWidth = this.contentWidth || (targetWidth - this.currentWidth);
//        shrinkTarget.style.width = targetWidth + "px"
        shrinkTarget.offsetWidth = targetWidth
    },
    toggle: function() {
        var width = this.width,
            dom = this.dom,
            currentWidth = Number(dom.style.width.replace("px", "").trim()),
            shrinkTarget = document.body,
        //c = document.getElementById("rightPanel"),
            targetWidth = shrinkTarget.offsetWidth;
//            targetWidth = Number(shrinkTarget.style.width.replace("px", "").trim());
        if (this.expanded) {
            currentWidth -= width;
            targetWidth += width;
            addClass(dom,"hidden");
        } else {
            currentWidth += width;
            targetWidth -= width;
            removeClass(dom,"hidden");
        }
        this.expanded = !this.expanded;
        localStorage.setItem("localize_area_expanded", this.expanded);
        this.currentWidth = currentWidth;
        this.contentWidth = targetWidth;
        dom.style.width = currentWidth + "px";
        shrinkTarget.offsetWidth = targetWidth;
//        shrinkTarget.style.width = targetWidth + "px"
    },
    updateCounter: function() {
        var activeCount = 0, totalCount = 0;
        this.eachTextItem(function(c, d) {
            if (d.activeStatus) {
                activeCount++
            }
            totalCount++
        });
        this.counter.innerText = activeCount + "/" + totalCount
    },
    initTextItems: function(textCollection) {
        this.eachTextItem(function(index, item) {
            if (item.createByHand) {
                item.inactive().unlinkage()
            }
        });
        var active = 0, textItems = this.textItems;
        textCollection.each(function(text, nodes) {
            var f = textItems[text];
            if (f) {
                f.active().linkage(nodes, function(g) {
                    return g.dom;
                });
                active++
            } else {
            }
        });
        this.updateCounter();
        return active
    },
    appendTextItem: function(item) {
        var textId = item.text;
        var textItem = this.textItems[textId];
        if (!textItem) {
            textItem = this.textItems[textId] = new TextItem(item);
            this.editorGrid.appendChild(textItem.dom);

            var datalist = this.recommendDataList;
            textItem.linkDataList(datalist.id);
            datalist.addOption(textItem.key);

            var self = this;
            textItem.onupdate(function(item) {
                self.updateTextItem(item)
            });
            textItem.onremove(function(f) {
                self.removeTextItem(f)
            });
            textItem.onfocus(function(input) {
                var offsetTop = input.dom.offsetTop;
                var scrollTop = self.editorGrid.scrollTop;
                animate(self.editorGrid, "scrollTop", "", scrollTop, offsetTop, 100, scrollTop != 0)
            })
        }
        return textItem
    },
    createTextItem: function(item, linkageNodes) {
        var d = this.appendTextItem(item);
        if (linkageNodes) {
            d.linkage(linkageNodes, function(e) {
                return e.dom
            })
        }
        d.focus();
        var b = this.textDictionary;
        b.add(d.serialise());
        this.updateCounter()
    },
    updateTextItem: function(textItem) {
        var textDictionary = this.textDictionary,
            dataList = this.recommendDataList;
        dataList.addOption(textItem.key);
        //TODO check in key set
        textDictionary.update(textItem.serialise())
    },
    removeTextItem: function(textItem) {
        var textDictionary = this.textDictionary,
            dataList = this.recommendDataList;
        dataList.removeOption(textItem.key);
        textDictionary.remove(textItem.text);
        this.textItems[textItem.text] = null;
        this.updateCounter()
    },
    eachTextItem: function(fn) {
        var textItems = this.textItems;
        for (var item in textItems) {
            if (textItems.hasOwnProperty(item)) {
                var textItem = textItems[item];
                if (textItem) {
                    fn(item, textItem)
                }
            }
        }
    },
    save: function(){
        var data = this.serialise();
        this.fs.createFile(this.textDictionaryPath, data);
    },
    serialise: function(){
        var textItemList =[];
        this.each(function(text, item){
            textItemList.push(item);
        });
        return JSON.stringify(textItemList);
    }
};
var textDictionary = top.textDictionary || {
    textDictionaryPath: "text_dictionary_path.json",
    serializedDataLoaded: false,
    data: {},
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
                    text = dataArray[c].text;
                    self.data[text] = dataArray[c]
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
            this.save()
        } else {
            //console.warn("text item key conflicts: " + textId)
        }
    },
    remove: function(textId) {
        this.data[textId] = null;
        this.save()
    },
    update: function(textItem) {
        var textId = textItem.text;
        if (this.data[textId]) {
            this.data[textId] = textItem;
            this.save()
        } else {
            console.warn("text item does not exist: " + textId)
        }
    },
    removeAll: function() {
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
                localizeArea.createTextItem({dom: el,path: path,text: text}
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
        if (e.keyCode === 73 && e.ctrlKey) {
            localizeArea.toggle()
        }
    })
})();
