
//allow us to input seed points for critical points. These will be the critical points from last frame.
function findCriticalPoints(potentialCritPts=[]){
	let p;
	let critPoints=[];
	
	//first, try to add critical points from potential critical point list.
	for(let pt of potentialCritPts){
		addCritPoint(newton(pt),critPoints)
	}
	
	
	//if we dont give any crit points to start, look with very fine detail
	//otherwise, only do a few
	let numPts;
	if(potentialCritPts.length==0){
			numPts=1000;
	} else {
		numPts=25;
	}

	//apply newtons method for all points in the grid, to try to converge to all possible critical points.
	for(let i=0;i<numPts;i++){
		p=createVector(random(-1,1),random(-1,1));
		p=newton(p);
		addCritPoint(p,critPoints);
	}
	
	// for(let i=-1;i<1;i+=2/sqrt(numPts)){
	// 	for(let j=-1;j<1;j+=2/sqrt(numPts)){
	// 		p=createVector(i,j);
	// 		p=newton(p);
	// 		addCritPoint(p,critPoints);
	// 	}
	// }
	return critPoints;
}



//add a critical point, only if it is not within error to the other critical points
function addCritPoint(p,critPoints){
	if(abs(p.x)>margin || abs(p.y)>margin){
				return "Error: point outside window"; // Ignore any points that left the viewing window
		} 
	
	// ignore any points too close to a zero
	for(let n=0;n<zeros.length;n++){
		if(p.dist(zeros[n].getPoint())<error){
			return "Error: Too close to zero"
		} 
	}
	
	// ignore any points too close to a preexisting critical point
	for(let n=0;n<critPoints.length;n++){
		if(p.dist(critPoints[n])<error){
			return "Error: Already have critical point"
		} 
	}

	//check if the gradient really is zero. Only do this if all other checks passed.
	if(gradRho(p).mag()>error){
		return "gradient not zero: (" + str(p.x) +"," + str(p.y) + ")";
	}
	
	// put in the critical point
	critPoints[critPoints.length]=p;
	return "added critical point"
}


//starts with a point p, and app1ies newton method. 
//repeats until point is within error of a critical point
function newton(p){
	p=p.copy();
	//the max numbr of iterations shouldnt be too large: Sometimes, points can fly off to infinity and get lost. 
	for(let i=0;i<30;i++){
		//console.log([p.x,p.y])
		//point(p.x,p.y);
		let v = gradRho(p); 
		
		if(v.mag()<error){
			break;
		}
		
		let partials = secondPartialRho(p);
		let xx = partials[0];
		let xy = partials[1];
		let yy = partials[2];
		let invdet = 1/(xx*yy-xy*xy) ;
		
		let stepSize= 1;//exp(rho(p))/1; //set step size according to the size of rho. This should account for the derivative blowing up near the poles.
		
		//want to subtract the inverse hessian applied to the gradient 
		p.add([ -1*stepSize*invdet*(yy*v.x - xy*v.y) ,
					  -1*stepSize*invdet*(-xy*v.x + xx* v.y) ]);
	}
	return p;
}

