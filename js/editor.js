/**
 * Created by Stanley Zhou on 2014/12/24.
 */
 
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
            self.createTextItem({text: "New_Text_" + new Date().getTime(),createByHand: true, hash: location.hash})
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
            item.inactive().unlinkage()
            if (item.createByHand && location.hash == item.hash) {
				item.active();
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
            textItem.onupdate(function(item,ev) {
                self.updateTextItem(item,ev)
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
    updateTextItem: function(textItem, ev) {
        var textDictionary = this.textDictionary,
            dataList = this.recommendDataList;
        var key = textItem.key;
        dataList.addOption(key);
        var keyTextMap = textDictionary.keyTextMap,
            text = keyTextMap[key],
            prevItem = this.textItems[text];
        // unique key check
        if(text && text != textItem.text)
        {
            prevItem.invalid();
            textItem.invalid();
        }
        /*if((ev === "key change" || ev === "key blur") && key){
            textItem.invalid();
        }*/
        else{
            textItem.valid();
            textDictionary.update(textItem.serialise())
        }
    },
    removeTextItem: function(textItem) {
        var textDictionary = this.textDictionary,
            dataList = this.recommendDataList;
        dataList.removeOption(textItem.key);// necessary?
        textDictionary.remove(textItem.text, textItem);
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