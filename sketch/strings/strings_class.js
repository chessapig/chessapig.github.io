

//take in control class as input
function makeListeners(s,canvas,parent){
	document.getElementById(parent).addEventListener("mousedown", e=> s.controls.mousePressed(e));
	canvas.mouseWheel(e => s.controls.worldZoom(e)); //Controls from libraries/zoom
	canvas.mouseMoved(e => s.controls.mouseMoved(e));
	canvas.mouseReleased(e => s.controls.mouseReleased(e));
	canvas.doubleClicked(e => s.toggleFocus());
	document.addEventListener("keydown", event => {
		if (event.code === 'Space') {
		  s.doHyperbolic=!s.doHyperbolic;
	  	} 	 
	});
}



class Strings{
	
    constructor(p,NLines=50){
		this.BKG='#2c2621';
		this.p=p;
		this.borderRadius=250;
        this.NLines=NLines;
        this.NIters=1;
        this.NPoints=this.p.floor(this.NLines/this.NIters);
        this.NBorder=this.NPoints;

		this.controls=new Control(p);
		this.p.colorMode(this.p.HSB, 100);

		this.toggleFocus();

		this.doHyperbolic=false;
		this.doExtend=true;

    }

	// set NIters(n){
	// 	//this.NIters=n;
	// 	this.NPoints=this.p.floor(this.NLines/this.NIters);
	// }

	// set NPoints(n){
	// 	//this.NPoints=n;
	// 	this.NIters=this.p.floor(this.NLines/this.NPoints);
	// }

	// set NLines(n){
	// 	this.NLines=n;
	// 	this.NPoints
	// }


	draw(){
		this.setupDraw();
		this.drawBorder();
		this.drawStrings();
		if(!this.controls.focused){
			this.p.background(this.BKG+"AA");
		}
	}

	setupDraw(){
		this.p.blendMode(this.p.BLEND);
		this.p.background(this.BKG);
		this.p.blendMode(this.p.ADD);


		this.p.translate(this.controls.view.x, this.controls.view.y);
		this.p.scale(this.controls.view.zoom);
		this.p.translate(this.p.width/2,this.p.height/2);
		this.p.strokeWeight(100/(this.NLines));		
	}

    drawBorder(){
        this.p.push();
        this.p.strokeWeight(2);
        this.p.blendMode(this.p.BLEND);


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

	//numStrings optional: for numStrings<numPoints, get only partial stringage.  
	drawStrings(numStrings){
		if(numStrings == undefined){
			numStrings=this.NPoints
		}
		let x=0,
			xNew=0;
		for(let i=0;i<numStrings;i++){
			//x=rand(p,i); //lil deterministic pseudorandom function
			x=i/this.NPoints;
			xNew=0;



			for(let iter=0;iter<this.NIters;iter++){
				xNew=this.diffeo(x)
				this.p.stroke(this.colorMap(x)); //Color by the starting point location

				let pt=this.border(x);
				let endPt=this.border(xNew);

				//drawStringHyperbolic(p,pt,endPt); 
				this.drawLine(pt,endPt);

				x=xNew;
			}
		}
	}


	drawLine(v1,v2){
		if(this.doHyperbolic){
			let theta = this.p.abs(v1.angleBetween(v2)/2);
			let r0=this.p.sqrt(v1.mag()*v2.mag()); //our guess for radius of the border circle
			let r1 =  r0*this.p.tan(theta); //radius of new circle
			let c = v1.copy().add(v2).normalize().mult(this.p.sqrt(r0**2+r1**2));//center of new circle
	
			//draw it now
			this.p.push();
			this.p.noFill();
			if(this.doExtend){
				if(r1>100000){this.p.line(v1.x,v1.y,v2.x,v2.y);}
				this.p.circle(c.x,c.y,r1*2); //DIAMETER, not radius
			} else {
				let refrence = p5.Vector.fromAngle(this.p.mouseX/this.p.width*this.p.PI*2);
				let angle1 = v1.copy().sub(c).angleBetween(refrence);
				let angle2 = v2.copy().sub(c).angleBetween(refrence);
				this.p.arc(c.x,c.y,r1*2,r1*2,angle1,angle2);

			}
			
			this.p.pop();
		} else {
			this.p.line(v1.x,v1.y,v2.x,v2.y);
		}
	}



    border(x){
		return this.circle(x);
    }

	diffeo(x){
		return x;
	}

	circle(x){
		return this.p.createVector(this.p.cos(2*this.p.PI*(x)),this.p.sin(2*this.p.PI*(x))).mult(this.borderRadius);
	}

	colorMap(x){
		return this.p.color(x*100,70,90);
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
}



class Strings_multiply extends Strings{
	constructor(p,NLines=50,multiplier=2, phase=0){
		super(p,NLines);
		this.multiplier=multiplier;
		this.phase=phase;
	}

	diffeo(x){
		return fract(this.multiplier*x+this.phase);
	}
}


class Frobenius extends Strings{
	constructor(p,NLines,power){
		super(p,NLines);
		this.power=power;
	}

	diffeo(x){
		let n = this.p.floor(x*this.NLines);
		let nStart=n;



		// for(let i=1;i<=this.power;i++){
		// 	console.log("nStart: "+ nStart + "\n i: "+ i + "\n n^i: " + n);
		// 	n= (n*nStart) %this.NLines;
			
		// }
		
		return fract((this.p.pow(n,3)+n+1)/this.NLines);
	}
}

class Strings_wrap_animation extends Strings_multiply{
	constructor(p,border_multiplier=2){
		super(p,1000,1,.4);
		this.border_multiplier=border_multiplier;
		this.borderStrength=1; //as function of radius
	}

	border(x) {
		let offset=this.p.createVector(this.p.cos(2*this.p.PI*x*(this.border_multiplier+1)),
		this.p.sin(2*this.p.PI*x*(this.border_multiplier+1)));
		offset.x-=1/(this.border_multiplier+1); //recorrect to keep it centered
		return offset.mult(this.borderStrength).mult(this.borderRadius).add(this.circle(x)).mult(1/(1+this.borderStrength));

	}
}



function fract(x){
    return (x%1+1)%1;
}

