
class Control {
	constructor(p){
		this.p=p;
		this.view = {x: 0, y: 0, zoom: 1};
		this.viewPos={ prevX: null,  prevY: null,  isDragging: false },
		this.enabled=true,
		this.focused=true;
	}

  //apply a transform to send screen coordinates to draw coordinates;
  transformCoords(xcoord,ycoord){
    //aapply each of the transforms below in reverse

    xcoord-=this.view.x;      ycoord-=this.view.y; 
    xcoord/=this.view.zoom;   ycoord/=this.view.zoom; 
    xcoord-=this.p.width/2;   ycoord-= this.p.height/2;
    return [xcoord,ycoord];
  }

  //setup canvas to be centered on 0,0
  transformCanvas(){
    this.p.translate(this.view.x, this.view.y);
		this.p.scale(this.view.zoom);
		this.p.translate(this.p.width/2,this.p.height/2);
  }

	mousePressed(e) {
		if(!this.enabled){ return;}
		this.viewPos.isDragging = true;
		this.viewPos.prevX = e.clientX;
		this.viewPos.prevY = e.clientY;
	}
	
	mouseMoved(e) {
		if(!this.enabled){ return;}
		const {prevX, prevY, isDragging} = this.viewPos;
		if(!isDragging) return;

		const pos = {x: e.clientX, y: e.clientY};
		const dx = pos.x - prevX;
		const dy = pos.y - prevY;

		if(prevX || prevY) {
		this.view.x += dx;
		this.view.y += dy;
		this.viewPos.prevX = pos.x, this.viewPos.prevY = pos.y
		}
	}
	
	mouseReleased(e) {
		if(!this.enabled){ return;}
		this.viewPos.isDragging = false;
		this.viewPos.prevX = null;
		this.viewPos.prevY = null;
	}
	
	worldZoom(e) {
        if(!this.enabled ||  !this.focused){ return;}
        let w=this.p.width,
          h=this.p.height;
       
        var {x, y, deltaY} = e;
        var rect = e.target.getBoundingClientRect();
        x = x - rect.left; //x position within the element.
        y = y - rect.top;  //y position within the element.
        const direction = deltaY > 0 ? -1 : 1;
        const factor = 0.03;
        const zoom =  1+direction * factor;

        const wx = (x-this.view.x)/(w*this.view.zoom);
        const wy = (y-this.view.y)/(h*this.view.zoom);
        

        let newZoom=this.view.zoom*zoom;

        this.view.x += wx*w*(this.view.zoom-newZoom);
        this.view.y += wy*h*(this.view.zoom-newZoom);

        this.view.zoom = newZoom;
    }
}


// //Scroll lock
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  //window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}