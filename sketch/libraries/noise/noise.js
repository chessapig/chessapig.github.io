//containing some commonly used noise functions

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
	return noise.noise4D(S*x,S*y,R/S*sin(t),R/S*cos(t));
}

//S noisescale, R noise radius
function pNoiseLoop(noise,x,y,t,S,R){ //makes periodic noise, with x,y from -1 to 1
	let n=noise.noise4D(S*x,S*y,R/S*sin(t),R/S*cos(t));
	n= n+ noise.noise4D(S*(-x),S*y,R/S*sin(t),R/S*cos(t)); //periodic in x
	n= n+ noise.noise4D(S*(-x),S*y,R/S*sin(t),R/S*cos(t)); //periodic in y
	n=n/3; //normalize (do i need to multiply by sqrt 3, to keep the stdev the same)
	return n;
}

