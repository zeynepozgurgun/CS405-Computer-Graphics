/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		this.showTex2Loc = gl.getUniformLocation(this.prog, 'showTex2');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');


		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */ //DONE
		 
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLightLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.vertNormalLoc = gl.getAttribLocation(this.prog, 'normal');
    	this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');

		this.specularLightLoc = gl.getUniformLocation(this.prog, 'specular');
    	this.viewPosLoc = gl.getUniformLocation(this.prog, 'viewPos');
		this.texOpacityLoc = gl.getUniformLocation(this.prog, 'texOpacity');

		//this.diffuseLightLoc = gl.getUniformLocation(this.prog, 'diffuseLight');
		this.normalbuffer = gl.createBuffer(); 
		
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW); 
		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */ //DONE?
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */ //DONE

		///////////////////////////////
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.enableVertexAttribArray(this.vertNormalLoc);
		gl.vertexAttribPointer(this.vertNormalLoc, 3, gl.FLOAT, false, 0, 0);
	
		//pass to the shader
		const lightPos = [-lightX, -lightY, 0.0];
		gl.uniform3fv(this.lightPosLoc, lightPos); // light position
		const viewPos = [0, 0, 1.0]; //for specular
    	gl.uniform3fv(this.viewPosLoc, viewPos);

		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);


	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img, texture_num = gl.TEXTURE0, tex_name = 'tex') {
		const texture = gl.createTexture();
		gl.activeTexture(texture_num); 
		gl.bindTexture(gl.TEXTURE_2D, texture);
	
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);
	
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else { //non powerof2 images
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		gl.useProgram(this.prog);
		const sampler = gl.getUniformLocation(this.prog, tex_name);
		const unitIndex = texture_num - gl.TEXTURE0; 
		gl.uniform1i(sampler, unitIndex); 
	}
	

	enableLighting(show) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */ //DONE
		 
		gl.useProgram(this.prog);
		this.setAmbientLight(0.5);
		this.setSpecularLight(5.0);
    	gl.uniform1i(this.enableLightingLoc, show ? 1 : 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
		gl.uniform1f(this.texOpacityLoc, 0.5);
		
	}

	setTextureOpacity(opacity) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.texOpacityLoc, opacity / 100);
	}

	setAmbientLight(ambient) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */ //DONE
		 
		gl.useProgram(this.prog); 
    	gl.uniform1f(this.ambientLightLoc, ambient); 
	}
	setSpecularLight(specparam) {
		gl.useProgram(this.prog);
		gl.uniform1f(this.specularLightLoc, specparam);
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 
			varying vec3 v_fragPos;

			void main()
			{
				v_texCoord = texCoord;
				v_normal = mat3(mvp) * normal;
				v_fragPos = pos;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex;
			uniform sampler2D tex2;
			

			uniform vec3 color; 
			uniform vec3 lightPos;
			uniform float ambient;

			uniform float specular;  
			uniform vec3 viewPos; 
			uniform float texOpacity;   

			varying vec2 v_texCoord;
			varying vec3 v_normal;
			varying vec3 v_fragPos; 


			void main()
			{
				if(showTex && enableLighting){
					vec3 color = vec3 (1.0, 1.0, 1.0); 
					vec3 normal = normalize(v_normal); //normalization of normal vec.
					vec3 light_dir = normalize(lightPos);
					
					vec3 ambientLight = ambient * color;
					float diffuseFactor = max(dot(normal, light_dir), 0.0);
					vec3 diffuseLight = diffuseFactor * color;
					
					vec3 view_dir = normalize(viewPos);
        			vec3 reflect_dir = reflect(light_dir, normal);
					
					float spec = 0.0;
					if (diffuseFactor > 0.0) {
						spec = pow(max(dot(view_dir, reflect_dir), 0.0), specular); 
					}
					vec3 specularLight = spec * color;

					vec3 lighting = ambientLight + diffuseLight + specularLight;

					vec4 textureColor = texture2D(tex, v_texCoord);
					vec4 textureColor2 = texture2D(tex2, v_texCoord); //second texture for task2

					vec3 blendedColor = mix(textureColor.rgb, textureColor2.rgb, texOpacity);
        			gl_FragColor = vec4(blendedColor * lighting, textureColor.a);
				
				}
				else if(showTex){
					vec4 textureColor = texture2D(tex, v_texCoord);   //First texture
					vec4 textureColor2 = texture2D(tex2, v_texCoord); // Second texture
					gl_FragColor = mix(textureColor, textureColor2, texOpacity);
				}
				else{
					gl_FragColor =  vec4(1.0, 0, 0, 1.0);
				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////