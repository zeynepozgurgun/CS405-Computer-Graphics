function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([    
        0.17677669, -0.28661165,  0.36959946,  0.3,
        0.3061862,   0.36959946,  0.14016502, -0.25,
        -0.70710677,  0.35355338,  0.6123724,   0.0,
        0.0,         0.0,         0.0,         1.0 
    ]);
    
    
    return getTransposeMatrix(transformationMatrix);
    //return transformationMatrix;
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {

    let modelViewMatrix = createIdentityMatrix();

    modelViewMatrix =  multiplyMatrices(createScaleMatrix(0.5, 0.5, 1),  modelViewMatrix);

    modelViewMatrix =  multiplyMatrices( createRotationMatrix_X(0.5235987756),  modelViewMatrix);
    modelViewMatrix =  multiplyMatrices( createRotationMatrix_Y(0.7853981634),  modelViewMatrix);
    modelViewMatrix =  multiplyMatrices( createRotationMatrix_Z(1.0471975512),  modelViewMatrix);

    modelViewMatrix = multiplyMatrices(createTranslationMatrix(0.3, -0.25, 0),  modelViewMatrix);
    

    console.log("ModelViewMatrix: ", modelViewMatrix);

    return modelViewMatrix;
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    // this metdo should return the model view matrix at the given time
    // to get a smooth animation
    const duration = 10; // total duration of the animation in seconds
    const targetMatrix = getModelViewMatrix(); // Get the target transformation matrix
    const initialMatrix = createIdentityMatrix(); // The initial position is the identity matrix

    // Calculate the elapsed time since the animation started
    const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds

    // Use modulo to create an infinite loop of the animation
    const timeInCycle = elapsedTime % duration;

    let progress;
    
    if (timeInCycle < 5) {
        // First half: Transition to the target position
        progress = timeInCycle / 5; // Scale progress from 0 to 1 over 5 seconds
    } else {
        // Second half: Transition back to the initial position
        progress = 1 - ((timeInCycle - 5) / 5); // Scale progress from 1 to 0 over 5 seconds
    }

    // Interpolate between the initial matrix and the target matrix
    const interpolatedMatrix = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        interpolatedMatrix[i] = initialMatrix[i] + progress * (targetMatrix[i] - initialMatrix[i]);
    }

    return interpolatedMatrix;
}



