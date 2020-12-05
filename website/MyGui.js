
class MyGUI {
	constructor(params,v) { //create gui system bound to set of variables v
		this.controls={};

		var i=0;
		for(const paramTitle in params){
			this.controls[paramTitle]=QuickSettings.create(210*i, 0, params[paramTitle].displayName); 
			i++;
		}

		for(const control in this.controls){
			this.populateGUI(this.controls[control],params[control],v);
		}

		this.setValuesFromGUI(v);

		this.isVisible=true;
	}


	populateGUI(guiObject,p,v){
		//print("populateGUI:  " + JSON.stringify(p));
		for(const variable in p){
			if(p[variable].type!= null){
				p[variable].title=variable; //add title field w/ name of class
				this.makeGUIElement(guiObject,p[variable],v);
			}
		}
	}

	makeGUIElement(guiObject,p,v){
		//print("makeGUIElement:  " + JSON.stringify(p));

		var setting = p.default;
		if(v[p.title]!=null){
			setting=v[p.title];
		} 
		print(setting);
		switch(p.type){
			case 'number':
				guiObject.bindRange(p.title, p.min, p.max, setting, p.step, v);
				break;
			
			case 'color':
				guiObject.bindColor(p.title,setting, v);
				break;
	
			case 'boolean':
				guiObject.bindBoolean(p.title,setting,v);
				break;
	
			case 'dropdown':
				guiObject.bindDropDown(p.title,p.options,v);
				break;
		}
	}

	setGUIFromValues(json){
		for(const key in this.controls){
			this.controls[key].setValuesFromJSON(json);
		}
	}

	setValuesFromGUI(v){ //put values into v
		for(const control in this.controls){
			var json = JSON.parse(JSON.stringify(this.controls[control].getValuesAsJSON()));
			for(const variable in json){
				v[variable]=json[variable];
			}
		}
	}

	addWindow(title){
		this.controls[title]=QuickSettings.create(0, 0, title);
	}
}

function makeJSONField(GUI,title){
	if(GUI.controls[title]==null){
		GUI.addWindow(title);
	}
	//print(this.controls[control]);
	
	GUI.controls[title].addButton("generate JSON", function() {
		var output={};
		GUI.setValuesFromGUI(output);
		delete output["JSON"]; 
		delete output["preset:"];
		GUI.controls[title].setValue("JSON",JSON.stringify(output));
	});
	GUI.controls[title].addButton("set JSON", function() {
		var input = JSON.parse(GUI.controls[title].getValue("JSON"));
		GUI.setGUIFromValues(input);
	});
	GUI.controls[title].addTextArea("JSON","");
	
}



function makePresetField(GUI,title,presets){
	if(GUI.controls[title]==null){
		GUI.addWindow(title);
	}
	
	var presetList=Object.keys(presets);
	//presetList.splice(0, 0, " "); //add a "blank preset" option
	GUI.controls[title].addDropDown("preset:",presetList);
	GUI.controls[title].addButton("Apply", function() {
		//print(presets[GUI.controls[title].getValue("preset:").value]);
		GUI.setGUIFromValues(presets[GUI.controls[title].getValue("preset:").value]);
	});
	
	
}

	// addGUI(name,GUI){
	// 	this.GUIs[name]=GUI;
	// }

	// toggleVisibility(){
	// 	const keys = Object.keys(this.GUIs)
	// 	if(isVisible){
	// 		for(const key of keys){
	// 			this.GUIs[key].hide();
	// 			isVisible=false;
	// 		}
	// 	}
	// 	else{
	// 		for(const key of keys){
	// 			this.GUIs[key].show();
	// 			isVisible=true;
	// 		}
	// 	}
	// }

	
	// getJSON(){
	// 	return JSON.stringify(this.getValuesObject());
	// }



//in object of objects, adds title of the key of each object
function makeTitles(params){
	const keys = Object.keys(params)
	for (const key of keys) {
		params[key].title=key;
	}
	return params;
}

//sets object, with variable names given by parameters, and values set to default
function getDefault(params){
	var v={};

	v={};
	for(const param_type in params){
		for(const key in params[param_type]){
			if(params[param_type][key].default!=null){ //only add when defined
				v[key]=params[param_type][key].default;
			}
		}
	}
	return v;
}

// function defineAllVariables(sketch,paramList){
// 	var v={};
// 	for(const param of paramList){
// 		Object.assign(v,param);
// 	}
// 	return v;
// }




//need 'type' parameter







function colorFromArray(sketch,values){
	var c = sketch.color(values[0], values[1], values[2]);
	// get decimal RGB values
	var c2 = c.levels.slice(0,3);
	// create HTML color code
	var vcolor = '#' + c2.map(function(value) {
		return ('0' + value.toString(16)).slice(-2);
	}).join('');

	return vcolor;
}

function colorToArray(hex){
	return [parseInt("0x"+hex.slice(1,3)),parseInt("0x"+hex.slice(3,5)),parseInt("0x"+hex.slice(5,7))];
}






// class MyGUI {
// 	constructor(GUIs) {
// 		this.GUIs=GUIs;
// 		this.isVisible=true;
// 	}

// 	setGUIFromJSON(json){
// 		const keys = Object.keys(this.GUIs)
// 		for(const key of keys){
// 			//var newJSON=JSON.parse(json);
// 			// print(key);
// 			// print(this.GUIs[key]);
// 			this.GUIs[key].setValuesFromJSON(json);
// 		}
// 		// for(const GUI of this.GUIs ){
// 		// 	GUI.setValuesFromJSON(json);
// 		// }
// 	}

// 	addGUI(name,GUI){
// 		this.GUIs[name]=GUI;
// 	}

// 	toggleVisibility(){
// 		const keys = Object.keys(this.GUIs)
// 		if(isVisible){
// 			for(const key of keys){
// 				this.GUIs[key].hide();
// 				isVisible=false;
// 			}
// 		}
// 		else{
// 			for(const key of keys){
// 				this.GUIs[key].show();
// 				isVisible=true;
// 			}
// 		}
// 	}

// 	getValuesObject(){
// 		v={};
// 		const keys = Object.keys(this.GUIs)
// 		for(const key of keys){
// 			Object.assign(v,this.GUIs[key].getValuesAsJSON());
// 		}
// 		v.preset=0;
// 		print(v);
// 		return v;
// 	}

// 	getJSON(){
// 		return JSON.stringify(this.getValuesObject());
// 	}
// }





// //in object of objects, adds title of the key of each object
// function makeTitles(params){
// 	const keys = Object.keys(params)
// 	for (const key of keys) {
// 		params[key].title=key;
// 	}
// 	return params;
// }

// //sets object, with variable names given by parameters, and values set to default
// function getDefault(sketch,params){
// 	var v={};

// 	const keys = Object.keys(params)
// 	for (const key of keys) {
// 		v[key]=params[key].default;

// 		switch(params[key].type){
			
// 			case 'color':
// 				//print("color");
// 				// create color according to the current color mode of the current sketch
// 				v[key] = colorFromArray(sketch,v[key]);
// 				//print(v[key]);
// 				break;
				
// 		}
// 	}
// 	return v;
// }

// // function defineAllVariables(sketch,paramList){
// // 	var v={};
// // 	for(const param of paramList){
// // 		Object.assign(v,param);
// // 	}
// // 	return v;
// // }


// function makeGui(sketch,guiObject,params,variables){
// 	const keys = Object.keys(params)
// 	for (const key of keys) {
// 		makeGUIElement(sketch,guiObject,params[key],variables);
// 	}
// }

// //need 'type' parameter
// function makeGUIElement(sketch,guiObject,p,variables){

// 	switch(p.type){
		
// 		case 'number':
// 			guiObject.bindRange(p.title, p.min, p.max, v[p.title], p.step, variables);
// 			break;
		
// 		case 'color':
// 			var vcolor = v[p.title];
// 			// create color according to the current color mode of the current sketch
// 			//var vcolor = colorFromArray(sketch,values);
// 			guiObject.bindColor(p.title,vcolor, variables);
// 			break;

// 		case 'boolean':
// 			guiObject.bindBoolean(p.title,v[p.title],variables);
// 			break;

// 		case 'dropdown':
// 			//print("miGuis line 127)"); print(p.title);
// 			guiObject.bindDropDown(p.title,p.options,variables);
// 			break;

// 	}
// }


