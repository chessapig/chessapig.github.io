// 4D Open Simplex Noise Loop
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/137-4d-opensimplex-noise-loop
// https://youtu.be/3_0Ax95jIrk


let loopTime=3;
let noiseRadius=1;
let noiseScale=3;
let fr=30;

function setup(){
	canvas = createCanvas(windowWidth, windowHeight).canvas;
	noise = new OpenSimplexNoise(Date.now());
	noStroke();
	frameRate(fr);
}

  
  function draw() {
	translate(width/2,height/2);
	scale(height/2);
	background(0);
	fill(255);


  //set angle
  angle=frameCount/fr/loopTime*2*PI;
  let uoff = noiseRadius*sin(angle);
  let voff = noiseRadius*cos(angle);

  let inc = 1/30;
  for (let x = -1; x < 1; x+=inc) {
    for (let y = -1; y < 1; y+=inc) {
      //let n = noise.noise4D(noiseScale*x, noiseScale*y, uoff, voff);
	  let n=noiseLoop(noise,x,y,angle,noiseScale,noiseRadius);
	  //n=n*.5+.5;
      fill(n*255);
      ellipse(x,y,.01,.01)
    }
  }
  }
  