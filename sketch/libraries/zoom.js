
var controls = {
  view: {x: 0, y: 0, zoom: 1},
  viewPos: { prevX: null,  prevY: null,  isDragging: false },
  focused: true,
  enabled: true
}

//Put this in Setup:

//canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))


//Put this in draw:

//translate(controls.view.x, controls.view.y);
//scale(controls.view.zoom);


//window.mousePressed = e => Controls.move(controls).mousePressed(e)
// window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
// window.mouseReleased = e => Controls.move(controls).mouseReleased(e)
//window.mouseWheel = e => Controls.zoom(controls).worldZoom(e)


class Controls {
  static move(controls) {
    function mousePressed(e) {
        if(!controls.enabled){ return;}
        controls.viewPos.isDragging = true;

        console.log(controls.viewPos)
        console.log(controls)
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        controls.viewPos.prevX = x;
        controls.viewPos.prevY = y;
        //controls.focused=!controls.focused; //toggle "focus" via click
    }

    function mouseMoved(e) {
        if(!controls.enabled ||  !controls.focused){ return;}
        const {prevX, prevY, isDragging} = controls.viewPos;
        if(!isDragging) return;
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.

        const pos = {x: x, y: y};
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;

        if(prevX || prevY) {
        controls.view.x += dx;
        controls.view.y += dy;
        controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
        }
    }

    function mouseReleased(e) {
        if(!controls.enabled){ return;}
        controls.viewPos.isDragging = false;
        controls.viewPos.prevX = null;
        controls.viewPos.prevY = null;

    }
 
    return {
      mousePressed, 
      mouseMoved, 
      mouseReleased
    }
  }

  static zoom(controls,p) {
    // function calcPos(x, y, zoom) {
    //   const newX = width - (width * zoom - x);
    //   const newY = height - (height * zoom - y);
    //   return {x: newX, y: newY}
    // }

    function worldZoom(e) {
        if(!controls.enabled ||  !controls.focused){ return;}
        let w,h;
        if(p!=null){
          w=p.width,
          h=p.height;
        } else{
          w=width,
          h=height;
        }
       
        var {x, y, deltaY} = e;
        var rect = e.target.getBoundingClientRect();
        x = x - rect.left; //x position within the element.
        y = y - rect.top;  //y position within the element.
        const direction = deltaY > 0 ? -1 : 1;
        const factor = 0.03;
        const zoom =  1+direction * factor;

        const wx = (x-controls.view.x)/(w*controls.view.zoom);
        const wy = (y-controls.view.y)/(h*controls.view.zoom);
        

        let newZoom=controls.view.zoom*zoom;

        controls.view.x += wx*w*(controls.view.zoom-newZoom);
        controls.view.y += wy*h*(controls.view.zoom-newZoom);

        controls.view.zoom = newZoom;
    }

    return {worldZoom}
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