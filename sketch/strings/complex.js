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
        let z_=this.copy(p,z);
        return z_.inverse();
    }

    negative(){
        this.x=-this.x;
        this.y=-this.y;
        this.makePolar();
        return this;
    }

	static add(p,z1,z2){
		let z1_ = this.copy(p,z1);
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