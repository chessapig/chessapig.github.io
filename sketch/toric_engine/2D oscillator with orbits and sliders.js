
let slider_freqX;
let slider_freqY;
let pos_sliderX=[10,425];


function setup() {
	c = createCanvas(500, 500);
	//c = createCanvas(windowWidth, windowHeight);
	strokeWeight(.01);

	
	oSim=new Oscillator2D_sim(.2,0,1,0,.4,1);
	//oSim.doDrawOrbit=false;
	//oSim.doDrawSpring=false;

	slider_freqX = createSlider(1, 5, 1, 1);
	slider_freqY = createSlider(1, 5, 1, 1);



	slider_freqX.position(pos_sliderX[0], pos_sliderX[1]);
	slider_freqX.style('width', '200px')

	slider_freqY.position(275, 425);
	slider_freqY.style('width', '200px')

	background(color(BKG))
  }

function draw() {
	let background_color=color(BKG);
	background_color.setAlpha(200);
	background(background_color);

	//update values of masses
	let freqX=slider_freqX.value();
	let freqY=slider_freqY.value();
	oSim.freqX=freqX;
	oSim.freqY=freqY;


	push();
		textSize(18);
		fill(color(WHITE));
		text('freq. of X-oscillator: ', pos_sliderX[0], pos_sliderX[1]-20);
		text('freq. of Y-oscillator: ', 275, 405);

		textSize(24);
		fill(color(YELLOW));
		text(str(freqX), pos_sliderX[0]+175, pos_sliderX[1]-20);
		text(str(freqY), 450, 405);
	pop();

	normalizeCoords();
	
	for(let i=0;i<10;i++){ //update 10 times to improve accuracy
		oSim.update();
	}

	oSim.draw();

}

function mousePressed(){
	oSim.p.pressed();
}

function mouseReleased(){
	oSim.p.released();
}

function keyPressed(){
	switch(key) {
		case 'c':
			background(color(BKG));
			break;
  }  
}
