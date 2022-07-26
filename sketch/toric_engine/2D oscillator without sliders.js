

var plainOsscilator2D = function(p){
let background_color,
	time;
p.setup = function() {
	var width = document.getElementById('plainOsscilator2D').offsetWidth;
	c = p.createCanvas(width, p.windowHeight*1.2);
	c.parent("plainOsscilator2D");
	normalizeCoords(p);

	time=0;
	oSim1=new Oscillator2D_sim(p,.2,0,1,0,.4,1);
	oSim1.doDrawOrbit=false;
	//oSim1.doDrawSpring=false;

	background_color=p.color(BKG);
	background_color.setAlpha(200);
  }

p.draw = function(){
	p.background(background_color);
	normalizeCoords(p);
	for(let i=0;i<10;i++){ oSim1.update();}
	oSim1.draw();
	time+=.02;
	oSim1.time=time;
}

p.mousePressed = function(){ oSim1.pt.pressed();}
p.mouseReleased= function() { oSim1.pt.released(); }

}
var myp5 = new p5(plainOsscilator2D,"plainOsscilator2D");



var orbitOscillatorWithSliders = function(p){
	let background_color,
		time;
	let slider_freqX;
	let slider_freqY;
	let pos_sliderX=[10,50];
	let pos_sliderY=[10,150];
	p.setup = function() {
		var width = document.getElementById('orbitOscillatorWithSliders').offsetWidth;
		c = p.createCanvas(width, p.windowHeight*.7);
		c.parent("orbitOscillatorWithSliders");
		normalizeCoords(p);
	
		time=0;
		oSim3=new Oscillator2D_sim(p,.2,0,1,0,.4,1);
	
		background_color=p.color(BKG);
		background_color.setAlpha(200);


		slider_freqX = p.createSlider(1, 5, 1, 1).parent("orbitOscillatorWithSliders");
		slider_freqY = p.createSlider(1, 5, 1, 1).parent("orbitOscillatorWithSliders");



		slider_freqX.position(pos_sliderX[0],pos_sliderX[1]);
		slider_freqX.style('width', '200px')

		slider_freqY.position(pos_sliderY[0],pos_sliderY[1]);
		slider_freqY.style('width', '200px')
		}
	
	p.draw = function(){
		let freqX=slider_freqX.value();
		let freqY=slider_freqY.value();
		oSim3.freqX=freqX;
		oSim3.freqY=freqY;	

		p.background(background_color);
		p.push();
		p.textSize(18);
		p.fill(p.color(WHITE));
		p.text('freq. of X-oscillator: ', pos_sliderX[0], pos_sliderX[1]-20);
		p.text('freq. of Y-oscillator: ', pos_sliderY[0], pos_sliderY[1]-20);

		p.textSize(24);
		p.fill(p.color(YELLOW));
		p.text(p.str(freqX), pos_sliderX[0]+175, pos_sliderX[1]-20);
		p.text(p.str(freqY), pos_sliderY[0]+175, pos_sliderY[1]-20);
		p.pop();

		
		normalizeCoords(p);
		for(let i=0;i<10;i++){ oSim3.update();}
		oSim3.draw();
		time+=.02;
		oSim3.time=time;
	}
	
	p.mousePressed = function(){ oSim3.pt.pressed();}
	p.mouseReleased= function() { oSim3.pt.released(); }
	
	}
	var myp5 = new p5(orbitOscillatorWithSliders,"orbitOscillatorWithSliders");
