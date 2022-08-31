

var mobiusTest=function(p){
const parent="mobiusTest"

p.setup = function(){
	var width = document.getElementById(parent).offsetWidth;
	canvas=p.createCanvas(width, width);
	canvas.parent(parent);
  }
  
p.draw=function(){
	p.background(0);
	p.translate(p.width/2,p.height/2);
	p.scale(p.height/2/2); //second /2 means unit circle is half sized


	p.colorMode(p.HSB, 1);
	p.stroke(255);
	p.strokeWeight(.001);
	p.stroke(1);
	p.noFill();
	p.circle(0,0,2) //third argument is DIAMETER, not raidus

	p.fill(255);


	let pts = [];
	let numPts=200;
	for(var j = 0;j<numPts;j++){
		pts[j] = {color: p.color(j/numPts,.5,.7),
				z: new Cx(p,[0,0])}

		pts[j].z.polar = [.9,j/numPts*2*p.PI];
		//console.log(pts[j]);
		//p.stroke(pts[j].color);

		p.fill(pts[j].color);
		p.circle(pts[j].z.x,pts[j].z.y,.03)

	}




	// let z = new Cx(p,[.9,.1]);
	// let rotate= new Cx(p,[0,0]);
	// rotate.polar = [1.2,.12];
	var numIters=20;
	var pt,lastPt;
	for(var i=0;i<numIters;i++){
		for(var j = 0;j<numPts;j++){
			pt=pts[j];
			lastPt={color:pt.color,
					z:pt.z.copy()};
			

			let a = (p.mouseX/p.width-.5);
			
			pt.z.poincareDiscIsometry(1-a,0,1,-a);
			//pt.z.poincareDiscIsometry(1,a,.1,.1);
			//pt.z.mult(pt.z);


			pt.color.setAlpha((i/numIters)*100);
			
			p.fill(pt.color);
			p.circle(pt.z.x,pt.z.y,.03)
			p.stroke(pt.color);
			p.line(pt.z.x,pt.z.y,lastPt.z.x,lastPt.z.y);
		}
		
	}

  }
}


var mandlebrot = function(p){
const parent="mandlebrot"
p.setup = function(){

	
	var width = document.getElementById(parent).offsetWidth;
	canvas=p.createCanvas(500, 500);
	canvas.parent(parent);
	p.pixelDensity(1);
	p.noLoop();
  }
  
p.draw=function(){
	p.background(0);
	

	// Establish a range of values on the complex plane
	// A different range will allow us to "zoom" in or out on the fractal
  
	// It all starts with the width, try higher or lower values
	const w = 4;
	const h = (w * p.height) / p.width;
  
	// Start at negative half the width and height
	const xmin = -w/2;
	const ymin = -h/2;
  
	// Make sure we can write to the pixels[] array.
	// Only need to do this once since we don't do any other drawing.
	p.loadPixels();
  
	// Maximum number of iterations for each point on the complex plane
	const maxiterations = 10;
  
	// x goes from xmin to xmax
	const xmax = xmin + w;
	// y goes from ymin to ymax
	const ymax = ymin + h;
  
	// Calculate amount we increment x,y for each pixel
	const dx = (xmax - xmin) / (p.width);
	const dy = (ymax - ymin) / (p.height);
  
	// Start y
	let y = ymin;
	for (let j = 0; j < p.height; j++) {
	  // Start x
	  let x = xmin;
	  for (let i = 0; i < p.width; i++) {
  

		// Now we test, as we iterate z = z^2 + cm does z tend towards infinity?

		let z = new Cx(p,[x,y]);
		let z0=z.copy();

		let bright=0;
		if(z.r>.99 && z.r<1.01)
			{bright=255;} //make unit circle

		//let c = new Cx(p,[x,y]);
		let n=0;
		while (n < maxiterations) {
			
		//console.log(z.mult(z));
		//z.mult(z);
		//z.mult(z).poincareDiscIsometry(1,.17,0,1);
		  if (z0.r > 0.99) {
			break;  // Bail
		  }
		  n++;
		}
		//console.log(n);
  
		// We color each pixel based on how long it takes to get to infinity
		// If we never got there, let's pick the color black
		
		
		const pix = (i+j*p.width)*4;
		//const norm = p.map(n, 0, maxiterations, 0, 1);
		//bright += p.map(p.sqrt(norm), 0, 1, 0, 255);
		//bright += n/maxiterations*255;
		bright += z0.r*255;
		if (n == maxiterations) {
		  //bright = 255;
		} else {
		  // Gosh, we could make fancy colors here if we wanted
		  p.pixels[pix + 0] = bright*(p.cos(z.t)+1)/2;
		  p.pixels[pix + 1] = bright*(p.sin(z.t)+1)/2;
		  p.pixels[pix + 2] = 0;
		  p.pixels[pix + 3] = 255;
		}
		x += dx;
	  }
	  y += dy;
	}
	p.updatePixels();
  }
  

p.windowResized = function(){
	p.resizeCanvas(document.getElementById(parent).offsetWidth, document.getElementById(parent).offsetHeight)
   }
}

//  var mandlebrot = new p5(mandlebrot);

var mobiusTest = new p5(mobiusTest);
