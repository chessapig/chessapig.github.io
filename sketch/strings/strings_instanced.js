var string = function(p){
p.setup=function() {
	var parent="string"
	setupCanvas(p,parent);


	// label = p.createDiv('Number of lines');
	// label.parent(document.getElementById(parent).parentElement)
	// label.position(0, 0);  
	// slider = p.createSlider(0, 1000, 500, 1);
	// slider.parent(document.getElementById(parent).parentElement)
	// slider.position(0,40);
	// slider.style('width', '200px');


	mult_label = p.createDiv('Multiplier');
	mult_label.parent(document.getElementById(parent).parentElement)
	mult_label.position(0, 00);  
	mult_slider = p.createSlider(1, 10, 2, 1);
	mult_slider.parent(document.getElementById(parent).parentElement)
	mult_slider.position(0,40);
	mult_slider.style('width', '200px');

	add_label = p.createDiv('shift');
	add_label.parent(document.getElementById(parent).parentElement)
	add_label.position(230, 00);  
	add_slider = p.createSlider(0, 1, .5, .001);
	add_slider.parent(document.getElementById(parent).parentElement)
	add_slider.position(230,40);
	add_slider.style('width', '200px');


}
p.draw=function() {
	// NPoints=slider.value();
	// NLines=NPoints;
	multiplier=mult_slider.value();
	mult_label.html("Multiplier: " + p.str(multiplier));

	shift=add_slider.value();
	add_label.html("shift: " + p.str(shift));
	p.push();
	setupDraw(p);

	drawBorder(p);
	
	let x=0,
		xNew=0;
	for(i=0;i<NPoints;i++){
		//x=rand(p,i); //lil deterministic pseudorandom function
		x=i/NPoints;
		xNew=0;

		for(iter=0;iter<NIters;iter++){
			xNew=fract(multiplier*x+shift);
			p.stroke(colorMap(p,x)); //Color by the starting point location

			pt=border(p,x);
			endPt=border(p,xNew);

			//drawStringHyperbolic(p,pt,endPt); 
			p.line(pt.x,pt.y,endPt.x,endPt.y);

			x=xNew;
		}
	}
	p.pop();
	if(!controls.focused){
		//p.blendMode(p.ADD)
		//p.background(HLGHT+"20");
		p.background(BKG+"AA");
	}
   }
}


var string2 = function(p){
p.setup=function() {
	setupCanvas(p,"string3");
}

p.draw=function() {
	p.push();
	setupDraw(p);

	drawBorder(p);
	
	let x=0,
		xNew=0;
	for(i=0;i<NPoints;i++){
		//x=rand(p,i); //lil deterministic pseudorandom function
		x=i/N;
		xNew=0;

		for(iter=0;iter<NIters;iter++){
			xNew=diffeo(p,x,"multiply")
			p.stroke(colorMap(p,x)); //Color by the starting point location

			offsetScale=1.5;
			mBorder=2;
			pt=border(p,x,"Epicycloid");
			endPt=border(p,xNew,"Epicycloid");

			//drawStringHyperbolic(p,pt,endPt); 
			p.line(pt.x,pt.y,endPt.x,endPt.y);

			x=xNew;
		}
	}
	p.pop();
	if(!controls.focused){
		p.background(BKG+"AA");
	}
	}
}


var string3 = function(p){
	let s;
	let parent="string3";
	p.setup=function() {
		var width = document.getElementById(parent).offsetWidth;
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new Strings(p);

		makeListeners(s,canvas,parent)
		s.toggleFocus();
	}
	
	p.draw=function() {
		s.draw();
	}
}


var string4 = function(p){
	let s;
	let parent="string4";
	p.setup=function() {
		p.smooth();
		var width = document.getElementById(parent).offsetWidth;
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new Strings_wrap_animation(p,1);
		

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
		s.borderStrength=(p.sin(p.frameCount/100)*.5+.5)*3;
	}
}

var frobenius = function(p){
	let s;
	let parent="string4";
	p.setup=function() {
		p.smooth();
		var width = document.getElementById(parent).offsetWidth;
		canvas=p.createCanvas(700, 700);
		canvas.parent(parent);
		
		s = new Frobenius(p,1003,5);
		

		makeListeners(s,canvas,parent)
	}
	
	p.draw=function() {
		s.draw();
		//s.borderStrength=(p.sin(p.frameCount/100)*.5+.5)*3;
	}
}
	



// var string = new p5(string);
// var string2 = new p5(string2);

// var string3 = new p5(string3);

 var frobenius = new p5(frobenius);

