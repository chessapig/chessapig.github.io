//containing some commonly used noise functions

//default options file

let defaultNoiseOptions=
{
	"obj": null,
	"periodic": false,
	"randomVector": true,
	"randomGradient": false,
	"loop": false,
	"radius": 1,
	"scale": 1,
	"center":0
}


function noiseVector(x,y,t,opt){
	if(opt.randomVector){
		return createVector(noise2D(x,y,t,opt),noise2D(x+10,y,t,opt));
	} else if (opt.randomGradient){
		let d=.01; //delta
		let dx= -(noise2D(x+d,y,t,opt) -  noise2D(x-d,y,t,opt))/d; //central difference formula
		let dy= -(noise2D(x,y+d,t,opt) -  noise2D(x,y-d,t,opt))/d;
		return createVector(dx,dy).mult(1/opt.scale); //multiply by the scale, because the expected derivative increases as spatial scale decreases
	} else {
		return createVector(0,0); 
		console.log("oopsie");
		
	}
}




function noise2D(x,y,t,opt){
	noise=opt.obj;
	let S=opt.scale;
	let R=opt.radius;
	if(opt.periodic){
		if(opt.loop){
			return pNoiseLoop(noise,x+opt.center,y,t,S,R);
		} else {
			return pNoiseMove(noise,x+opt.center,y,t,S,R)
		}
	} else {
		if(opt.loop){
			return noiseLoop(noise,x+opt.center,y,t,S,R);
		} else {
			return noiseMove(noise,x+opt.center,y,t,S,R);
		}
	}
}

function pNoise2D(noise,x,y,noiseScale){ //makes periodic noise, with x,y from -1 to 1
	return (noise.noise2D(noiseScale*x,noiseScale*y)+noise.noise2D(noiseScale*(-x),noiseScale*(-y)))/2;
}

function noiseMove(noise,x,y,t,S,R){ //makes periodic noise, with x,y from -1 to 1
	return noise.noise3D(S*x,S*y,R/S*t);
}

function pNoiseMove(noise,x,y,t,S){ //makes periodic noise, with x,y from -1 to 1
	let n=noise.noise3D(S*x,S*y,t);
	n= n+ noise.noise3D(S*(-x),S*y,t); //periodic in x
	n= n+ noise.noise3D(S*(-x),S*y,t); //periodic in y
	n=n/3; //normalize (do i need to multiply by sqrt 3, to keep the stdev the same)
	return n;
}

function noiseLoop(noise,x,y,t,S,R){ //makes periodic noise, with x,y from -1 to 1
	
	return noise.noise4D(S*x,S*y,R/S*sin(t*2*PI),R/S*cos(t*2*PI));
}

//S noisescale, R noise radius
function pNoiseLoop(noise,x,y,t,S,R){ //makes periodic noise, with x,y from -1 to 1
	let n=noise.noise4D(S*x,S*y,R/S*sin(t*2*PI),R/S*cos(t*2*PI));
	n= n+ noise.noise4D(S*(-x),S*y,R/S*sin(t*2*PI),R/S*cos(t*2*PI)); //periodic in x
	n= n+ noise.noise4D(S*(-x),S*y,R/S*sin(t*2*PI),R/S*cos(t*2*PI)); //periodic in y
	n=n/3; //normalize (do i need to multiply by sqrt 3, to keep the stdev the same)
	return n;
}

