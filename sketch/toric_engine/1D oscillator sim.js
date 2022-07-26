

var oscillator1DnoGraph = function(p){

	var background_color,
		oSim;

	p.setup=function(){
		var width = document.getElementById('oscillator1DnoGraph').offsetWidth;
		c = p.createCanvas(width, p.windowHeight/5);
		c.parent("oscillator1DnoGraph");

		
	
		oSim=new Oscillator1D_sim(p,.6,0,4);
		oSim.pt.size=2*500/c.height;
		//normalizeCoords(p);
		background_color=p.color(BKG);
		background_color.setAlpha(200);
	  }

	p.draw=function(){
		p.background(background_color);
		normalizeCoords(p)

		for(let i=0;i<10;i++){ //update 10 times to improve accuracy
			oSim.update();
		}

		oSim.draw();
	}

	p.mousePressed = function(){
		oSim.pt.pressed();
	}
	
	p.mouseReleased= function(){
		oSim.pt.released();
	}
}
var myp5 = new p5(oscillator1DnoGraph,"oscillator1DnoGraph");





var oscillator1D = function(p){

let background_color,
	oSim2;	

p.setup=function(){
	c = p.createCanvas(500, 500);
	c.parent("oscillator1D");

	
	oSim2=new Oscillator1D_sim(p,.6,0,1);
	g=new Graph(p);
	g.doMinorGrid=false;
	g.resolution=500;
	g.border_smoothness=10;
	g.bkg=p.color(BKG);
	g.xLabel="x";
	g.yLabel="p";
	g.setup();
  }

p.draw=function(){
	normalizeCoords(p);
	let background_color=p.color(BKG);
	background_color.setAlpha(200);
	g.c.background(background_color);

	
	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim2.update();
	}

	g.drawGrid();
	g.drawPoint([oSim2.pt.x,oSim2.px],p.color(WHITE));
	//g.drawPoint([.5,0],p.color(WHITE));
	g.drawBorder();
	p.image(g.c,-1,-1,2,2);

	p.push();
		oSim2.draw();
	p.pop();
}

p.mousePressed = function(){ oSim2.pt.pressed();}
p.mouseReleased= function() { oSim2.pt.released(); }
}
var myp5 = new p5(oscillator1D,"oscillator1D");

