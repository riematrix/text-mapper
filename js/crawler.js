/**
 * Created by Administrator on 2014/9/5.
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


function TextItem(b) {
    this.text = b.text;
    this.alias = b.alias || this.text;
    this.key = b.key || "";
    this.path = b.path;
    this.createByHand = b.createByHand;
    var a = b.dom;
    if (!a && this.path) {
        try {
            a = Xpath.getFrameElements(document, this.path)[0]
        } catch (c) {
        }
    }
    this.textDom = a;
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
    this._focus = []
}
TextItem.prototype = {init: function(f) {
        var h = f.createElement("p");
        var c = f.createElement("label"), d = f.createElement("span"), e = f.createElement("input"), b = f.createElement("input"), g = f.createElement("a");
        e.className = "text-value-edit hidden";
        c.title = d.innerText = this.alias;
        c.appendChild(d);
        c.appendChild(e);
        h.appendChild(c);
        h.appendChild(b);
        h.appendChild(g);
        h.className = "mapper-localize-text-item";
        this.dom = h;
        var a = this;
        b.value = a.key;
        b.onkeyup = function(i) {
            if (i.keyCode == 13) {
                a.update();
                return
            }
            a.key = this.value
        };
        b.onblur = function(i) {
            a.key = this.value;
            a.update()
        };
        this.keyInput = b;
        d.onclick = function(i) {
            addClass(this, "hidden");
            removeClass(e, "hidden");
            e.value = this.innerText
        };
        e.onblur = function(i) {
            addClass(this, "hidden");
            removeClass(d, "hidden");
            c.title = d.innerText = a.alias = this.value;
            a.update()
        };
        e.onkeyup = function(i) {
            if (i.keyCode == 13) {
                this.blur()
            }
        };
        g.innerText = "x";
        g.className = "remove-link";
        g.onclick = function() {
            a.remove()
        }
    },renderText: function() {
    },linkDataList: function(a) {
        this.keyInput.setAttribute("list", a)
    },inactive: function() {
        this.activeStatus = false;
        addClass(this.dom, "inactive");
        return this
    },oninactive: function(a) {
        this._inactive.push(a)
    },active: function() {
        this.activeStatus = true;
        removeClass(this.dom, "inactive");
        return this
    },onactive: function(a) {
        this._active.push(a)
    },focus: function() {
        this.keyInput.focus();
        this.applyHandlers(this._focus, [this])
    },onfocus: function(a) {
        this._focus.push(a)
    },linkage: function(c, a) {
        var f = this.dom, b = f._linkageTargets || [], e;
        f._linkageTargets = b;
        for (var d = 0; d < c.length; d++) {
            e = typeof a === "function" ? a(c[d]) : c[d];
            e._linkageTargets = [f];
            e.addEventListener("mouseover", linkageMouseOverListener);
            e.addEventListener("mouseout", linkageMouseOutListener);
            b.push(e)
        }
        f.addEventListener("mouseover", linkageMouseOverListener);
        f.addEventListener("mouseout", linkageMouseOutListener);
        return this
    },unlinkage: function() {
        var b = this.dom, d, a = b._linkageTargets;
        if (a) {
            for (var c = 0; c < a.length; c++) {
                d = a[c];
                removeClass(d, "mapper-localize-active");
                d.removeEventListener("mouseover", linkageMouseOverListener);
                d.removeEventListener("mouseout", linkageMouseOutListener);
                d._linkageTargets = []
            }
        }
        b.removeEventListener("mouseover", linkageMouseOverListener);
        b.removeEventListener("mouseout", linkageMouseOutListener);
        b._linkageTargets = []
    },remove: function() {
        this.unlinkage();
        this.dom.parentElement.removeChild(this.dom);
        this.applyHandlers(this._remove, [this])
    },update: function() {
        this.applyHandlers(this._update, [this])
    },onupdate: function(a) {
        this._update.push(a)
    },onremove: function(a) {
        this._remove.push(a)
    },applyHandlers: function(a, b) {
        var c = a.length;
        while (c--) {
            a[c].apply(null, b)
        }
    },serialise: function() {
        return {text: this.text,path: this.path,key: this.key,alias: this.alias,createByHand: this.createByHand}
    }};

function DataList(a, b) {
    this.data = {};
    var c = document.createElement("datalist");
    this.dom = c;
    this.id = c.id = "datalist_" + new Date().getTime();
    if (a) {
        this.addOptions(a, b)
    }
}
DataList.prototype = {addOption: function(b) {
        if (!this.hasOption(b)) {
            var a = document.createElement("option");
            a.value = b;
            this.data[b] = a;
            this.dom.appendChild(a)
        }
    },addOptions: function(a, c) {
        var b = a.length, f = typeof c === "function";
        for (var d = 0; d < b; d++) {
            var e = a[d];
            var g = f ? c(e) : e;
            this.addOption(g)
        }
    },removeOption: function(b) {
        if (this.hasOption(b)) {
            var a = this.data[b];
            this.dom.removeChild(a);
            delete this.data[b]
        }
    },hasOption: function(b) {
        var a = this.data[b];
        return typeof a !== "undefined"
    }};
function LocalizeEditor(b, h) {
    this.textDictionary = h;
    this.textItems = {};
    var i = document.createElement("div");
    i.className = "mapper-localize-area";
    var g = document.createElement("div");
    g.className = "mapper-localize-area-toolbar";
    var d = document.createElement("a");
    d.innerText = "Create";
    g.appendChild(d);
    this.createLink = d;
    var e = document.createElement("a");
    e.innerText = "Clear All";
    g.appendChild(e);
    this.clearLink = e;
    var f = document.createElement("a");
    f.innerText = "Export";
    g.appendChild(f);
    this.exportLink = f;
    
    var dumpLink = document.createElement("a");
    dumpLink.innerText = "Dump";
    g.appendChild(dumpLink);
    this.dumpLink = dumpLink;

    var revertLink = document.createElement("a");
    revertLink.innerText = "Revert";
    g.appendChild(revertLink);
    this.revertLink = revertLink;
    
    var a = document.createElement("span");
    a.style["float"] = "right";
    g.appendChild(a);
    this.counter = a;
    i.appendChild(g);
    var c = document.createElement("div");
    c.className = "mapper-localize-area-gird";
    this.editorGrid = c;
    i.appendChild(c);
    this.recommendDataList = new DataList([], function(j) {
        return j.key
    });
    i.appendChild(this.recommendDataList.dom);
    this.dom = i;
    b.appendChild(i)
}
;
LocalizeEditor.prototype = {
width: 400,
currentWidth: 0,
contentWidth: undefined,
expanded: localStorage.getItem("localize_area_expanded") === "true",
init: function(b) {
        var a = this;
        var c = this.textDictionary;
        c.init().done(function(e) {
            for (var d = 0; d < e.length; d++) {
                a.appendTextItem(e[d])
            }
            a.initTextItems(b)
        });
        this.createLink.onclick = function() {
            a.createTextItem({text: "New_Text_" + new Date().getTime(),createByHand: true})
        };
        this.exportLink.onclick = function() {
            exportCsvData("result.csv", c.toCsv())
        };
        this.clearLink.onclick = function() {
            c.removeAll()
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
                    textDictionary.revert(e.target.result);
//                        self.removeChild(fileupload);
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
                data = textDictionary.serialise();
            exportTextData(filename, data);
        };
        
        if (this.expanded) {
            this.currentWidth = this.width
        }
        return this
    },render: function() {
        var b = this.dom, 
        // c = document.getElementById("rightPanel"), 
        c = document.body, 
        a = Number(c.style.width.replace("px", ""));
        b.style.width = this.currentWidth + "px";
        a = this.contentWidth || (a - this.currentWidth);
        c.style.width = a + "px"
    },toggle: function() {
        var e = this.width, 
        b = this.dom, 
        d = Number(b.style.width.replace("px", "").trim()), 
        c = document.body, 
        	//c = document.getElementById("rightPanel"), 
        a = Number(c.style.width.replace("px", "").trim());
        if (this.expanded) {
            d -= e;
            a += e
        } else {
            d += e;
            a -= e
        }
        this.expanded = !this.expanded;
        localStorage.setItem("localize_area_expanded", this.expanded);
        this.currentWidth = d;
        this.contentWidth = a;
        b.style.width = d + "px";
        c.style.width = a + "px"
    },updateCounter: function() {
        var a = 0, b = 0;
        this.eachTextItem(function(c, d) {
            if (d.activeStatus) {
                a++
            }
            b++
        });
        this.counter.innerText = a + "/" + b
    },initTextItems: function(a) {
        this.eachTextItem(function(d, e) {
            if (e.createByHand) {
                e.inactive().unlinkage()
            }
        });
        var b = 0, c = this.textItems;
        a.each(function(d, e) {
            var f = c[d];
            if (f) {
                f.active().linkage(e, function(g) {
                    return g.dom
                });
                b++
            } else {
            }
        });
        this.updateCounter();
        return b
    },appendTextItem: function(a) {
        var e = a.text;
        var d = this.textItems[e];
        if (!d) {
            d = this.textItems[e] = new TextItem(a);
            this.editorGrid.appendChild(d.dom);
            var c = this.recommendDataList;
            d.linkDataList(c.id);
            c.addOption(d.key);
            var b = this;
            d.onupdate(function(f) {
                b.updateTextItem(f)
            });
            d.onremove(function(f) {
                b.removeTextItem(f)
            });
            d.onfocus(function(h) {
                var f = h.dom.offsetTop;
                var g = b.editorGrid.scrollTop;
                animate(b.editorGrid, "scrollTop", "", g, f, 10, g != 0)
            })
        }
        return d
    },createTextItem: function(a, c) {
        var d = this.appendTextItem(a);
        if (c) {
            d.linkage(c, function(e) {
                return e.dom
            })
        }
        d.focus();
        var b = this.textDictionary;
        b.add(d.serialise());
        this.updateCounter()
    },updateTextItem: function(c) {
        var a = this.textDictionary, b = this.recommendDataList;
        b.addOption(c.key);
        a.update(c.serialise())
    },removeTextItem: function(c) {
        var a = this.textDictionary, b = this.recommendDataList;
        b.removeOption(c.key);
        a.remove(c.text);
        this.textItems[c.text] = null;
        this.updateCounter()
    },eachTextItem: function(a) {
        var d = this.textItems;
        for (var c in d) {
            if (d.hasOwnProperty(c)) {
                var b = d[c];
                if (b) {
                    a(c, b)
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
var textDictionary = top.textDictionary || {textDictionaryPath: "text_dictionary_path.json",serializedDataLoaded: false,data: {},total: 0,fs: new Filesystem(PERSISTENT, 2 * 1024 * 1024),init: function() {
        var b = this, a = new Deferred();
        b.fs.init().done(function() {
            b.fs.readFile(b.textDictionaryPath).done(function(d) {
                var f = JSON.parse(d), e;
                for (var c = 0; c < f.length; c++) {
                    e = f[c].text;
                    b.data[e] = f[c]
                }
                b.serializedDataLoaded = true;
                a.resolve(f)
            }).fail(function(c) {
                a.reject();
                if (FileError.NOT_FOUND_ERR == c.code) {
                    b.fs.createFile(b.textDictionaryPath, "[]")
                }
            })
        });
        return a.promise()
    },add: function(a) {
        var b = a.text;
        if (!this.data[b]) {
            this.data[b] = a;
            this.save()
        } else {
            console.warn("text item key conflicts: " + b)
        }
    },remove: function(a) {
        this.data[a] = null;
        this.save()
    },update: function(a) {
        var b = a.text;
        if (this.data[b]) {
            this.data[b] = a;
            this.save()
        } else {
            console.warn("text item does not exist: " + b)
        }
    },removeAll: function() {
        this.fs.createFile(this.textDictionaryPath, "[]")
    },save: function() {
        var a = [];
        this.each(function(c, b) {
            a.push(b)
        });
        this.fs.createFile(this.textDictionaryPath, JSON.stringify(a))
    },toCsv: function() {
        var a = "\ufeff";
        this.each(function(c, b) {
            a += b.key + "," + b.alias + "\n"
        });
        return a
    },each: function(b) {
        var c = this.data;
        for (var a in c) {
            if (c.hasOwnProperty(a)) {
                var d = c[a];
                if (d) {
                    b.apply(c, [a, d])
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
    }};
    
function collectTargetListener(d) {
    if (d.button === 0 && d.ctrlKey) {
        d.preventDefault();
        d.stopImmediatePropagation();
        d.stopPropagation();
        var a = d.target, c = Xpath.getFrameElementsXpath(a);
        var f = a.innerText.trim();
        if (isDescendant(localizeArea.dom, a)) {
        } else {
            if (f != "") {
                var b = textNodeCollection.current[f];
                localizeArea.createTextItem({dom: a,path: c,text: f}, b)
            }
        }
    }
}

var textNodeCollection = {current: {},frames: {},each: function(c) {
        var d = this.current;
        for (var a in d) {
            if (d.hasOwnProperty(a)) {
                c.apply(this, [a, d[a]])
            }
        }
        var b = this.frames;
        for (var e in b) {
            if (b.hasOwnProperty(e)) {
                b[e].each(c)
            }
        }
    }};
    
(function collectTextNodes() {
    var f = textNodeCollection.current;
    var g = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var d;
    while (d = g.nextNode()) {
        var a = d.nodeValue.trim(), c = f[a];
        if (a != "") {
            if (!c) {
                f[a] = c = []
            }
            var e = d.parentNode;
            c.push({dom: e,path: Xpath.getFrameElementsXpath(e),text: a});
            e.addEventListener("click", collectTargetListener)
        }
    }
    var b = window.frameElement;
    if (!b) {
    } else {
        parent.textNodeCollection.frames[b.id] = textNodeCollection
    }
})();

var localizeArea = top.localizeArea || null;
(function init() {
    var a = window.frameElement;
    if (!a) {
        //var b = document.getElementById("outerContainer");
        var b = document.body;
        localizeArea = new LocalizeEditor(b, textDictionary);
        localizeArea.init(top.textNodeCollection).render();
        window.onresize = function() {
            localizeArea.render()
        }
    } else {
        try {
            localizeArea.initTextItems(top.textNodeCollection)
        } catch (c) {
        }
    }
    document.addEventListener("click", collectTargetListener);
    document.addEventListener("keydown", function(d) {
        if (d.keyCode === 73 && d.ctrlKey) {
            localizeArea.toggle()
        }
    })
})();
