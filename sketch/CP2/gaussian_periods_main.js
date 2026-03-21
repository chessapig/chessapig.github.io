const BKG = '#E6CFB3'; //background color
const FRG = '#2c2621'; //foreground color


//Parent in file is "ifs_sketch"
let parent = "CP2_sketch";


let fourierRender;
let gaussianUI;
let windows = [];
let canvasSize;

const defaultUIState = {

};

const uiState = defaultUIState;


function setup() {
	let elem = document.getElementById(parent);
	boundingRect = elem.getBoundingClientRect();
	canvasSize = min(boundingRect.width*0.9,windowHeight*0.6); //sets size of canvas.
	canvas = createCanvas(canvasSize , canvasSize , WEBGL);
	canvas.parent(parent);
	

	gaussianUI = new GaussianPeriodUI({
		pixels: canvasSize,
		x: -1, y: -1, width: 2
	});

	gaussianUI.loadPreset({
		n: 52059,
		omega: 766,
		c: 2,
	})

	gaussianRender = new GaussianPeriodRenderer({
		ui: gaussianUI,
		maxPerFrame: 1000,
		pixels: canvasSize,
		x: -1, y: -1, width: 2
	});

	

	windows = [gaussianUI,gaussianRender];
}

function draw() {
	scale(height / 2, -height / 2, height / 2) //recale to a box [-1,1]times [-1,1]
	background(BKG);

	for (let w of windows) {
		w.update();
		w.render();
		w.draw();
	}

}

//class which holds values of n, omega, and c. 
//interfaces with sliders
class GaussianPeriodUI extends GraphicsWindow {
	constructor(options) {
		super(options)
		// DOM
		this.sliderN = select("#sliderN");
		this.inputN = select("#inputN");
		this.factorizationEl = select("#factorization");

		this.sliderOmega = select("#sliderOmega");
		this.inputOmega = select("#inputOmega");

		this.sliderC = select("#sliderC");
		this.inputC = select("#inputC");
		this.cContainer = select("#cContainer");

		this.colorMode = select("#colorMode");

		// state
		this.n = int(this.sliderN.value());
		this.omega = 1;
		this.c = 1;

		this.divisors = [];
		this.subgroupReps = [];

		this.didUpdate = true;

		this.setupEvents();
		this.recompute();
	}

	setupEvents() {
		this.sliderN.input(() => {
			this.n = int(this.sliderN.value());
			this.inputN.value(this.n);
			this.didUpdate = true;
			this.recompute();
		});

		this.inputN.changed(() => {
			this.n = int(this.inputN.value());
			this.sliderN.value(this.n);
			this.didUpdate = true;
			this.recompute();
		});

		this.sliderOmega.input(() => {
			this.omega = this.subgroupReps[int(this.sliderOmega.value())];
			this.inputOmega.value(this.omega);
			this.didUpdate = true;
		});

		this.inputOmega.changed(() => {
			let val = int(this.inputOmega.value());
			let idx = this.subgroupReps.indexOf(val);
			if (idx !== -1) {
				this.sliderOmega.value(idx);
				this.omega = val;
				this.didUpdate = true;
			}
		});

		this.sliderC.input(() => {
			this.c = this.divisors[int(this.sliderC.value())];
			this.inputC.value(this.c);
			this.didUpdate = true;
		});

		this.inputC.changed(() => {
			let val = int(this.inputC.value());
			let idx = this.divisors.indexOf(val);
			if (idx !== -1) {
				this.sliderC.value(idx);
				this.c = val;
				this.didUpdate = true;
			}
		});

		this.colorMode.changed(() => {
			this.cContainer.style("display", this.colorMode.checked() ? "block" : "none");
			if(!this.colorMode.checked()){
				this.c=1; 
			} 
			this.didUpdate = true;
		});
	}

	recompute() {
		this.divisors = getDivisors(this.n);
		this.subgroupReps = getDistinctSubgroupReps(this.n);

		// update c slider
		this.sliderC.attribute("max", this.divisors.length - 1);
		this.sliderC.value(0);
		this.c = this.divisors[0];
		this.inputC.value(this.c);

		// update omega slider
		let numSubgroupReps=this.subgroupReps.length - 1;
		this.sliderOmega.attribute("max", numSubgroupReps);
		this.sliderOmega.value(numSubgroupReps-2);
		this.omega = this.subgroupReps[numSubgroupReps-2];
		this.inputOmega.value(this.omega);
	}

	update() {
		// label for n
		let container = document.getElementById("nFactorization");
		container.innerHTML = `${displayFactors(this.n)}`;
		
		// label for c
		container = document.getElementById("cFactorization");
		container.innerHTML = `${displayFactors(this.c)}`;

		// label for omega
		container = document.getElementById("omegaLabel");
		container.innerHTML = this.omega + ",   |&lt;ω&gt;| = " + getOrbit(this.omega, this.n).length;  ;
		return this.didUpdate;
	}

	loadPreset(preset) {
		let n = preset.n;
		let omega = preset.omega;
		let c = preset.c;

		// 1️⃣ Set n and recompute divisors/subgroups
		this.n = n;
		this.sliderN.value(n);
		this.inputN.value(n);
		this.recompute();

		// 2️⃣ Set c
		if (this.divisors.includes(c)) {
			const cIdx = this.divisors.indexOf(c);
			this.sliderC.value(cIdx);
			this.c = this.divisors[cIdx];
			this.inputC.value(this.c);
		} else {
			// fallback to first divisor
			this.sliderC.value(0);
			this.c = this.divisors[0];
			this.inputC.value(this.c);
		}

		// 3️⃣ Set omega
		if (this.subgroupReps.includes(omega)) {
			const omegaIdx = this.subgroupReps.indexOf(omega);
			this.sliderOmega.value(omegaIdx);
			this.omega = this.subgroupReps[omegaIdx];
			this.inputOmega.value(this.omega);
		} else {
			// fallback to last meaningful subgroupRep
			const idx = Math.max(this.subgroupReps.length - 2, 0);
			this.sliderOmega.value(idx);
			this.omega = this.subgroupReps[idx];
			this.inputOmega.value(this.omega);
		}

		this.didUpdate = true;
	}

}


//computes the numbers mod n
class GaussianPeriodScheduler extends PointScheduler {
	constructor(options) {
		const defaults = {
			n: 60, 
			omega: 1,
			c:3,
			maxPerFrame: 10,
			currentValue: 1
		};
		options = Object.assign({}, defaults, options);
		super(options);
		this.setValues(options);
	}

	setValues(options = {n: 60, omega: 1, c:3}){
		this.n = options.n;
		this.omega = options.omega;
		this.c = options.c;

		this.units = getUnits(this.n);
		this.orbit = getOrbit(this.omega, this.n);

		this.maxTotal= options.n;
		this.nextValueOffset = this.units[floor(this.units.length / 2)]
	}

	//get the next points by repeatedly adding a coprime number to 0.
	generate(newPoints, options) {
		let points = [];
		for (let i = 0; i < newPoints; i++) {
			let nextPoint = this.orbitFourierTransform(this.currentValue);
			nextPoint.style = { ...options.style };
			if (this.c != 1) {
				nextPoint.style.color = this.getColor(this.currentValue);
			}
			points.push(nextPoint);
			this.currentValue += this.nextValueOffset;
			this.currentValue = this.currentValue % this.n;
		}
		return points;
	}

	update(){ 
		if(this.ui){
			this.setValues(this.ui);
		}	
		return this.ui.update();
	}

	reset(){
		super.reset();
		this.ui.didUpdate=false;
	}

	//gives color to image of value mod n
	getColor(value) {
		return oklch(0.4, 0.3, (value % this.c) / this.c * 360, 0.5);
	}

	//returns the fourier transform of the orbit evaluated at y;
	orbitFourierTransform(y) {
		let z = Complex.zero();
		for (let x of this.orbit) {
			z.add(Complex.polar(1, TWO_PI * x * y / this.n))
		}
		return z;
	}
}

class GaussianPeriodProjection extends Projection {
	renderDecor(r) { //draw axes
		this.drawAxes(r);
	}

	drawAxes(r) {
		let ctx = r.g;
		ctx.push();
		ctx.stroke(r.FRG);
		ctx.strokeWeight(1);
		ctx.line(-100, 0, 100, 0);
		ctx.line(0, -100, 0, 100);
		ctx.pop();
	}
}

class GaussianPeriodRenderer extends PointRenderer {
	constructor(options) {
		const defaults = {
			projection: new GaussianPeriodProjection(),
			BKG: BKG,
			FRG: FRG
		};
		options = Object.assign({}, defaults, options);
		super(options);
		this.scheduler = new GaussianPeriodScheduler(options);

		this.fineStyle = {
			size: min(1000 / sqrt(this.scheduler.n), 10),
			color: color(this.FRG)
		}
		this.coarseStyle = { size: max(3, this.fineStyle.size), color: color(this.FRG) }
		this.camera.zoom = log(0.25);
	}

	update(){
		super.update();
		this.fineStyle = {
			size: min(500 / sqrt(this.scheduler.n), 3),
			color: color(this.FRG)
		}
		this.coarseStyle = { size: max(3, this.fineStyle.size), color: color(this.FRG) }
	}
	

	
}

/////////////////////////
// CYCLIC SUBGROUP
/////////////////////////
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function getUnits(n) {
	let u = [];
	for (let i = 1; i < n; i++) {
		if (gcd(i, n) === 1) u.push(i);
	}
	return u;
}

function getDivisors(n) {
  let d = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) d.push(i);
  }
  return d;
}

function getOrbit(omega, n) {
	let seen = new Set();
	let x = 1;
	while (!seen.has(x)) {
		seen.add(x);
		x = (x * omega) % n;
	}
	return Array.from(seen).sort((a, b) => a - b); //sorts by size
}

function getDistinctSubgroupReps(n) {
	let units = getUnits(n);
	let seenSubgroups = new Set();
	let reps = [];
	for (let x of units) {
		let orbit = getOrbit(x, n);
		let key = orbit.join(",");
		if (!seenSubgroups.has(key)) {
			seenSubgroups.add(key);
			reps.push(x);
		}
	}
	return reps;
}

function factorize(n) {
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
	return  n +" = "+ factorize(n);
}



/////////////////////////
// UI HELPER
/////////////////////////

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

/////////////////////////
// MOUSE INTERACTION
/////////////////////////


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




// Convert OKLCH to p5 color
//l in [0,1]
// c in [0,0.3]
// h in [0,360]
function oklch(l, c, h, alpha = 1) {
	// h in degrees → radians
	let hr = radians(h);

	// OKLCH → OKLab
	let a = c * cos(hr);
	let b = c * sin(hr);

	// OKLab → LMS
	let L_ = l + 0.3963377774 * a + 0.2158037573 * b;
	let M_ = l - 0.1055613458 * a - 0.0638541728 * b;
	let S_ = l - 0.0894841775 * a - 1.2914855480 * b;

	// cube
	let L3 = L_ * L_ * L_;
	let M3 = M_ * M_ * M_;
	let S3 = S_ * S_ * S_;

	// LMS → linear sRGB
	let r = +4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3;
	let g = -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3;
	let b_ = -0.0041960863 * L3 - 0.7034186147 * M3 + 1.7076147010 * S3;

	// linear → gamma-corrected sRGB
	r = linearToSRGB(r);
	g = linearToSRGB(g);
	b_ = linearToSRGB(b_);

	// clamp to [0,1]
	r = constrain(r, 0, 1);
	g = constrain(g, 0, 1);
	b_ = constrain(b_, 0, 1);

	// return p5 color (0–255)
	return color(r * 255, g * 255, b_ * 255, alpha * 255);
}

function linearToSRGB(x) {
	return x <= 0.0031308
		? 12.92 * x
		: 1.055 * pow(x, 1 / 2.4) - 0.055;
}