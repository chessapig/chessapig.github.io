//earlier defined parameters overwritten by later ones

var json = {




params: {
	master: {
		displayName: "Master",
	  },


	style: {
		displayName: "Style Controls",
	
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
			step: 		0.1,
		},
	
		strokeThicknessEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		20,
			step: 		0.1	
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
		displayName: "Animation controls",
		loopDuration: 5,
		frameRate: 60,
	  
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
		displayName: "Noise Controls",
	
		noiseType: {
			type: 		"dropdown",
			options:	["radial","none"],
			default: 	{index:0,value:"radial"},
			index:0,
		},
		
		randomScaleStart: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		0.001	
		},
	
		randomScaleEnd: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		0.001	
		}, 
	
		noiseRadius: {
			type: 		"number",
			default: 	0.2,
			min: 		0,
			max: 		1,
			step: 		.001	
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
	
		doMoveNoise: {
			type: 		"boolean",
			default: 	"false"	
		},

		noiseCenterVelocity: {
			type: 		"number",
			default: 	.2,
			min: 		0,
			max: 		1,
			step: 		.001,	
			interpolateType: 'exp',
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

	"Moir‌é": {"doShowPoints":false,"bgColor":"#c2bce7","bgOpacity":1,"strokeColorStart":"#ff0000","strokeColorEnd":"#2c302c","strokeOpacity":1,"strokeThicknessStart":0.6,"strokeThicknessEnd":1.4,"fillColorStart":"#000000","fillColorEnd":"#000000","fillOpacity":0,"radiusStart":0,"radiusEnd":147,"numLoops":100,"numPointsStart":19,"numPointsEnd":19,"noiseType":{"index":0,"label":"radial","value":"radial"},"randomScaleStart":1.26,"randomScaleEnd":0,"noiseRadius":0.48,"noiseScale":0,"doMoveNoise":true,"noiseCenterVelocity":0.129},

	"sunquake":	{"doShowPoints":false,"bgColor":"#000000","bgOpacity":0.339,"strokeColorStart":"#d6eef0","strokeColorEnd":"#dcd138","strokeOpacity":1,"strokeThicknessStart":1,"strokeThicknessEnd":0,"fillColorStart":"#000000","fillColorEnd":"#000000","fillOpacity":0,"radiusStart":0,"radiusEnd":200,"numLoops":100,"numPointsStart":8,"numPointsEnd":8,"noiseType":{"index":0,"label":"radial","value":"radial"},"doLoopNoise":false,"randomScaleStart":2,"randomScaleEnd":0.09,"noiseRadius":0.18,"noiseScale":1,"noiseCenterVelocity":0.08},

	"amoeba": {"doShowPoints":false,"bgColor":"#1c1212","bgOpacity":1,"strokeColorStart":"#50663d","strokeColorEnd":"#000000","strokeOpacity":1,"strokeThicknessStart":20,"strokeThicknessEnd":0,"fillColorStart":"#0e4e1e","fillColorEnd":"#1e0a3e","fillOpacity":1,"radiusStart":337,"radiusEnd":0,"numLoops":16,"numPointsStart":20,"numPointsEnd":3,"noiseType":{"index":0,"label":"radial","value":"radial"},"doLoopNoise":true,"randomScaleStart":2,"randomScaleEnd":2,"noiseRadius":0.77,"noiseScale":1,"noiseCenterVelocity":0.093},
}

}