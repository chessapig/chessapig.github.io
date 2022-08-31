

// class String{
//     const BKG = '#2c2621';  
//     const HLGHT="#e6cfb3";

//     function String(p){
//         this.p=p;
//     }
    

    

// var	doPoints=false;
// var	randScaleBorder=3;
// var randScaleDiffeo=3;
// var	offsetScale=0;
// var	multiplier=2;
// var	phase=0;
// var	mBorder=1;
// var	phaseVelocity=0;
// var	doBorder=true,
// 	doHyperbolic=true,
// 	doRandomize=true,
// 	doAccumulate=false;
// 	doAddLines=false;
// var	diffeoParam=0.5;
// var	ani=0.3;
// var	aniVelocity=0;
// var maxLines=3000;
// var	NLines=1000;
// var NPoints=1000;
// var NIters=1;

// const radius=250; //radius of starting circle

// var [mobiusA,mobiusB,mobiusC,mobiusD] = [0.1,0,0,0.1],
// 	doTanScaleMobius=true;
	

// var borderName="Epicycloid";
// 	//diffeoName="mobius+square";
 

// function setupCanvas(p,parent){
// 	var width = document.getElementById(parent).offsetWidth;
// 	canvas=p.createCanvas(width, width);
// 	canvas.parent(parent);
// 	makeListeners(p,canvas,parent);

// 	p.colorMode(p.HSB, 100);
// }

// function makeListeners(p,canvas,par){
//     document.getElementById(par).addEventListener("mousedown", e=> Controls.move(controls).mousePressed(e));
// 	canvas.mouseWheel(e => Controls.zoom(controls,p).worldZoom(e)); //Controls from libraries/zoom
// 	canvas.mouseMoved(e => Controls.move(controls).mouseMoved(e));
// 	canvas.mouseReleased(e => Controls.move(controls).mouseReleased(e));
// 	canvas.doubleClicked(e => toggleFocus(p));
// 	controls.enabled=true;
//     p.noLoop();
// }

// function toggleFocus(p){
// 	controls.focused=!controls.focused;
// 	if(controls.focused){
// 		p.loop()
// 		disableScroll();
// 	} else {
// 		p.noLoop();
// 		enableScroll();
// 	}
// }

// //setup the strokeweight and the blend mode and background and stuff
// function setupDraw(p){


//     p.blendMode(p.BLEND);
// 	p.background(BKG);
// 	p.blendMode(p.ADD);

	
// 	p.translate(controls.view.x, controls.view.y);
// 	p.scale(controls.view.zoom);
// 	p.translate(p.width/2,p.height/2);
	
// 	p.strokeWeight(100/(NLines)/20);
// 	p.strokeWeight(100/(NLines));		

	
	
//   }


// function drawBorder(p){
// 	p.push();
// 	p.strokeWeight(2);
//     p.blendMode(p.BLEND);


//     var lastPt=border(p,0)
//     var pt=border(p,0);

//     var lastPt=border(p,1); //the 1 ensures you get the full circle
//     var pt=border(p,1);
// 	//rainbow border
// 	for(i=0;i<N;i++){
//         lastPt=pt;
//         pt=border(p,i/N);
        
// 		p.stroke(colorMap(p,i/N));
// 		p.line(lastPt.x,lastPt.y,pt.x,pt.y)
// 	}
// 	p.pop();
// }


//   //take in 2 points on the boundary of a circle, and the center of the circle, and 
// //draw the hyperbolic geodesic in the poincare model
// //(assume circle centered at 0,0)
// function drawStringHyperbolic(p,v1,v2){
// 	//calculate the coordinates
// 	let theta = p.abs(v1.angleBetween(v2)/2);
// 	let r0=p.sqrt(v1.mag()*v2.mag()); //our guess for radius of the circle
// 	let r1 =  r0*p.tan(theta); //radius of new circle
// 	let c = v1.copy().add(v2).normalize().mult(p.sqrt(r0**2+r1**2));//center of new circle

// 	//draw it now
// 	p.push();
// 	p.noFill();
// 	//if(r1>10000){line(v1.x,v1.y,v2.x,v2.y);}
// 	p.circle(c.x,c.y,r1*2); //DIAMETER, not radius
// 	p.pop();
// }




// function colorMap(p,x){
// 	return p.color(x*100,70,90);
//   }

//     //parametrically define a path, based off parameter x in [0,1]
// function border(p,x){

// 	let offset=p.createVector(0,0),
// 		thisRad=radius;
// 	switch(borderName){
// 		case "Epicycloid":
// 			offset=p.createVector(p.cos(2*p.PI*x*(mBorder+1)),p.sin(2*p.PI*x*(mBorder+1)));
// 			offset.y-=1/(mBorder+1); //recorrect to keep it centered
// 			thisRad-=offsetScale;
// 			break;
// 		case "Random":
// 			offset=p.createVector(p.noise(randScaleBorder*x)+p.noise(randScaleBorder*(1-x))-1,p.noise(randScaleBorder*x+5)+p.noise(randScaleBorder*(1-x)+5)-1);
// 			break;
// 		case "Ellipse":
// 			offset=p.createVector(cos(2*PI*x),0);
// 			break;
// 	}

//     offset.mult(offsetScale);

//     let circle=p.createVector(p.cos(2*p.PI*(x)),p.sin(2*p.PI*(x))).mult(radius);
//     return circle.add(offset);
// }

// function diffeo(p,x,diffeoName){
//     switch(diffeoName){
//         case "multiply":
//             return (x*multiplier+phase)%1;
//         case "noise":
//             return (phase+x+periodicNoise(x,randScaleDiffeo/5,10)*3*diffeoParam)%1;
//             //return noise(rDensity*(x+phase)+10)+noise(rDensity*(1-(x+phase))+10)-1;
//         case "logistic":
//             return ((3+diffeoParam)*x*(1-x))%1;
//         case "cosine":
//             return (p.cos((x+phase*2)*p.PI*multiplier)+1)/2;
//         case "mobius": //construct a real mobius transform
//             return mobius(p,x,mobiusA,mobiusB,mobiusC,mobiusD);
//         case "Arnold Tounges":
//             return (x+phase+diffeoParam*p.sin(x*2*p.PI*multiplier));
//         case "zero":
//             return diffeoParam;
//         case "mobius+square":
//             for(let j=0;j<multiplier;j++){
//                 x=fract(2*(x+phase));
//                 x=mobius(p,x,mobiusA,mobiusB,mobiusC,mobiusD);
                
//             }
//             return x;
//         default:
//             return 1*x;
//     }

// }

// function mobius(p,x,a,b,c,d){
// 	let vec=p.createVector(p.cos(x*p.PI),p.sin(x*p.PI));  //ONLY PI around, as to not double count RP1
// 	T=[[a,b],[c,d]];
// 	vec=p.createVector(T[0][0]*vec.x+T[1][0]*vec.y,T[0][1]*vec.x+T[1][1]*vec.y); //matrix multiply, since i cant do that in p5js for some reason
	
// 	return fract(p.atan2(vec.y,vec.x)/p.PI) ;  //renormalize to 0,1
// 	//to compinsate for the the dividing by two in the first angle, we need to multiply x by 2 here. Hence, it only really goes from 0,.5
// }
// }





const BKG = '#2c2621';
const HLGHT="#e6cfb3";

var N=1000;
var	NBorder=500;
var	doPoints=false;
var	randScaleBorder=3;
var randScaleDiffeo=3;
var	offsetScale=0;
var	multiplier=2;
var	phase=0;
var	mBorder=1;
var	phaseVelocity=0;
var	doBorder=true,
	doHyperbolic=true,
	doRandomize=true,
	doAccumulate=false;
	doAddLines=false;
var	diffeoParam=0.5;
var	ani=0.3;
var	aniVelocity=0;
var maxLines=3000;
var	NLines=1000;
var NPoints=1000;
var NIters=1;

const radius=250; //radius of starting circle

var [mobiusA,mobiusB,mobiusC,mobiusD] = [0.1,0,0,0.1],
	doTanScaleMobius=true;
	

var borderName="Epicycloid";
	//diffeoName="mobius+square";
 

function setupCanvas(p,parent){
	var width = document.getElementById(parent).offsetWidth;
	canvas=p.createCanvas(width, width);
	canvas.parent(parent);
	makeListeners(p,canvas,parent);

	p.colorMode(p.HSB, 100);
}

function makeListeners(p,canvas,par){
    document.getElementById(par).addEventListener("mousedown", e=> Controls.move(controls).mousePressed(e));
	canvas.mouseWheel(e => Controls.zoom(controls,p).worldZoom(e)); //Controls from libraries/zoom
	canvas.mouseMoved(e => Controls.move(controls).mouseMoved(e));
	canvas.mouseReleased(e => Controls.move(controls).mouseReleased(e));
	canvas.doubleClicked(e => toggleFocus(p));
	controls.enabled=true;
    p.noLoop();
}

function toggleFocus(p){
	controls.focused=!controls.focused;
	if(controls.focused){
		p.loop()
		disableScroll();
	} else {
		p.noLoop();
		enableScroll();
	}
}

//setup the strokeweight and the blend mode and background and stuff
function setupDraw(p){


    p.blendMode(p.BLEND);
	p.background(BKG);
	p.blendMode(p.ADD);

	
	p.translate(controls.view.x, controls.view.y);
	p.scale(controls.view.zoom);
	p.translate(p.width/2,p.height/2);
	
	p.strokeWeight(100/(NLines)/20);
	p.strokeWeight(100/(NLines));		

	
	
  }


function drawBorder(p){
	p.push();
	p.strokeWeight(2);
    p.blendMode(p.BLEND);


    var lastPt=border(p,0)
    var pt=border(p,0);

    var lastPt=border(p,1); //the 1 ensures you get the full circle
    var pt=border(p,1);
	//rainbow border
	for(i=0;i<N;i++){
        lastPt=pt;
        pt=border(p,i/N);
        
		p.stroke(colorMap(p,i/N));
		p.line(lastPt.x,lastPt.y,pt.x,pt.y)
	}
	p.pop();
}


  //take in 2 points on the boundary of a circle, and the center of the circle, and 
//draw the hyperbolic geodesic in the poincare model
//(assume circle centered at 0,0)
function drawStringHyperbolic(p,v1,v2){
	//calculate the coordinates
	let theta = p.abs(v1.angleBetween(v2)/2);
	let r0=p.sqrt(v1.mag()*v2.mag()); //our guess for radius of the circle
	let r1 =  r0*p.tan(theta); //radius of new circle
	let c = v1.copy().add(v2).normalize().mult(p.sqrt(r0**2+r1**2));//center of new circle

	//draw it now
	p.push();
	p.noFill();
	//if(r1>10000){line(v1.x,v1.y,v2.x,v2.y);}
	p.circle(c.x,c.y,r1*2); //DIAMETER, not radius
	p.pop();
}




function colorMap(p,x){
	return p.color(x*100,70,90);
  }

    //parametrically define a path, based off parameter x in [0,1]
function border(p,x,borderName){

	let offset=p.createVector(0,0),
		thisRad=radius;
	switch(borderName){
		case "Epicycloid":
			offset=p.createVector(p.cos(2*p.PI*x*(mBorder+1)),p.sin(2*p.PI*x*(mBorder+1)));
			offset.y-=1/(mBorder+1); //recorrect to keep it centered
			thisRad-=offsetScale;
			break;
		case "Random":
			offset=p.createVector(p.noise(randScaleBorder*x)+p.noise(randScaleBorder*(1-x))-1,p.noise(randScaleBorder*x+5)+p.noise(randScaleBorder*(1-x)+5)-1);
			break;
		case "Ellipse":
			offset=p.createVector(cos(2*PI*x),0);
			break;
	}

    offset.mult(offsetScale);

    let circle=p.createVector(p.cos(2*p.PI*(x)),p.sin(2*p.PI*(x))).mult(radius);
    return circle.add(offset);
}

function diffeo(p,x,diffeoName){
    switch(diffeoName){
        case "multiply":
            return (x*multiplier+phase)%1;
        case "noise":
            return (phase+x+periodicNoise(x,randScaleDiffeo/5,10)*3*diffeoParam)%1;
            //return noise(rDensity*(x+phase)+10)+noise(rDensity*(1-(x+phase))+10)-1;
        case "logistic":
            return ((3+diffeoParam)*x*(1-x))%1;
        case "cosine":
            return (p.cos((x+phase*2)*p.PI*multiplier)+1)/2;
        case "mobius": //construct a real mobius transform
            return mobius(p,x,mobiusA,mobiusB,mobiusC,mobiusD);
        case "Arnold Tounges":
            return (x+phase+diffeoParam*p.sin(x*2*p.PI*multiplier));
        case "zero":
            return diffeoParam;
        case "mobius+square":
            for(let j=0;j<multiplier;j++){
                x=fract(2*(x+phase));
                x=mobius(p,x,mobiusA,mobiusB,mobiusC,mobiusD);
                
            }
            return x;
        default:
            return 1*x;
    }

}

function mobius(p,x,a,b,c,d){
	let vec=p.createVector(p.cos(x*p.PI),p.sin(x*p.PI));  //ONLY PI around, as to not double count RP1
	T=[[a,b],[c,d]];
	vec=p.createVector(T[0][0]*vec.x+T[1][0]*vec.y,T[0][1]*vec.x+T[1][1]*vec.y); //matrix multiply, since i cant do that in p5js for some reason
	
	return fract(p.atan2(vec.y,vec.x)/p.PI) ;  //renormalize to 0,1
	//to compinsate for the the dividing by two in the first angle, we need to multiply x by 2 here. Hence, it only really goes from 0,.5
}

function fract(x){
    return (x%1+1)%1;
}

//deterministic random number generator
function rand(p,seed){
	return fract(p.sin(seed*78.233) * 43758.5453);
}




//complex numbers
class Cx{
	constructor(p,v=[0,0]){

        this.p=p; //p5js instance
		this.cart=v;


	}

	set cart(v){
		this.x=v[0];
		this.y=v[1];
		this.makePolar();
	}
	get cart(){
		return [this.x,this.y];
	}

	set polar(v){
		this.r=v[0];
		this.t=v[1];
		this.makeCart();
	}
	get polar(){
		return [this.r,this.t];
	}

	makePolar(){

		this.t = -this.p.atan2(this.y,this.x);
		this.r=this.p.sqrt(this.x**2+this.y**2);
	}

	makeCart(){
		this.x=this.r*this.p.cos(-this.t);
		this.y=this.r*this.p.sin(-this.t);
	}

	mult(z){
		this.r*=z.r;
		this.t+=z.t;
		this.makeCart();
        return this;
	}

	static mult(p,z1,z2){
		let z1_ = Cx.copy(p,z1);
		z1_.mult(z2);
		return z1_;
	}	

	add(z){
		this.cart=[this.x+z.x,this.y+z.y];
        return this;
	}
    
    inverse(){
        this.r=1/this.r;
        this.t=-this.t;
		this.makeCart();
        return this;
    }

    static inverse(p,z){
        let z_=copy(p,z);
        return z_.inverse();
    }

    negative(){
        this.x=-this.x;
        this.y=-this.y;
        this.makePolar();
        return this;
    }

	static add(p,z1,z2){
		let z1_ = copy(p,z1);
		return z1_.add(z2);
	}	

	static copy(p,z){
		return new Cx(p,[z.x,z.y]);
	}

    copy(){
		return new Cx(this.p,[this.x,this.y]);
	}

    //set useful constants and variables
    static zero(p){  return new Cx(p,[0,0]);    }
    static one(p){   return new Cx(p,[1,0]);    }
    static i(p){     return new Cx(p,[0,1]);    }


    //complex domain coloring
    domColor(){
        this.p.push();
        this.p.colorMode(this.p.HSB,1);
        let c = this.p.color(this.t/(2*this.p.PI),1,this.r);
        this.p.pop();
        return c;
    }

    //a,b,c,d complex numbers
    mobius(a,b,c,d){
        let denominator=this.copy().mult(c).add(d);
        this.mult(a).add(b).mult(denominator.inverse());
        return this;
    }

    //a,b,c,d real numbers
    realMobius(a_,b_,c_,d_){
        let a=new Cx(this.p,[a_,0]);
        let b=new Cx(this.p,[b_,0]);
        let c=new Cx(this.p,[c_,0]);
        let d=new Cx(this.p,[d_,0]);
        return this.mobius(a,b,c,d);
    }

    //Construct the poincare disc isometry, defined by an element of PSL(2,R)
    // specifically, the matrix with real coeficents a,b,c,d
    poincareDiscIsometry(a,b,c,d){

        //first, map the poincare disc to upper half plane
        this.mobius(Cx.i(this.p),Cx.i(this.p),Cx.one(this.p),Cx.one(this.p).negative()); 

        //then, apply a real mobius transform
        this.realMobius(a,b,c,d);

        //finally, map the half plane back to disk

        this.mobius(Cx.one(this.p),Cx.i(this.p),Cx.one(this.p),Cx.i(this.p).negative()); 

        return this;
    }


   
}