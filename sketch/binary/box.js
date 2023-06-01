class Box{
	constructor(bit, key, note=0){
		this.on=false;
		this.bit=bit;
		this.width=boxWidth
		this.key=key;
		this.note=note;
		this.select=false;
		this.burst = 0; //measures time since a correct answer was entered
		this.burstDecayRate = 0.9;
		this.interactive=true;
		
		this.binding=false;
		
		this.bursts=[];
	}
	
	draw(){
		push();
		
		stroke(MID);
		if(this.select){stroke(SECONDARY);}
		strokeWeight(5);
		fill(DARK);
		if(this.on){fill(PRIMARY);}
		
		rect(-this.width/2,-this.width/2,this.width,this.width);

		fill(BODY_COLOR);
		if(this.on){fill(DARK);}
		noStroke();
		if(this.binding==false){ //only draw numbers if not in binding state
			textAlign(CENTER, CENTER);
			textSize(64);
			if(this.on){
				text("1", 0, 0);
			} else {
				text("0", 0, 0);
			}
		}
		
		
		textAlign(RIGHT, TOP);
		textSize(20);
		if(this.key==""){
			if(this.binding==true && this.select){
				if(frameCount/60-floor(frameCount/60)>0.5){ 
					fill(MID);
				}
			}
			//rect((this.width/2-12),-(this.width/2-6),10,5);
			textStyle(BOLD);
			text("＿", (this.width/2-6), -(this.width/2-6));
		} else {
			let keyStr=String.fromCharCode((96 <= this.key && this.key <= 105)? this.key-48 : this.key);
			text(keyStr, (this.width/2-6), -(this.width/2-6));
		}
			
		pop();
	}
	
	addBurst(emph){
		this.bursts.push(new Burst(emph));
		playMIDI(this.note,"success",1.5*emph/numSlots);
	}

	drawBursts(){
		for(let i=0;i<this.bursts.length;i++){
			this.bursts[i].update();
			this.bursts[i].draw();
			if(this.bursts[i].isDead){
				this.bursts.splice(i, 1);
			}
		}
	}

	
	checkKey(){
	if (keyIsDown(this.key)) {

		
		//if key toggles from on to off, and is not selected
		if(!this.on && !this.select && this.interactive && (gameState=="play" || gameState=="hold")  ){
			playMIDI(this.note-24,"fail");
		}
		
    	this.on=true;
  	} else { 
			this.on=false;
		}
	}
}

class Burst{
	constructor(emph=0){
		//when life is too large, the radius quadradic breaks, so it starts big, gets small, then gets big again.
		//which this increase in life, this only happens for the emphasis 4, the final one.
		this.life=1; 
		this.emphasis=emph;
		this.maxRadius=50+(30*emph);
		this.decay=0.95+emph/500;
		this.isDead=false;
		this.xPos=0*(2*random()-1);
		this.yPos=0*(2*random()-1);
	}
	
	update(){
		this.life*= this.decay;
		if(this.life<0.05){
			this.isDead=true;
		}
	}
		
	draw(){
		push();
		blendMode(ADD);
		let borderColor = color(SECONDARY);
		borderColor.setAlpha(this.life*255);
		strokeWeight(this.life*(5 + this.emphasis));
		stroke(borderColor)
		let fillColor = color(PRIMARY);
		fillColor.setAlpha(this.life*(100+20*this.emphasis));
		fill(fillColor);
		//quadradic easing on the width for a satisfying burst
		let burstWidth = (1-this.life*this.life)*this.maxRadius; 
		rect(-(boxWidth+burstWidth)/2 + this.xPos,
				 -(boxWidth+burstWidth)/2 + this.yPos,
				 boxWidth+burstWidth,
				 boxWidth+burstWidth);
		pop();
	}
}