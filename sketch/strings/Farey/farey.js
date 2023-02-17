var farey = function(p){
	let s;
	let parent="farey";
	p.setup=function() {
		p.smooth();
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new Farey(p,"farey");

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
	}
}

var fuschian = function(p){
	let s;
	let parent="fuschian";
	p.setup=function() {
		p.smooth();
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new Fuschian(p,"fuschian");

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
	}
}

var ellipticStringArt = function(p){
	let s;
	let parent="ellipticStringArt";
	p.setup=function() {
		p.smooth();
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new EllipticStringArt(p,"ellipticStringArt",50,new Cx(),.1);

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
	}
}

var loxodromicStringArt = function(p){
	let s;
	let parent="loxodromicStringArt";
	p.setup=function() {
		p.smooth();
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new LoxodromicStringArt(p,"loxodromicStringArt",50,new Cx([0,.2]),0);

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
	}
}


var farey = new p5(farey);
var fuschian = new p5(fuschian);
var ellipticStringArt = new p5(ellipticStringArt);
var loxodromicStringArt = new p5(loxodromicStringArt);

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function makeListeners(s,canvas,parent){
	document.getElementById(parent).addEventListener("mousedown", e=> s.controls.mousePressed(e));
	canvas.mouseWheel(e => s.controls.worldZoom(e)); //Controls from libraries/zoom
	canvas.mouseMoved(e => s.controls.mouseMoved(e));
	canvas.mouseReleased(e => s.controls.mouseReleased(e));
	//canvas.doubleClicked(e => s.toggleFocus());
	document.getElementById(parent).addEventListener("dblclick", e=>  s.toggleFocus());
	document.addEventListener("keydown", event => {
		if (event.code === 'Space') {
			event.preventDefault();
		  s.cycleModel();
	  	} 	 
	});
}


//general class, which every thing will build utop.
class myCanvas{
	constructor(p,parent=""){
		this.p=p;
		this.parent=parent;
		this.BKG='#2c2621';

		this.controls=new Control(p);
		disableScroll();
		this.toggleFocus();

	}

	

	toggleFocus(){
		this.controls.focused=!this.controls.focused;
		if(this.controls.focused){
			this.p.loop()
			disableScroll();
		} else {
			this.p.noLoop();
			enableScroll();
		}
	}

	//resets canvas, rescales according to current viewport
	setupDraw(){
		this.p.blendMode(this.p.BLEND);
		this.p.background(this.BKG);
	}
	
	transformCanvas(){
		//zooms and scales
		this.controls.transformCanvas();
		this.p.strokeWeight(this.lineDiamModifier);	
	}
}





class HyperbolicPlane extends myCanvas{
	constructor(p,parent){
		super(p,parent);
		this.complexScale=250; //sets radius of unit circle 
		this.geodesicCutoff=.005; //sets the geodesic rendering cutoff in terms of radians
		this.NBorder=1000;
		this.lineDiamModifier=1;
		this.model="Poincare_Disc"
		this.doViewSelector=true;
		this.doExtend=false;

		//sets the hyperbolic view, defined as a translation by a complex number, followed by rotation by some angle
		this.hyperbolicView=[0,new Cx()]; 

		this.p.colorMode(this.p.HSB, 100);

		//this.toggleFocus();
    }

	cycleModel(){
		if(this.controls.focused){
			if(this.model=="Poincare_Disc"){
				this.model = "Klein_Disc";
			} else if (this.model=="Klein_Disc"){
				this.model = "Poincare_Disc";
			}
		}
		
	}

	draw(){
		
		this.setupDraw(); //sets up blend mode, draws 
		this.drawSliders(); //draws sliders before transforming coordinates
		this.transformCanvas();

		this.drawInfinity();

		this.drawLines();

		if(this.doViewSelector){
			let easingStrength=.2;
			if(this.p.keyIsDown(this.p.SHIFT)){
				let newA = this.getComplexPoint();
				let a = this.hyperbolicView[1];
				a.add(newA.add(a.copy().negative()).scale(easingStrength));
			}
			this.drawPoint(this.hyperbolicView[1]);
		}

		if(!this.controls.focused){
			this.p.background(this.BKG+"AA");
		}

		if(!this.p.mouseIsPressed){
			this.controls.mouseReleased();
		}
	}


	//by default,dont draw any sliders
	drawSliders(){

	}
	
	
	drawLines(){

	}

	//draws a point at a complex number z
	drawPoint(z){
		this.p.push();
		this.p.blendMode(this.p.BLEND);
		this.p.stroke(this.colorMap(0));
		this.p.strokeWeight(3/z.poincareMetric());
		let circRadius=20/z.poincareMetric();
		this.p.circle(z.x*this.complexScale,-z.y*this.complexScale,circRadius);
		this.p.pop();
	}

	//draws the ideal boundary of the hyperbolic plane
	drawInfinity(){
		//this.p.blendMode(this.p.ADD);
        this.p.push();
		

        //this.p.strokeWeight(this.p.sqrt(this.lineDiamModifier)*2);
		this.p.strokeWeight(this.p.sqrt(20/this.controls.view.zoom*this.lineDiamModifier)*2);



        var lastPt=this.border(0)
        var pt=this.border(0);

        var lastPt=this.border(1); //the 1 ensures you get the full circle
        var pt=this.border(1);


        //rainbow border
        for(let i=0;i<=this.NBorder;i++){
            lastPt=pt;
            pt=this.border(i/this.NBorder);
            
            this.p.stroke(this.colorMap(i/this.NBorder));
            this.p.line(lastPt.x,lastPt.y,pt.x,pt.y)
        }

        this.p.pop();

    }

	//uses mouse to select complex number in unit disc
	getComplexPoint(){

		let coords=this.controls.transformCoords(this.p.mouseX,this.p.mouseY);


		let a = new Cx([coords[0],-coords[1]]);
		a.mult(new Cx([1/this.complexScale,0]));
		return a;
	}


	//returns a vector contianing coordinates of border point
	border(x){
		return this.circle(x);
    }

	circle(x){
		return this.p.createVector(this.p.cos(2*this.p.PI*(x)),this.p.sin(2*this.p.PI*(x))).mult(this.complexScale);
	}

	colorMap(x){
		return this.p.color(x*100,70,90,200/this.lineDiamModifier);
	  }


	//finds the arc angel between two angles from 0 to 2 pi, which will be a number less than pi
	arcAngle(angle1,angle2){
		let arcAngle = Math.min(angle2-angle1,angle1-angle2);
		arcAngle=Math.min(Math.abs(arcAngle), Math.abs(arcAngle+2*Math.PI));
		return arcAngle;
	}	

	//draw a geodesic from start to end, which are points on hyperbolic infinity defined by numbers from 0 to 2*pi.
	//the assoicated poitns are given by border(start) and border(end)
	drawGeodesic(start,end,color=this.colorMap(start.t/(Math.PI*2))){
		//convert the start and end points to coordinates
		//let v1=this.border(start);
		//let v2=this.border(end);


		this.p.blendMode(this.p.ADD);
		//apply hyperbolic view transform
		let z1 = start.copy().unitCircleMobius(this.hyperbolicView[0],this.hyperbolicView[1].copy().negative());
		let v1 = this.p.createVector(z1.x*this.complexScale,z1.y*this.complexScale);

		let z2 = end.copy().unitCircleMobius(this.hyperbolicView[0],this.hyperbolicView[1].copy().negative());
		let v2 = this.p.createVector(z2.x*this.complexScale,z2.y*this.complexScale);
		

		


		let angle1=v1.heading(); let angle2 = v2.heading();
		let diff = this.arcAngle(angle1,angle2)/(2*Math.PI);
		if(diff<this.geodesicCutoff){
			return;
		}

		//let color = this.colorMap(start);
		color.setAlpha(Math.sqrt(Math.abs(diff-this.geodesicCutoff))*255);

		this.p.stroke(color);
		this.p.strokeWeight(this.p.sqrt(10/this.controls.view.zoom*this.lineDiamModifier * Math.sqrt(diff))*2);


		switch(this.model){
			case "Klein_Disc":
				
				this.p.line(v1.x,v1.y,v2.x,v2.y);
				break;

			case "Poincare_Disc":
				let theta = this.p.abs(v1.angleBetween(v2)/2);
				let r0=this.complexScale;
				//let r0=this.p.sqrt(v1.mag()*v2.mag()); //our guess for radius of the border circle
				let r1 =  r0*this.p.tan(theta); //radius of new circle
				if(r1>100000000 || isNaN(r1)){this.p.line(v1.x,v1.y,v2.x,v2.y);}
				else{ 
					let c = v1.copy().add(v2).normalize().mult(this.p.sqrt(r0**2+r1**2));//center of new circle

					//draw it now
					this.p.push();
					this.p.noFill();
					if(this.doExtend){
						
						this.p.circle(c.x,c.y,r1*2);//DIAMETER, not radius }s
					} else {
						let refrence = p5.Vector.fromAngle(0);
						let angle1= -v1.copy().sub(c).angleBetween(refrence);
						let angle2 = -v2.copy().sub(c).angleBetween(refrence);
						
						//choose ordering of angles such that the shortest arc (the interior) is chosen
						let arcAngle = angle2-angle1;
						if(arcAngle<0){arcAngle+=2*this.p.PI;} //choose smallest positive arc angle up to multiple of 2pi
						if(arcAngle>this.p.PI){//if the angle is larger than half the circle, switch the bounds
							let tempAngle=angle1;
							angle1=angle2;
							angle2=tempAngle;
						}
						this.p.arc(c.x,c.y,r1*2,r1*2,angle1,angle2);

					}
					this.p.pop();
				}
				
				break;

		}


	}
}


class Fuschian extends HyperbolicPlane{
	drawLines(){
		let  generators = [ 
			//[0,-1,1,0],
			[1,1,0,1],
			[0,-1,1,0]
			];

		this.recurseFuschian(Cx.i(),generators,1, 3);
	}

	//acts on the geodesic by each of the generators, draws the geodesics, and repeats 
	recurseFuschian(z,generators,iter, maxIters){

		//console.log(z0.t);


		if(iter> maxIters){
			return;
		}

		let g;
		let znew=new Cx();
		for(var i=0;i<generators.length;i++){
			g = generators[i];

			//apply g
			znew=z.copy().poincareDiscIsometry(g[0],g[1],g[2],g[3]);
			this.drawGeodesic(z,znew,this.colorMap(iter/(maxIters+1)));
			this.recurseFuschian(znew,generators,iter+1, maxIters);

			//apply g inverse, by taking the inverse of a 2 by 2 matrix, up to scale
			znew=z.copy().poincareDiscIsometry(g[3],-g[1],-g[2],g[0]);
			this.drawGeodesic(z,znew,this.colorMap(iter/(maxIters+1)));
			this.recurseFuschian(znew,generators,iter+1, maxIters);
		}
	}
}

class Farey extends HyperbolicPlane{
	drawLines(){//let a=this.getComplexPoint();


		//iterate thru all pairs n/d, n'/d', connecting them if nd'-n'd=+-1
		let numIters=50;
		for(let d=0;d<numIters;d++){
			for(let n=0;n<=d;n++){
				for(let d1=0;d1<numIters;d1++){
					for(let n1=0;n1<=d1;n1++){
						if(n*d1-n1*d ==-1  ){
							let start=new Cx();
							start.polar = [1,n/d*2*Math.PI];
							//start.unitCircleMobius(0,a); //apply a mobius transform to the start and end

							let end=new Cx();
							end.polar = [1,n1/d1*2*Math.PI];
							//end.unitCircleMobius(0,a);


							//draw the geodesics with color defined by n/d, the starting position of the geodesic
							//this.drawGeodesic(start.t/(2*Math.PI),end.t/(2*Math.PI), this.colorMap(n/d));
							this.drawGeodesic(start,end, this.colorMap(n/d));

						}
					}
				}
			}
		}

		//draw lines from zero to rational functions of the form n/d
		// for(let d  = 1;d<=5;d++){
		// 	for(let n=1; n<=d; n++){
		// 		this.drawGeodesic(0,n/d);
		// 	}
		// }
	}
}

class StringArt extends HyperbolicPlane{
	constructor(p,parent,numStrings,translate=new Cx(), rotate=0){
		super(p,parent);
		this.numStrings=numStrings;

		this.translate=translate; //translation for mobius transform
		this.rotate=rotate; //rotation for mobius transform
	}

	drawLines(){
		drawMobiusLines();
	}

	drawMobiusLines(){
		let z=new Cx(),
			znew=new Cx();
		for(let i=0; i<this.numStrings; i+= 1){
			let theta=i*2*Math.PI/this.numStrings;
			z.polar = [1,theta];
			znew = z.copy().unitCircleMobius(this.rotate*2*Math.PI,this.translate);
			this.drawGeodesic(z, znew) ;
		}
	}
	
}

class EllipticStringArt extends StringArt{
	constructor(p,parent,numStrings,translate=new Cx(), rotate=0){
		super(p,parent,numStrings,translate,rotate);

		this.doExtend=true;

		//make it so the initial configuration doesnt overlap the sliders
		this.controls.view.zoom=.5;
		this.controls.view.x=200;
		this.controls.view.y=200;
		
		//setup slider for number of strungs
		this.pos_slider1 = [30,50];
		this.slider_numStrings = this.p.createSlider(1, 150, numStrings, 1);
		this.slider_numStrings.parent(this.parent);
		this.slider_numStrings.position(this.pos_slider1[0], this.pos_slider1[1]);
		this.slider_numStrings.style('width', '200px');

		//setup slider for the angle
		this.slider_angle = this.p.createSlider(0, 1, this.rotate, .01);
		this.slider_angle.parent(this.parent);
		this.slider_angle.position(this.pos_slider1[0], this.pos_slider1[1]+70);
		this.slider_angle.style('width', '200px');

	}


	drawSliders(){

		this.p.push();
			this.p.textSize(18);
			this.p.fill('#e6cfb3');
			this.p.stroke('#e6cfb3');
			this.p.strokeWeight(1);

			this.p.text('Number of strings: ', this.pos_slider1[0]-10, this.pos_slider1[1]-10);
			this.p.text('Rotation angle: ', this.pos_slider1[0]-10, this.pos_slider1[1]+60);

			this.p.textSize(24);
			this.p.fill(this.colorMap(1));
			this.p.text(this.p.str(this.numStrings), this.pos_slider1[0]+150, this.pos_slider1[1]-10);
			this.p.text(this.p.str(this.rotate), this.pos_slider1[0]+150, this.pos_slider1[1]+60);

		this.p.pop();
	}

	drawLines(){
		this.rotate= this.slider_angle.value();
		this.numStrings= this.slider_numStrings.value();
		this.lineDiamModifier=100/this.numStrings;

		this.drawMobiusLines();
	}
}



class LoxodromicStringArt extends StringArt{
	constructor(p,parent,numStrings,translate=new Cx(), rotate=0){
		super(p,parent,numStrings,translate,rotate);

		this.doViewSelector=false;
		
		//setup slider for number of strungs
		this.pos_slider1 = [30,50];
		this.slider_numStrings = this.p.createSlider(1, 150, numStrings, 1);
		this.slider_numStrings.parent(this.parent);
		this.slider_numStrings.position(this.pos_slider1[0], this.pos_slider1[1]);
		this.slider_numStrings.style('width', '200px');

		//setup slider for the angle
		// this.slider_angle = this.p.createSlider(0, 1, this.rotate, .01);
		// this.slider_angle.parent(this.parent);
		// this.slider_angle.position(this.pos_slider1[0], this.pos_slider1[1]+70);
		// this.slider_angle.style('width', '200px');

	}


	drawSliders(){

		this.p.push();
			this.p.textSize(18);
			this.p.fill('#e6cfb3');
			this.p.stroke('#e6cfb3');
			this.p.strokeWeight(1);

			this.p.text('Number of strings: ', this.pos_slider1[0]-10, this.pos_slider1[1]-10);
			// this.p.text('Rotation angle: ', this.pos_slider1[0]-10, this.pos_slider1[1]+60);

			this.p.textSize(24);
			this.p.fill(this.colorMap(1));
			this.p.text(this.p.str(this.numStrings), this.pos_slider1[0]+150, this.pos_slider1[1]-10);
			// this.p.text(this.p.str(this.rotate), this.pos_slider1[0]+150, this.pos_slider1[1]+60);

		this.p.pop();
	}

	drawLines(){
		// this.rotate= this.slider_angle.value();
		this.numStrings= this.slider_numStrings.value();
		this.lineDiamModifier=100/this.numStrings;


		let easingStrength=.2;
			if(this.p.keyIsDown(this.p.SHIFT)){
				let newA = this.getComplexPoint();
				this.translate.add(newA.add(this.translate.copy().negative()).scale(easingStrength));
			}
			this.drawPoint(this.translate);

		this.drawMobiusLines();
	}
}





//complex numbers
class Cx{
	constructor(v=[0,0]){

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

		this.t = Math.atan2(this.y,this.x);
		this.r=Math.sqrt(this.x**2+this.y**2);
	}

	makeCart(){
		this.x=this.r*Math.cos(this.t);
		this.y=this.r*Math.sin(this.t);
	}

	mult(z){
		this.r*=z.r;
		this.t+=z.t;
		this.makeCart();
        return this;
	}7

	static mult(z1,z2){
		let z1_ = Cx.copy(z1);
		z1_.mult(z2);
		return z1_;
	}	

	//multiply by a real number
	scale(x){
		this.r*=x;
		this.makeCart();
        return this;
	}

	add(z){
		this.cart=[this.x+z.x,this.y+z.y];
        return this;
	}

	static add(z1,z2){
		let z1_ = Cx.copy(z1);
		return z1_.add(z2);
	}	

    
    inverse(){
        this.r=1/this.r;
        this.t=-this.t;
		this.makeCart();
        return this;
    }

    static inverse(z){
        let z_=Cx.copy(z);
        return z_.inverse();
    }

    negative(){
        this.x=-this.x;
        this.y=-this.y;
        this.makePolar();
        return this;
    }

	static negative(z){
		let z_=Cx.copy(z);
		return z_.negative();
	}

	conjugate(){
        this.y=-this.y;
        this.makePolar();
        return this;
	}

	static conjugate(z){
		let z_=Cx.copy(z);
		return z_.negative();
	}

	norm(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
	}

	static norm(z){
        return Math.sqrt(z.x*z.x+z.y*z.y);
	}

	copy(){
		return new Cx([this.x,this.y]);
	}
	static copy(z){
		return new Cx([z.x,z.y]);
	}

    

    //set useful constants and variables
    static zero(){  return new Cx([0,0]);    }
    static one(){   return new Cx([1,0]);    }
    static i(){     return new Cx([0,1]);    }


    //a,b,c,d complex numbers
    mobius(a,b,c,d){
        let denominator=this.copy().mult(c).add(d);
        this.mult(a).add(b).mult(denominator.inverse());
        return this;
    }

	//theta is a real number, a is a complex number in the unit disc.
	//sends z to e^(2 pi i theta)  {z-a}/{1-z a conjugate}
	unitCircleMobius(theta,a){
		let expt =new Cx(); 
		expt.polar = [1,theta]; //unit norm complex number
		
		return this.mobius(Cx.one(), Cx.negative(a).conjugate(), Cx.negative(a),Cx.one()).mult(expt);
	}

	static crossRatio(a,b,c,d){
		let numerator = Cx.add(b, Cx.negative(a)).mult(Cx.add(d, Cx.negative(c)));
		let denominator = Cx.add(c, Cx.negative(b)).mult(Cx.add(d, Cx.negative(a)));
		return numerator.mult(denominator.inverse());
	}

    //a,b,c,d real numbers
    realMobius(a_,b_,c_,d_){
        let a=new Cx([a_,0]);
        let b=new Cx([b_,0]);
        let c=new Cx([c_,0]);
        let d=new Cx([d_,0]);
        return this.mobius(a,b,c,d);
    }

    //Construct the poincare disc isometry, defined by an element of PSL(2,R)
    // specifically, the matrix with real coeficents a,b,c,d
    poincareDiscIsometry(a,b,c,d){

        //first, map the poincare disc to upper half plane
        this.mobius(Cx.i(),Cx.i(),Cx.one(),Cx.one().negative()); 

        //then, apply a real mobius transform
        this.realMobius(a,b,c,d);

        //finally, map the half plane back to disk

        this.mobius(Cx.one(),Cx.i(),Cx.one(),Cx.i().negative()); 

        return this;
    }

	//returns the metric scale factor for the poincare disc model in the unit disc 1/(1-|z|^2)^2
	poincareMetric(){


        return 1/(1-Math.pow(this.norm(),2));
    }

   
}