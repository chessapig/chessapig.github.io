//earlier defined parameters overwritten by later ones

var json = {




params: {
	master: {
		displayName: "master",
	  },


	style: {
		displayName: "style",
	
		doShowPoints: {
			type: 		"boolean",
			default: 	false,	
		},
	
		bgColor: {
			type: 		"color",
			default: 	[200,200,200]
		},
	
		bgOpacity: {
			type: 		"number",
			default: 	.27,
			min: 		0,
			max: 		1,
			step: 		.001	
		},
	  
		strokeColorStart: {
			type: 		"color",
			default: 	[255,117,117]
		},
	
		strokeColorEnd: {
			type: 		"color",
			default: 	[118,102,163]
		},
	  
		strokeOpacity: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		.001	
		},
	  
		strokeThicknessStart: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		20,
			step: 		0.2	
		},
	
		strokeThicknessEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		20,
			step: 		0.2	
		},
	
	  
		fillColorStart: {
			type: 		"color",
			default: 	[255,255,255]
		},
	
		fillColorEnd: {
			type: 		"color",
			default: 	[69,69,69]
		},
	
		fillOpacity: {
			type: 		"number",
			default: 	0,
			min: 		0,
			max: 		1,
			step: 		.001	
		},
	},



	ani: {
		displayName: "ani",
		loopDuration: 5,
		frameRate: 30,
	  
		radiusStart: {
			type: 		"number",
			default: 	200,
			min: 		0,
			max: 		600,
			step: 		1	
		}, 
	
		radiusEnd: {
			type: 		"number",
			default: 	0,
			min: 		0,
			max: 		600,
			step: 		1	
		}, 
	
		numLoops: {
			type: 		"number",
			default: 	5,
			min: 		1,
			max: 		100,
			step: 		1	
		}, 
	  
		numPointsStart: {
			type: 		"number",
			default: 	8,
			min: 		3,
			max: 		20,
			step: 		1	
		},  
	
		numPointsEnd: {
			type: 		"number",
			default: 	8,
			min: 		3,
			max: 		20,
			step: 		1	
		},  
	},

	noise: {
		displayName: "noise",
	
		noiseType: {
			type: 		"dropdown",
			options:	["radial","none"],
			default: 	{index:0,value:"radial"},
			index:0,
		},
	
		doLoopNoise: {
			type: 		"boolean",
			default: 	"false"	
		},
		
		randomScaleStart: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		2,
			step: 		0.01	
		},
	
		randomScaleEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		2,
			step: 		0.01	
		}, 
	
		noiseRadius: {
			type: 		"number",
			default: 	0.2,
			min: 		0,
			max: 		1,
			step: 		.01	
		},   
	
		noiseScale: {
			type: 		"number",
			default: 	.65,
			min: 		0,
			max: 		1,
			step: 		.001,	
			minOrderMag:-4,
			maxOrderMag:-2
		},   
	
		noiseCenterVelocity: {
			type: 		"number",
			default: 	.2,
			min: 		0,
			max: 		1,
			step: 		.001,	
			minOrderMag:-3,
			maxOrderMag:-1
		},  
	},
},

presets: {
	"default": {
			bgColor: "#c8c8c8",
			bgOpacity: 1,
			doLoopNoise: "false",
			doShowPoints: false,
			fillColorEnd: "#ffffff",
			fillColorStart: "#ffffff",
			fillOpacity: 0,
			frameRate: undefined,
			loopDuration: undefined,
			noiseCenterVelocity: 0,
			noiseRadius: 0.25,
			noiseScale: 0.845,
			noiseType: {index:0,value:"radial"},
			numLoops: 1,
			numPointsEnd: 8,
			numPointsStart: 8,
			radiusEnd: 200,
			radiusStart: 200,
			randomScaleEnd: 0.5,
			randomScaleStart: 0.5,
			strokeColorEnd: "#000000",
			strokeColorStart: "#000000",
			strokeOpacity: 1,
			strokeThicknessEnd: 1,
			strokeThicknessStart: 1,
		},

	"red": {
			bgColor: "#FF0000",
			bgOpacity: 1,
			doLoopNoise: "false",
			doShowPoints: false,
			fillColorEnd: "#ffffff",
			fillColorStart: "#ffffff",
			fillOpacity: 0,
			frameRate: undefined,
			loopDuration: undefined,
			noiseCenterVelocity: 0,
			noiseRadius: 0.25,
			noiseScale: 0.845,
			noiseType: {index:0,value:"radial"},
			numLoops: 1,
			numPointsEnd: 8,
			numPointsStart: 8,
			radiusEnd: 200,
			radiusStart: 200,
			randomScaleEnd: 0.5,
			randomScaleStart: 0.5,
			strokeColorEnd: "#FF0000",
			strokeColorStart: "#000000",
			strokeOpacity: 1,
			strokeThicknessEnd: 1,
			strokeThicknessStart: 1,
		},

	"ooh aah":	{"doShowPoints":false,"bgColor":"#ff2929","bgOpacity":0.27,"strokeColorStart":"#ff7575","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":1,"strokeThicknessEnd":1,"fillColorStart":"#ffffff","fillColorEnd":"#454545","fillOpacity":0,"radiusStart":73,"radiusEnd":421,"numLoops":43,"numPointsStart":15,"numPointsEnd":8,"doLoopNoise":false,"noiseType":"radial","randomScaleStart":0.15,"randomScaleEnd":1,"noiseRadius":0.67,"noiseScale":0.259,"noiseCenterVelocity":0.642},
}

}