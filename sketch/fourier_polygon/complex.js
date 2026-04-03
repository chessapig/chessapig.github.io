// return color from complex number
function colorMap(z){

	[r,theta]=cToPolar(z)
	h = (theta/(2*PI)+0.5 + 0.25)%1;
	//s = (0.7/(1+0.001*r*r));
	//b = r*r/(1+r*r);

	//h=0;
	s=0.5;
	l=r/(3+r);
	
	push();
	colorMode(HSL, 1);
	c = color(h,s,l)
	pop();
	return c
	
}

// implement complex multiplication. Store complex numbers as arrays, to avoid creating so many vectors every time. 
function cMult(z,w){
	return [z[0]*w[0]-z[1]*w[1], z[1]*w[0]+z[0]*w[1]];
}

function cInverse(z){
	normSq=z[0]*z[0]+z[1]*z[1];
	return [z[0]/normSq, -z[1]/normSq];
}

function cAdd(z,w){
	return [z[0]+w[0],z[1]+w[1]];
}

//converts (re,im) to (r,theta)
function cToPolar(z){
	let r = sqrt(z[0]*z[0]+z[1]*z[1]);
	let theta= atan2(z[0],z[1]);
	return [r,theta]
}

//outputs |z|^2
function abs2(z){
	return z[0]*z[0]+z[1]*z[1]
}

//converts (r,theta) to (re, im)
function polarToC(r,theta){
	let x = r*cos(theta);
	let y = r*sin(theta);
	return [x,y]
}

//implement complex integer powers
function cPow(z,n){
	let [r,theta]=cToPolar(z);
	return polarToC(pow(r,n),n*theta)
}