// 4D Open Simplex Noise Loop
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/137-4d-opensimplex-noise-loop
// https://youtu.be/3_0Ax95jIrk


let loopTime=.1;
let noiseRadius=1;
let noiseScale=10;
let fr=30;
let v;
let opts={
	"scale": 3,
	"radius":.1
}


function setup(){
	canvas = createCanvas(500, 500).canvas;
	noise = new OpenSimplexNoise(Date.now());
	noStroke();
	frameRate(fr);
	opts.obj=noise;
}

  
  function draw() {
	translate(width/2,height/2);
	scale(height/2);
	background(0);
	fill(255);


	//set angle
	angle=frameCount/fr/loopTime;
	//angle=frameCount/2;

	noStroke();

	let inc = 1/30;
	for (let x = -1; x < 1; x+=inc) {
		for (let y = -1; y < 1; y+=inc) {
		//let n = noise.noise4D(noiseScale*x, noiseScale*y, uoff, voff);
		//let n=noiseLoop(noise,x,y,angle,noiseScale,noiseRadius);
		let n = noise2D(x,y,angle,opts);
		//n=n*.5+.5;
		fill(n*255);
		ellipse(x,y,.01,.01)
		}
	}

	opts.randomGradient=true;
	stroke(255);
	strokeWeight(.005);

	inc*=4;
	for (let x = -1; x < 1; x+=inc) {
		for (let y = -1; y < 1; y+=inc) {
			v = noiseVector(x,y,angle,opts).mult(.01).rotate(PI/2).add(createVector(x,y));

			line(x,y,v.x,v.y);
		}
	}
  }
  