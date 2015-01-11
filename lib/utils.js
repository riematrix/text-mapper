/**
 * Created by Stanley Zhou on 2014/9/2.
 */
function extend(options, target, decendent){
    for(var k in options){
        if(options.hasOwnProperty(k) && !decendent || decendent){
            target[k] = options[k];
        }
    }
}

/**
 * evaluate expression like "{var}"
 * @param obj
 * @param replace
 * @param ignore
 * @returns {*|evaluate}
 */
function evaluate(obj, replace, ignore){
    obj = obj || this;
    var regexp = /\{([a-zA-Z0-9_-]+)\}/gi;
    for(var k in obj){
        if(obj.hasOwnProperty(k) && (!ignore || !ignore(k))){
            var val = obj[k];
            if(regexp.test(val)){
                obj[k] = val.replace(regexp,replace)
            }
        }
    }
    return obj;
}

function selfEvaluate(obj,ignore){
    obj = obj || this;
    return evaluate(obj,function(str, p1){
        return obj[p1];
    },ignore);
}

function ElementHighlighter(options){
    extend(options, this.options);
}
ElementHighlighter.prototype = {

};

function ajax(options){
    var xhr1= new XMLHttpRequest();
    xhr1.open(options.type, options.url, true);
    if (options.type && xhr1.overrideMimeType) {
        xhr1.overrideMimeType(options.type);
    }

    xhr1.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
            options.success.apply(options, [this.response]);
        }
    };
    xhr1.send();
}

/**
 * text mouseover listener
 * element keep linkage targets as _linkageTargets
 * @param e
 */
function linkageMouseOverListener(e){
    var linkageTargets = this._linkageTargets;
    for(var i=0;i<linkageTargets.length;i++){
        var node = linkageTargets[i];
        addClass(node,"mapper-localize-active");
    }
}
/**
 * text mouseout listener
 * @param e
 */
function linkageMouseOutListener(e){
    var linkageTargets = this._linkageTargets;
    for(var i=0;i<linkageTargets.length;i++){
        var node = linkageTargets[i];
        removeClass(node,"mapper-localize-active");
    }
}

/**
 * Scroll animate
 * @param elem
 * @param style
 * @param unit
 * @param from
 * @param to
 * @param time
 * @param prop
 */
function animate(elem,style,unit,from,to,time,prop) {
    if( !elem) return;
    var start = new Date().getTime(),
        timer = setInterval(function() {
            var step = Math.min(1,(new Date().getTime()-start)/time);
            if (prop) {
                elem[style] = (from+step*(to-from))+unit;
            } else {
                elem.style[style] = (from+step*(to-from))+unit;
            }
            if( step == 1) clearInterval(timer);
        },25);
    elem.style[style] = from+unit;
}

/**
 * check if an element is descendant of another
 * @param parent
 * @param child
 * @returns {boolean}
 */
function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function exportCsvData(name, source){
    var mimeType = "text/csv";
    source = /*"charset=utf-8," + */encodeURI(source);
    exportTextData(name, source, mimeType);
}

function exportTextData(name, source, mimeType){
    mimeType = mimeType ? mimeType : "text/plain";
    source = "data:" + mimeType + ";" + "charset=utf-8," + source;
    var a = document.createElement("a");
    a.download = name;
    a.href = source;
    document.body.appendChild(a);
    a.click();
}

/**
 * simple deferred object
 * @constructor
 */
function Deferred(){
    this._done = [];
    this._fail = [];
}
Deferred.prototype = {
    execute: function(list, args){
        var i = list.length;
        args = Array.prototype.slice.call(args);
        while(i--) list[i].apply(null, args);
    },
    resolve: function(){
        this.execute(this._done, arguments);
    },
    reject: function(){
        this.execute(this._fail, arguments);
    },
    done: function(callback){
        this._done.push(callback);
        return this.promise();
    },
    fail: function(callback){
        this._fail.push(callback);
        return this.promise();
    },
    promise: function(){
        return this;
    }
};

//-------------- simple class manipulator ----------//
function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) obj.className = obj.className.trim() + " " + cls;
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}

function toggleClass(obj,cls){
    if(hasClass(obj,cls)){
        removeClass(obj, cls);
    }else{
        addClass(obj, cls);
    }
} 