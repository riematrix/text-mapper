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

    var toolbar = new ToolBar();
    this.toolbar = toolbar;

    var counter = document.createElement("span");
    counter.style["float"] = "right";
    counter.style["color"] = "#ffffff";
    toolbar.dom.appendChild(counter);
    this.counter = counter;

    container.appendChild(toolbar.dom);
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
        this.textCollection = textCollection;
        var self = this;
        var dictionary = this.textDictionary;
        dictionary.init().done(function(dataList) {
            self.reloadTextItemsData(dataList);
        });

        var revertFileUpload = document.createElement("input");
        revertFileUpload.type = "file";
        revertFileUpload.style.display = "none";
        revertFileUpload.onchange = function(e){
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;
                    console.log("reverted on " + new Date(),data);
                    revertFileUpload.style.display = "none";
                    dictionary.revert(data);
                    self.removeAllTextItem().reloadTextItemsData(JSON.parse(data));
                };
                reader.readAsText(file);
            }
        };
        self.toolbar.appendButtons([
            {text: "Create",event: "click",handler: function(){
                self.createTextItem({
                    text: "New_Text_" + new Date().getTime(),
                    createByHand: true,
                    hash: location.hash
                });
            }},
            {text: "Clear All",event: "click",handler: function(){
                self.removeAllTextItem();
                dictionary.removeAll();
            }},
            {text: "Scan",event: "click",handler: function(){
                self.textCollection.each(function(text, nodes) {
                    self.createTextItem({
                            dom: nodes[0].dom,
                            //path: Xpath.getElementXPath(nodes[0].dom),
                            text: text,
                            hash: location.hash
                        }
                        , nodes);
                });
            }},
            {text: "Export",event: "click",handler: function(){
                exportCsvData("result.csv", dictionary.toCsv());
            }},
            {text: "Dump",event: "click",handler: function(){
                var filename = "data.jte",
                    data = dictionary.serialise();
                exportTextData(filename, data);
            }},
            {text: "Revert",event: "click",
                handler: function(){
                    var display = revertFileUpload.style.display;
                    revertFileUpload.style.display = display === "none" ? "" : "none";
                },
                init: function(button, dom){
                    dom.appendChild(revertFileUpload);
                    dom.onblur = function(){
                        revertFileUpload.style.display = "none";
                    };
                }
            },
            {text: "Sync",event: "click",
                handler: function(){
                    dictionary.removeAll().synchronize(function(dataList){
                        self.removeAllTextItem();
                        self.reloadTextItemsData(dataList);
                    });
                }
            }
        ]);

        if (this.expanded) {
            this.currentWidth = this.width
        }
        return this;
    },
    reloadTextItemsData: function(dataList){
        for (var i = 0; i < dataList.length; i++) {
            this.appendTextItem(dataList[i]);
        }
        this.initTextItems();
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
    initTextItems: function() {
        this.eachTextItem(function(index, item) {
            item.inactive().unlinkage();
            if (item.createByHand && location.hash == item.hash) {
                item.active();
            }
        });
        var active = 0, textItems = this.textItems;
        this.textCollection.each(function(text, nodes) {
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
        var textItem = this.appendTextItem(item);
        if (linkageNodes) {
            textItem.linkage(linkageNodes, function(node) {
                return node.dom
            })
        }
        textItem.focus();
        var textDictionary = this.textDictionary;
        textDictionary.add(textItem.serialise());
        this.updateCounter();
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
    removeAllTextItem: function() {
        this.eachTextItem(function(text, item){
            var dom = item.dom;
            dom.parentElement.removeChild(dom);
        });
        this.textItems = {};
        this.updateCounter();
        return this;
    },
    eachTextItem: function(fn) {
        var textItems = this.textItems;
        for (var text in textItems) {
            if (textItems.hasOwnProperty(text)) {
                var textItem = textItems[text];
                if (textItem) {
                    fn(text, textItem)
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

function ToolBar(){
    var toolbar = document.createElement("div");
    toolbar.className = "mapper-localize-area-toolbar";
    this.dom = toolbar;

}
ToolBar.prototype = {
    appendButton: function(options){
        var link = document.createElement("a");
        link.innerText = options.text;
        this.dom.appendChild(link);
        link.addEventListener(options.event, options.handler);
        var init = options.init;
        if(typeof init == "function"){
            init(this, this.dom);
        }
    },
    appendButtons: function(buttons){
        for(var i=0;i<buttons.length;i++){
            this.appendButton(buttons[i]);
        }
    }
};