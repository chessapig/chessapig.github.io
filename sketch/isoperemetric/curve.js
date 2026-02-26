//class holding the functions common to all curves.
class Curve{
	constructor(res=100){
		this.res=res;
		this.doCurveVertex=true;

		push();
	
		this.color = color( map(random(),0,1,30,40), 
							map(random(),0,1,60,100), 
							map(random(),0,1,70,80));
	}

	//update computed area and length
	computeParameters(){
		this.computeArea();
		this.computeLength();
	}
	
	draw(){
		fill(this.color);
		beginShape();
		let startVertexList=[];
		let t,pt;
		for(let i = 0;i<this.res;i++){
			t=i/this.res;
			pt=this.getPoint(t);
			if(this.doCurveVertex){
				curveVertex(pt.x,pt.y);
			} else {
				vertex(pt.x,pt.y);
			}
			
			//circle(pt.x,pt.y,0.02)
	
			//record first few
			if(i<=2){
				startVertexList[i]=pt;
			}
		}
	
		//run over the first few vectors agian so we have enough points for curveVertex to make bezier curves.
		for(let v of startVertexList){
			if(this.doCurveVertex){
				curveVertex(v.x,v.y);
			} else {
				vertex(v.x,v.y);
			}
			
		}
		endShape();

		circle(0,0,0.01)
	}
	
	computeArea(){
		let area=0;
		let lastPt=this.getPoint(1);
		let pt,det,t;
		for(let i = 0;i<this.res;i++){
			t=i/this.res;
			pt=this.getPoint(t);
			det= -pt.x*lastPt.y + pt.y*lastPt.x;
			area+= det/2;
			
			lastPt=pt;
		}
		
		this.area=area
		return area;
	}


	computeLength(){
		let len=0;
		let lastPt=this.getPoint(1);
		let pt,t;
		for(let i = 0;i<this.res;i++){
			t=i/this.res;
			pt=this.getPoint(t);
			len+=abs(pt.dist(lastPt));
			lastPt=pt;
		}
		this.length=len
		return len;
	}

	//plug in t in [0,1]
	//this one only gives circles. subclasses will have different functions
	getPoint(t){
		return createVector(0.5*cos(t*2*PI),0.5*sin(t*2*PI));
	}
}

class FourierCurve extends Curve{
	constructor(res){
		super(res)
		this.falloff=1; //exponential falloff with n
		this.generateCoefs();
		this.update();
	
	}

	generateCoefs(){
		this.fourierPos=[];
		this.fourierNeg=[];
		let r=0;
		let theta=0;
		for(let n=1;n<=this.res;n++){
			this.fourierPos[n-1]=this.randomCoef(n,sketchSeed);
			//this.fourierNeg[n-1]=createVector(0,0);
			this.fourierNeg[n-1]=this.randomCoef(-n,10+sketchSeed);
		}
	}

	randomCoef(n,seed){
		let amplitude=0.6 
		
		//use box-muller transform to get gaussian distrabution
		let gauss=sqrt(-2*log(random())) *cos(2*PI*random());
		let r = gauss*amplitude
		let theta=random()*2*PI;
		return createVector(r*cos(theta),r*sin(theta))
	}

	//plug in t in [0,1]
	getPoint(t){
		let pt = createVector(0,0);
		let p;

		let multiplier=3*sqrt(this.falloff);
		for(let n=1;n<=this.fourierPos.length; n++){
			p=this.fourierPos[n-1].copy();
			p.mult(multiplier*exp(-this.falloff*(n*n)));
			p.rotate(2*PI*t*(n));
			pt.add(p);
			
		}
		
		for(let n=1;n<=this.fourierNeg.length; n++){
			p=this.fourierNeg[n-1].copy();
			p.mult(multiplier*exp(-this.falloff*n*n));
			p.rotate(-2*PI*t*(n));
			pt.add(p);
		}
		
		return pt;
	}
}

//to make a star shaped curve, have the fourier series be real valued, and use them as the radial part of a polar function 
class FlowerCurve extends Curve{
	constructor(res){
		super(res)
		this.radius=random();
		this.roughness=random();
		this.rotation=random();
		this.leafSize=random();
		this.leafVar=random();
		this.leafOblong = random();
		this.numLeafs = floor(random()*5+2); //between 2 and 7 leafs
		this.leafOffset=random();
		this.circularity=atan((random()-0.5)*10)/PI+0.5; // 0 is more circular, 1 is less
	}

	//input between 0 and 1, output pprmertized curve
	getPoint(t){
		let angle = 2*PI*t;
		
		let leafEnvelope=map(noise(pow(this.roughness,0.5)*cos(this.numLeafs*angle)+3,this.roughness*sin(this.numLeafs*angle)),0,1,1-this.leafVar,1+this.leafVar)
		let radialError=sin(angle*this.numLeafs+this.leafOffset*2*PI)
		let angleOffset = this.leafOffset*this.numLeafs*2*PI;
		let angularDistortion = lerp(this.leafOblong * 4, 1, pow(cos(angleOffset/2),2)) ;
		let angularError = this.circularity*angularDistortion / (this.numLeafs*2)*
						    sin(angle*this.numLeafs*2) 
		//ammount of angular distortion allowed depends on the offset. 
		let theta=angle + angularError
		let r  = this.radius*(1 + this.circularity*0.6*radialError)*leafEnvelope;
		return createVector(r*cos(theta),r*sin(theta));

		//let basePt = createVector(this.radius*cos(theta),this.radius*sin(theta));
		//let normal = basePt.copy();
		
		
		// let leafEnvelope=map(noise(pow(this.roughness,0.5)*cos(this.numLeafs*theta)+3,this.roughness*sin(this.numLeafs*theta)),0,1,1-this.leafVar,1+this.leafVar)
		// let leaf = map(cos((theta+2*PI*this.rotation)*this.numLeafs) 
		// 				, -1,1,this.leafSize*-1,this.leafSize*3 ); 
		// let leafPoint = normal.mult(leaf*leafEnvelope)

		// let leafGradient=sin((theta+2*PI*this.rotation)*this.numLeafs);
		// let outPush = createVector(-this.radius*sin(theta),this.radius*cos(theta))
		// 				.mult(	pow(abs(leafGradient),0.2)*leafGradient/abs(leafGradient)
		// 						*this.leafOblong);
		
		//return basePt.add(leafPoint).add(outPush);
	}
}

class isoperemetricCollection {
	constructor(numCurves=10){

		//number of curves in collection
		this.numCurves = numCurves;
		

		//defines bounding box of the portion of interest
		
		this.perStart = 0;
		this.areaStart = 0;
		this.perRange=3; 
		this.areaRange=0.5;

		this.overlapRatio=0.7; //controls how much the flowers overlap. smaller number = less overlap 


		this.res=100; //sets resolution of each curve
		this.curveScale=0.3;
		this.curves=[];

		this.numTriesAddCurve=50;
		for(let i=0;i<numCurves;i++){
			this.addCurve();
		}
	}

	update(){
		//delete curves outside of bound
		let newCurves = [];
		for(let i = 0 ; i<this.curves.length; i++){
			c = this.curves[i];
			if(this.isCurveInBound(c)){
				newCurves.push(c);
			}
		}
		this.curves= newCurves;


		//add in missing curves
		let curveDeficit = this.numCurves - this.curves.length
		for(let i = 0; i<curveDeficit; i++){
			this.addCurve();
		}
		
	}


	addCurve(){
		let c;
		for(let i = 0 ; i<this.numTriesAddCurve; i++){
			c = new FlowerCurve(this.res);
			c.computeParameters();
			if (this.isCurveInBound(c)) {
				//only accept non-overlapping curves
				if(!this.collectionIntersect(c)){
					
					this.curves.push(c);
					break;
				}
			}
		}
	}

	collectionIntersect(c1){
		for(let c2 of this.curves){
			if(this.curvesIntersect(c1,c2)){
				return true;
			}
		} 
		return false;
	}

	//checks wether two flower curves intersect according to the bounding box.
	curvesIntersect(c1,c2){
		let screenDistX = (c1.length - c2.length)/this.perRange;
		let screenDistY = (c1.area - c2.area)/this.areaRange;
		let screenDist = sqrt(screenDistX*screenDistX+screenDistY*screenDistY);
		if( (c1.radius + c2.radius) > this.overlapRatio*screenDist/this.curveScale){
			return true;
		}
		return false;
	}

	//return boolean, if the center of c is within the bound
	isCurveInBound(c){
		return  this.perStart < c.length && 
				this.perStart +  this.perRange > c.length && 
				this.areaStart < c.area &&
				this.areaStart+this.areaRange > c.area;
	}

	//transforms to a coordinate system for a curve c.
	//assume the viewport is [0,1] times [0,1]
	transformCoords(c){
		translate(-this.perStart,-this.areaStart);
		translate(c.length/this.perRange,c.area/this.areaRange);
		scale(this.curveScale); //size of curve on world
	}

	drawCollection(){
		
		for(let c of this.curves){
			push();
			strokeWeight( sqrt((c.area-this.areaStart)/this.areaRange)  *0.02);
			this.transformCoords(c);
			c.draw();
			pop();
		}
	}

	drawBackground(){
		noStroke();
		let beachColor = color('#f9e77eff');
		let inslandColor = color('#8d6831ff');
		let surfColor = color('#e4e5e6ff');
		let deepWaterColor = color('#2848b1ff')
		push();
		translate(-this.perStart,-this.areaStart);
		scale(1/this.perRange,1/this.areaRange);
		let slope = 1/(4*PI);
		let numDivisions=10;
		for(let r=1;r>0;r-=1/numDivisions){
			fill(lerpColor(surfColor,deepWaterColor,r));
			this.drawParabola(slope,r/8); //idk what this r/8 is supposed to be...
		}

		for(let r=0;r<1;r+=1/numDivisions){
			fill(lerpColor(inslandColor,beachColor,r));
			this.drawParabola(slope,-r/8);
		}
		
		pop();

	}

	//draws standard parabola in the [0,1] range
	drawParabola(slope=1, yIntercept=0){
		let resolution = 20;
		beginShape();
		for(let x = this.perStart; x <= this.perStart+ this.perRange+0.001; x+= 1/resolution){
			vertex(x,slope*x*x+yIntercept);
		}
		vertex(this.perStart+ this.perRange,this.areaStart);
		vertex(this.perStart,this.areaStart);
		endShape();

		// fill(0);
		// circle(this.perStart*this.perRange,this.areaStart*this.areaRange,0.1)
		
	}
}

