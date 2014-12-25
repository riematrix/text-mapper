function Locator(){
	this.dom = document.createElement("div");
	document.body.appendChild(this.dom);
	this.init();
}
Locator.prototype = {
	init: function(){
		var container = this.dom;
		container.className = "mapper-localize-locator-mask hidden";
		
		function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX + window.pageXOffset;
            mouse.y = ev.pageY + window.pageYOffset;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null,
		tracking = false;

    container.onmousemove = function (e) {
        setMousePosition();
		if(!tracking) return ;
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }
	
    container.onmousedown = function (e) {
        if (element === null){
			tracking = true;
            console.log("begun.");
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = 'mapper-localize-locator-element';
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            container.appendChild(element)
            container.style.cursor = "crosshair";
        }
    };
	container.onmouseup = function (e) {
        if (element !== null) {
			tracking = false;
            element = null;
            container.style.cursor = "default";
            console.log("finsihed.");
        } 
    }
	},
	show: function(){
		removeClass(this.dom,"hidden");
	},
	hide: function(){
		addClass(this.dom,"hidden");
	}
};