function normalizeCoords(){
	strokeWeight(.01);
	translate(width/2,height/2);
	scale(height/2);

	mX=(mouseX-width/2)/ (height/2);
	mY=(mouseY-height/2)/ (height/2);

	pmX=(pmouseX-width/2)/ (height/2);
	pmY=(pmouseY-height/2)/ (height/2);
}


class Point{
    constructor(c,p){
        this.c=c;
        this.pos=p;
    }

    draw(){
        this.c.ellipse(this.pos.x,this.pos.y,.1,.1);
    }
}