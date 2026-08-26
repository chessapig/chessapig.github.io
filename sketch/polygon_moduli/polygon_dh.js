const FRG = '#E6CFB3'; //background color
const BKG = '#2c2621'; //foreground color

let containerId = "canvas";
let canvasSize
let windows, renderWindow


function setup() {
   
	let elem = document.getElementById(containerId);
    print(elem)
	boundingRect = elem.getBoundingClientRect();

    // // get computed border size
    let style = getComputedStyle(elem);
    let borderLeft = parseFloat(style.borderLeftWidth);
    let borderRight = parseFloat(style.borderRightWidth);
    let canvasWidth =  boundingRect.width - borderLeft - borderRight; //sets size of canvas.
    let canvasHeight =  boundingRect.height - borderLeft - borderRight; //sets size of canvas.
    canvasSize = canvasWidth;
	canvas = createCanvas(canvasWidth, canvasHeight , WEBGL);
	//canvas.parent(containerId);

    // THE MANUAL OVERRIDE: 
    // Wait a tiny fraction of a second to let any other scripts finish their nonsense, 
    // then forcefully move the canvas into the div.
    setTimeout(() => {
        let targetDiv = document.getElementById(containerId);
        let myCanvas = document.getElementById("defaultCanvas0");
        
        if (targetDiv && myCanvas) {
            targetDiv.appendChild(myCanvas);
        }
    }, 50); // 50 milliseconds is usually plenty of time


    let selectors = [];
    let numSelectors=5;
    let integerQuantization = 0.001;
    for(let i=0;i<numSelectors;i++){
        selectors.push(new IntervalDragger(0.3, {integerQuantization: integerQuantization}))

    }

    renderWindow = new DH_window({
		pixels: canvasSize,
        x: -1, y: -1, width: 2,
        selectors: selectors,
        integerQuantization: integerQuantization,
        doConstrain: true,
        doInteger: true,
	});

	windows = [renderWindow]; 
}


function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

	for (let w of windows) {
        w.clear();
		w.update();
		w.render();
		w.draw();
	}
}

class IntervalDragger extends ComplexDragger{
    
    constructor(x,options={}){
        const defaults = {
            integerQuantization: 0.1, //Scale of the integer
            doInteger: false,
		    };
        options = Object.assign({}, defaults, options);
        super(x,0,options);
    }

    // dragging behavior
    onUpdate(){
        let newX = this.mouse.x + this.offset.x;
        if(this.doInteger){
            this.x = round(newX/this.integerQuantization)*this.integerQuantization;
        } else {
            this.x = newX;
        }

        
    }    
}

class DH_window extends DraggerWindow{
    constructor(options={}){
        let camera = new Camera2D({
            xRange:[-10,10],
            yRange:[-0.5,0.5],
            zoom: -0.1
        })
        const defaults = {
            camera: camera,
            doInteger:false,
            multiDragType: "CLOSEST",
            allowVariableDimensions:false,
            integerQuantization: 0.1, //Scale of the integer
		};
        options = Object.assign({}, defaults, options);
        super(options);
    }

    update(){
        let numSelectors = this.selectors.length;
        for(let i=0; i<this.selectors.length; i++){
            let s = this.selectors[i];
            s.doInteger = this.doInteger
            s.y = map(i,0,numSelectors,-numSelectors/10,0);
        }
        return super.update();
    }

    getFixedPoints(){
        let numSticks = this.selectors.length;
        let fixedPoints = [];
        for(let n = 0; n<pow(2,numSticks);n++){
            let binary = numberToNary(n,2,numSticks) //string of ones and zeros
            let value = 0;
            for(let i = 0; i<numSticks; i++){
                value += (binary[i]*2-1)*abs(this.selectors[i].x/this.integerQuantization)
            }
            fixedPoints[n] = {value: value, binary: binary}
            
        }
        return fixedPoints;
    }

    render(){
        
        let ctx = this.g;
     
        ctx.noFill();
        ctx.stroke(FRG);
        ctx.strokeWeight(3);
        ctx.line(-100,0,100,0); 
        
        
        for(let s of this.selectors){
            ctx.stroke(lerpColor(s.color,color(255),0.5));
            ctx.line(s.x,s.y,-s.x,s.y);
        }

        this.plotFixedPoints(ctx)


        super.render();
    
    }

    plotFixedPoints(ctx){
        const fixedPoints = this.getFixedPoints();
        const frequencies = new Map();

        // 1. Count how many times each 'value' appears
        let largestValue=0;
        for(let pt of fixedPoints){
            let val = round(pt.value);
            frequencies.set(val, (frequencies.get(val) || 0) + 1);
            if(val > largestValue){
                largestValue = val;
            }
        }

        // 2. Draw the lines based on their counts
        const baseLength = 0.1; 
        for(let [val, count] of frequencies.entries()){
            // val is the coordinate, count determines the length
            ctx.line(val*this.integerQuantization, -baseLength * count, val*this.integerQuantization, baseLength * count);
        }

        ctx.noStroke();
        ctx.fill("#e66a57");
        ctx.circle(largestValue-this.selectors.length*this.integerQuantization,0,0.1)

    }
    generateSelectorDoubleClick(mousePos){
        if(abs(mousePos.y)<0.1){
            return new IntervalDragger(round(mousePos.x/this.integerQuantization)*this.integerQuantization);
        }
        
	}


    

}

/////////////////////////
// HELPER FUNCTIONS
/////////////////////////

//if length enabled, cut off at the length given by the length
function numberToNary(n,base,length=false){
    let nary = [];
    if(length){
        for(let i = 0; i < length; i++){
            nary.push(n%base);
            n = floor(n/base);
        }
    } else {
        while(n>0){
            nary.push(n%base);
            n = floor(n/base);
        }
    }
    return nary;
}

function naryToNumber(nary,base){
    let n = 0;
    for(let i = 0; i<nary.length;i++){
        n+= nary[i]*pow(base,i)
    }
    return n;
}



/////////////////////////
// MOUSE INTERACTION
/////////////////////////


function mouseWheel(event) {
	let didScroll = false;
	for (let w of windows) {
		didScroll =  w.scroll(event.delta) || didScroll;
	}

	if (didScroll) {
		event.preventDefault();
	}
}

function mousePressed() {
	for (let w of windows) {
		w.pressed();
	}
}

function mouseReleased() {
	for (let w of windows) {
		w.released();
	}
}

function doubleClicked(event) {
    for (let w of windows) {
		w.doubleClicked(mouseX, mouseY);
	}
}

function mouseDragged() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}

}

function keyPressed() {
    if (keyCode === SHIFT) {
        starWindow.multiDragType = "ALL";
    } 
}

function keyReleased() {
    if (keyCode === SHIFT) {
        starWindow.multiDragType = "CLOSEST";
    }
    
}

