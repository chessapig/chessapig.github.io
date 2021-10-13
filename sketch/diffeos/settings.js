//earlier defined parameters overwritten by later ones

var json = {




params: {
	master: {
		displayName: "Master",
	  },

	  style: {
		displayName: "Style Controls",

		blendMode: {
			type: 		"dropdown",
			options:	["normal","difference","lighter","multiply","screen","hard light", "color burn","color dodge","overlay"],
			default: 	{index:0,value:"source-over"},
			lookup: {
				"normal":"source-over",
				//"remove":"destination-out",
				"hard light":"hard-light",
				"color burn":"color-burn",
				"color dodge":"color-dodge"
			}
		},

		doShowPoints: {
			type: 		"boolean",
			default: 	false,	
		},
	
		bgColor: {
			type: 		"color",
			default: 	[21, 8, 50],
			doHide: 	0
		},
	
		bgOpacity: {
			type: 		"number",
			default: 	1,
			min: 		0,
			max: 		1,
			step: 		.001,
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5,
			doHide: 	0	
		},
	  
		strokeColorStart: {
			type: 		"color",
			default: 	[255,117,117],
			doHide: 	1
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
			step: 		.001,	
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5
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
			step: 		.001,	
			interpolateType: 'exp',
			minValue:0, 
			maxValue:2.5,
		},
	},


	ani: {
		displayName: "Animation controls",
		loopDuration: 1,
		frameRate: 60,
	  
		numPoints: {
			type: 		"number",
			default: 	8,
			min: 		3,
			max: 		20,
			step: 		1	
		},  
	},

	noise: {
		displayName: "Noise Controls",
		randomScale2D : 100,
	
		noiseType: {
			type: 		"dropdown",
			options:	["radial","2D","none"],
			default: 	{index:0,value:"radial"},
		},
		
		doStayPut: {
			type: 		"boolean",
			default: 	"true"	
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
			interpolateType: 'exp',
			minValue:0, 
			maxValue:0
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
			minValue:-3, 
			maxValue:-1
		},  
	},
},

presets: {
	// "default": {
	// 		bgColor: "#c8c8c8",
	// 		bgOpacity: 1,
	// 		doLoopNoise: "false",
	// 		doShowPoints: false,
	// 		fillColorEnd: "#ffffff",
	// 		fillColorStart: "#ffffff",
	// 		fillOpacity: 0,
	// 		frameRate: undefined,
	// 		loopDuration: undefined,
	// 		noiseCenterVelocity: 0,
	// 		noiseRadius: 0.25,
	// 		noiseScale: 0.845,
	// 		noiseType: {index:0,value:"radial"},
	// 		numLoops: 1,
	// 		numPointsEnd: 8,
	// 		numPointsStart: 8,
	// 		radiusEnd: 200,
	// 		radiusStart: 200,
	// 		randomScaleEnd: 0.5,
	// 		randomScaleStart: 0.5,
	// 		strokeColorEnd: "#000000",
	// 		strokeColorStart: "#000000",
	// 		strokeOpacity: 1,
	// 		strokeThicknessEnd: 1,
	// 		strokeThicknessStart: 1,
	// 	},
}

}