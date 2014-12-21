/**
 * Created by Stanley Zhou on 2014/12/21.
 */

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