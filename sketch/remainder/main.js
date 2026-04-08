
let N;
let inputN;
let sliderN;
let w;
let windows;
let doLabel=true;


const BKG = '#2c2621'; //background color
const FRG = '#E6CFB3'; //foreground color
const PRIMARY = '#E56B6F'; //background color

//Parent in file is "ifs_sketch"
let parent = "sketch";

function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvasSize = min(boundingRect.width*0.9,windowHeight*0.6); //sets size of canvas.
	canvas = createCanvas(canvasSize , canvasSize , P2D);
	canvas.parent(parent);

	w = new GraphicsWindow({
			pixels: canvasSize,
			x: -1,
			y:-1,
			width: 2,
			canvasMode: P2D
		}); 
	windows = [w]
	setupUI();
	setN(35);

	setupDials(w,N,{doPrintMode: false,doLabels:true});
}

//for n, setup CRT dials on window w
function setupDials(w, N,options={doPrintMode: false , doLabels: doLabel, doCopywrite: false}){
	w.selectors=[];//clear selectors
	
	let factors  = factorize(N);
	let currentN = N;

	let numDials=factors.length;
	let maxRadius= 0.9;
	let minRadius=0.1;
	let outerSpacing=1;
	let innerSpacing=1;
	for(let i=numDials; i>0; i=i-1){
		let currentFactor = factors[i-1];
		let r = map(i,0,numDials,minRadius,maxRadius);
		let innerR = map(i-1,0,numDials,minRadius,maxRadius);
		let lastR = map(i+1,0,numDials,minRadius,maxRadius);

		//first term measures inner spacing
		//second term measures outer spacing of next go around.
		let spacings = bezout(currentFactor, currentN / currentFactor); 
		innerSpacing = spacings[1]*outerSpacing;
		
		let bkgColor;
		if(options.doPrintMode){
			bkgColor = color(255);
			neutralColor = color(0);
			activeColor = color(0);
		} else {
			bkgColor = lerpColor(color(BKG),color(FRG),0.3*(1-i/numDials));
			neutralColor = color(FRG);
			activeColor = color(PRIMARY)
		}

		let doOutsideLabel = options.doLabels || (i==numDials);
		let doInsideLabel = options.doLabels
		
		w.selectors.push(new Dial({
			x:0,
			y:0, 
			outerRadius: r,
			innerRadius:innerR,
			outerSelectRadius:1,
			innerSelectRadius:innerR,
			outerNumber: currentN,
			innerNumber: currentFactor,
			centerLabel: N,
			outerSpacing: outerSpacing,
			innerSpacing: innerSpacing,
			arrowLength:  map(0.6,0,1,r,lastR),
			doArrow:  (i!=numDials),
			doPrintMode: options.doPrintMode,
			doCopywrite: options.doCopywrite,
			doOutsideLabel: doOutsideLabel,
			doInsideLabel: doInsideLabel,
			noColor: bkgColor,
			neutralColor: neutralColor,
			activeColor: activeColor
		}));
		currentN = currentN/currentFactor;
		outerSpacing = -spacings[0]*outerSpacing;
	}
	
}


function draw() {
	//recale to a box [-1,1]times [-1,1]
	scale(height / 2, -height / 2) 
	translate(1,-1);

	// label for n
	let container = document.getElementById("nFactorization");
	container.innerHTML = `${displayFactors(N)}`;

	w.g.background(BKG);
	w.g.stroke(FRG);
	w.g.strokeWeight(0.02);
	w.g.fill(BKG);
	

	for (let w of windows) {
		w.update();
		w.render();
		w.draw();
	}
}

function setN(newN){
	N=newN;
	sliderN.value(N);
	inputN.value(N);
	setupDials(w,N);
}

function setupUI(){
	// Left panel controls
	inputN = select("#inputN");
	sliderN = select("#sliderN");
	switchLabel = select('#doLabel')


	sliderN.input(() => {
		setN(int(sliderN.value()));
	});

	inputN.changed(() => {
		setN(parseN(inputN.value()));
	});

	switchLabel.changed(() => {
			doLabel = switchLabel.checked();
			console.log(doLabel);
			setupDials(w,N,{doLabels:doLabel});
		});

	document.getElementById("saveTemplateBtn").addEventListener("click", saveTemplate);



}

function saveTemplate(){
	let pixels=600;

	let dialHolder = new GraphicsWindow({
			pixels: pixels,
			x: -1,
			y:-1,
			width: 2,
			canvasMode: P2D
		}); 
	setupDials(dialHolder,N,{
		doPrintMode: true,
		doLabels:doLabel,
		doCopywrite: false});
	let dials = dialHolder.selectors;
	let totalWidth = 0;
	let margin= 0.1;
	let maxRadius = 0;
	for(let i=0;i<dials.length;i++){
		let dial = dials[i];
		totalWidth+= 2*dial.outerRadius;
		totalWidth+=0.1; //margin
		if(dial.outerRadius>maxRadius){
			maxRadius=dial.outerRadius;
		}
		if(i!=dials.length-1){
			dial.doCopywrite=true;
		}
	}
	let totalHeight = 2*maxRadius+margin*2;
	let printScreen = createGraphics(pixels*totalWidth,pixels*totalHeight);
	printScreen.scale(pixels,-pixels);
	printScreen.translate(0,-totalHeight/2);
	printScreen.background(255);
	for(let dial of dials){
		printScreen.translate((dial.outerRadius+margin/2),0);
		dial.draw(printScreen);
		printScreen.translate((dial.outerRadius+margin/2),0);
	}
	
	// printScreen.g.background(255);
	// printScreen.g.scale(1,-1);
	//printScreen.render();
	save(printScreen, 'dials_template_' + N+ '.jpg');
	//w.g.image(printScreen,0,0,1);

	printScreen.remove();
	dialHolder.g.remove();
}



////////////////////////
// Helper functions
////////////////////////

//takes in a,b and solves ax+by =1 mod n
function bezout(a, b) {
	let r = [a,b]; //first two iterations
	let s = [1,0];
	let t = [0,1];
	while (r[1]!=0){
		let q = Math.floor(r[0] / r[1]);
		r = [r[1], r[0] - q*r[1]];
		s = [s[1], s[0] - q*s[1]];
		t = [t[1], t[0] - q*t[1]];
	}
	return [s[0],t[0]];
}

function modularInverse(x,m){
	if(gcd(x,m)>1){
		return 0; //zero if gcd not equal to zero
	}
	return  bezout(x,m)[0];
}

function gcd(a, b) {
  while (b) [a, b] = [b, mod(a,b)];
  return a;
}

function mod(a, m) {
  return ((a % m) + m) % m;
}

//returns the factorizations into prime powers
function factorize(n) {
  let factors = [];
  let d = 2;
  while (n > 1) {
    let count = 0;
    while (n % d === 0) {
      n /= d;
      count++;
    }
    if (count > 0){
		factors.push(pow(d,count))
	};
    d++;
  }
  factors.sort((a,b)=>a-b); //sort smallest to largest
  return factors;
}

//returns string of factorizaiton of n
function factorizeString(n) {
  let res = [];
  let d = 2;
  while (n > 1) {
    let count = 0;
    while (n % d === 0) {
      n /= d;
      count++;
    }
    if (count > 0) res.push(count > 1 ? `${d}<sup>${count}</sup>` : `${d}`);
    d++;
  }
  return res.join(" &middot ");
}

function displayFactors(n){
	return  n +" = "+ factorizeString(n);
}


////////////////////////
// user interaction
////////////////////////
function parseN(str) {
	str = str.replace(/\s+/g, "");
	let parts = str.split("*");
	let result = 1;
	for (let part of parts) {
		if (part.includes("^")) {
			let [b, e] = part.split("^").map(Number);
			result *= pow(b, e);
		} else result *= Number(part);
	}
	return result;
}

function mouseWheel(event) {
	let didScroll = false;
	for (let w of windows) {
		didScroll = didScroll || w.scroll(event.delta);
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

function mouseDragged() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}

}

function touchStarted() {
	for (let w of windows) {
		 w.pressed();
	}
	return false; // prevent scrolling
}

function touchEnded() {
	for (let w of windows) {
		 w.released();
	}
	return false; // prevent scrolling
}

function touchMoved() {
	for (let w of windows) {
		w.dragged(mouseX, mouseY, pmouseX, pmouseY);
	}
	return false; // prevent scrolling
}