//MAIN FILE OF THE LIBRARY

/**
 * What-ever-this-is's WebGL Library
 * 
 * Created by Che Yu.
 */
//-----------MISC-----------
//#region 
/**
 * Some random code
 */
const glLibrary = {
    rgba2rgb:function(r,g,b,a){
        return [r*this.oneOver255,g*this.oneOver255,b*this.oneOver255,a]
    },
    hex2rgb:function(hex,stringify){
        hex = hex.shift();
        newcolor = [0,0,0,1.0];
        newcolor[0] = parseInt(color.slice(0,2),16)*this.oneOver255;
        newcolor[1] = parseInt(color.slice(2,4),16)*this.oneOver255;
        newcolor[2] = parseInt(color.slice(4,6),16)*this.oneOver255;
        return stringify?newcolor.toString():newcolor;
    },
    oneOver255:(1/255)
}
//#endregion
//-----------RENDERER OBJECT-----------
//The object that the user will initiate at the start
//The user won't interact with this much
//#region 

class Renderer{
    //The actual rendering code, scene code will follow this.
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas,dontCullFace,dontUseDepthTest){
        //Initialization function
        this.canvas = canvas;
        this.gl = "a"=="b"?new WebGL2RenderingContext():canvas.getContext("webgl2")
        if(this.gl===null){
            console.warn("WebGL2 Not supported, falling back to WebGL1.\nSome features may break.");
            this.gl = canvas.getContext("webgl")
            if(this.gl===null){
                console.warn("WebGL1 Not supported, falling back to experimental WebGL.\nSome features may break. We recommend using an up-to-date browser.");
                this.gl = canvas.getcontext("experimental-webgl")
                //if(this.gl===null){
                //    throw new Error("WebGL at a whole is not supported. Please use a different browser.");
                //}
            }
        }
        if(!dontUseDepthTest){
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
        }
        if(!dontCullFace)
            this.gl.enable(this.gl.CULL_FACE);
        this.aspect = canvas.clientWidth/canvas.clientHeight;
        this.canvas.addEventListener("resize",function(){
            console.log("bruh")
            this.aspect = canvas.clientWidth/canvas.clientHeight;
        });
    }
    /**
     * 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     */
    clear(r,g,b,a){
        //Clear rendering surface
        this.gl.clearColor(r,g,b,a);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
    }
    /**
     * Draws a renderable data package.
     * @param {RenderablePackage} package 
     */
    drawPackage(renderPackage,renderType){
        var renderTypes = [this.gl.TRIANGLE_STRIP,this.gl.TRIANGLES,this.gl.POINTS]
        if(!renderType){
            renderType = this.gl.TRIANGLES;
        } else {
            renderType = renderTypes[renderType]
        }
        var buffers = renderPackage.bufferList;
        for(var i=0; i<buffers.length;i++){
            buffers[i].enableForProgram(renderPackage.program)
        }
        this.gl.useProgram(renderPackage.program);
        if(renderPackage.uniformList){
            var uniforms = renderPackage.uniformList
            for(var i=0; i<uniforms.length;i++){
                uniforms[i].enableForProgram(renderPackage.program)
            }
        }
        switch(renderPackage.renderType){
            case glDictionary.ELEMENTS:
                this.gl.drawElements(renderType,renderPackage.indexAmount,this.gl.UNSIGNED_SHORT,renderPackage.offset);
                break;
            case glDictionary.ARRAYS:
                this.gl.drawArrays(renderType,0,renderPackage.indexAmount)
                break;
        }
    }
}
//#endregion
//-----------SCENE-----------
//Scene code will be developed after basic rendering functions have been finished
//#region
//-----MAIN SCENE-----
//#region 
class Scene{
    /*
    Creates a new scene
    */
    constructor(renderer){
        this.renderer = renderer;
        this.camera = {
            position:[0,0,0],
            direction:[0,0,0],
            fovy:45,
            near:glMath.EPSILON,
            far:100,
        };
        this.objects = [];
    }
    moveCamera(vector){
        this.camera.position = vec3.add(this.camera.position,vector);
    }
    rotateCamera(vector){
        this.camera.direction = vec3.add(this.camera.direction,vector);
    }
    projectCamera(){
        var v = [0,0,1], vector=[0,1,0]
        var sin = Math.sin(glMath.toRadians(this.camera.direction[0])),cos= Math.cos(glMath.toRadians(this.camera.direction[0]))
        v[1] = v[1]*cos-v[2]*sin;
        v[2] = v[2]*cos+v[0]*sin;
        v[0] = v[2]*sin+v[0]*cos;
        vector[1] = vector[1]*cos-vector[2]*sin;
        vector[2] = vector[2]*cos+vector[0]*sin;
        vector[0] = vector[2]*sin+vector[0]*cos;
        var viewMatrix = new Mat4();
        viewMatrix.lookAt(this.camera.position,v,vector);
        var projectionMatrix = new Mat4();
        projectionMatrix.perspective(
            this.camera.fovy,
            this.renderer.aspect,
            this.camera.near,
            this.camera,far);
        return {
            viewMatrix:viewMatrix,
            projectionMatrix:projectionMatrix
        };
    }
    addObject(object){
        this.objects.push(object);
    }
    removeObject(object){
        this.objects.splice(this.objects.indexOf(object),1)
    }
    clear(){
        this.objects = [];
    }
    render(){
        var uniforms
        for(var i=0; i<this.objects.length; i++){
            
        }
    }
}
//#endregion
//-----SCENE OBJECTS-----
class Mesh{
    /**
     * A 3D Object made of several triangles
     */
    constructor(vertexData,indexData,material){
        this.vertexData = vertexData;
        this.indexData = indexData;
        this.material = material;
        this.visible = true;
        this.tags = undefined;
        this.transform = {
            position:[0,0,0],
            rotation:[0,0,0],
            scale:[1,1,1]
        }
    }
    addTag(tag){
        this.tags.push(tag);
    }
    removeTag(){
        this.tag = undefined;
    }
    package(renderer,viewMatrix,projectionMatrix){
        var compiledMaterial = material.build(renderer);
        var currentBuffers = [new PositionBuffer(renderer,this.vertexData,"vP"),new IndexBuffer(renderer,this.indexData)]
        var worldMatrix = new Mat4();
        worldMatrix.scale(this.transform.scale);
        worldMatrix.rotate(this.transform.rotation);
        worldMatrix.translate(this.transform.position)
        var currentUniforms = [
            worldMatrix.convertToUniform(renderer,"worldMatrix"),
            viewMatrix.convertToUniform(renderer,"viewMatrix")
        ]
        currentBuffers = compiledMaterial.buffers.concat(currentBuffers);
        currentUniforms = compiledMaterial.uniforms.concat(currentUniforms);
        var renderpackage = new RenderablePackage(compiledMaterial.program,glDictionary.TRIANGLES,currentBuffers,currentUniforms,0,true,this.indexData.length);
        return renderpackage;
    }
}
//#endregion
//-----------SHADERS-----------
//Part of the basic rendering code
//#region
//-----Vertex and fragment shaders
//#region 
class VertexShader{
    /**
     * 
     * @param {String} source 
     */
    constructor(source){
        this.source = source.replaceAll(/\n|\r|\t/gi," ");
        //this.usage = usage;
    }
    compile(renderer){
        const gl = renderer.gl
        const shader = gl.createShader(renderer.gl.VERTEX_SHADER);
        gl.shaderSource(shader,this.source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
            
            throw new Error(`An error occurred while compiling the vertex shader: ${gl.getShaderInfoLog(shader)}`);
            
        }
        return shader;
    }
}

class FragmentShader{
    /**
     * 
     * @param {String} source 
     */
    constructor(source){
        this.source = source.replaceAll(/\n|\r|\t/gi," ");
        //this.usage = usage;
    }
    compile(renderer){
        const gl = renderer.gl
        const shader = gl.createShader(renderer.gl.FRAGMENT_SHADER);
        gl.shaderSource(shader,this.source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
            throw new Error(`An error occurred while compiling the vertex shader: ${gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }
}
//#endregion
//-----Shader program-----
//#region 
class ShaderProgram{
    /**
     * 
     * @param {Renderer} renderer 
     * @param {VertexShader} vshader 
     * @param {FragmentShader} fshader 
     * @param {Boolean} validate
     * @returns 
     */
    constructor(renderer,vshader,fshader,validate){
        const gl = renderer.gl;
        const vertexShader = vshader.compile(renderer);
        const fragmentShader = fshader.compile(renderer);
        const program = gl.createProgram();
        gl.attachShader(program,vertexShader);
        gl.attachShader(program,fragmentShader);
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
            throw new Error(`An error occurred while validating the program: ${gl.getProgramInfoLog(program)}`);
        }
        if(validate){
            gl.validateProgram(program);
            if(!gl.getProgramParameter(program,gl.VALIDATE_STATUS)){
                throw new Error(`An error occurred while validating the program: ${gl.getProgramInfoLog(program)}`);
            }
        }
        this.program = program;
    }
}
//#endregion
//#endregion
//-----------BUFFERS AND UNIFORMS-----------
//Also part of the basic rendering code
//#region

//-----Buffers-----
//#region 
class Buffer{
    constructor(render,data,attribute,usage,type,programData,usageType,dataType){
        if(!usageType){
            usageType = render.gl.ARRAY_BUFFER
        }
        this.render = render;
        this.data = data;
        this.usage = usage;
        this.usageType = usageType;
        const gl = render.gl;
        const newBuffer = gl.createBuffer();
        gl.bindBuffer(usageType,newBuffer);
        gl.bufferData(usageType,dataType?new dataType(data):new Float32Array(data),usage?usage:gl.STATIC_DRAW);
        this.buffer = newBuffer;
        this.type = type;
        this.programData = programData;
        this.attribute = attribute;
    }
    /**
     * 
     * @param {ShaderProgram} program
     * 
     */
    enableForProgram(program){
        if(this.type == glDictionary.ATTRIBUTE){
            this.render.gl.bindBuffer(this.usageType,this.buffer);
            this.render.gl.vertexAttribPointer(
                this.render.gl.getAttribLocation(program,this.attribute),
                this.programData[0],
                this.programData[1],
                this.programData[2],
                this.programData[3],
                this.programData[4],
            )
            this.render.gl.enableVertexAttribArray(this.render.gl.getAttribLocation(program,this.attribute));
        } else if(this.type == glDictionary.NONATTRIBUTE){
            this.render.gl.bindBuffer(this.usageType,this.buffer)
        }
    }
}
class PositionBuffer extends Buffer{
    constructor(render,data,attribute){
        super(render,data,attribute,null,glDictionary.ATTRIBUTE,[
            3,
            render.gl.FLOAT,
            render.gl.FALSE,
            3*Float32Array.BYTES_PER_ELEMENT,
            0
        ],render.gl.ARRAY_BUFFER);
    }
}
class IndexBuffer extends Buffer{
    constructor(render,data){
        super(render,data,"",null,glDictionary.NONATTRIBUTE,[],render.gl.ELEMENT_ARRAY_BUFFER,Uint16Array);
    }
}
//#endregion
//-----Uniforms-----
//#region 
//Apparently, uniforms aren't buffers so I have to include them here.
//Later I found out that there are multiple types of uniforms so I'm glad I named them like this
class UniformMAT4Matrix{
    constructor(render,matrix,attribute){
        this.matrix = matrix;
        this.attribute = attribute;
        this.render = render;
    }
    enableForProgram(program){
        this.render.gl.uniformMatrix4fv(this.render.gl.getUniformLocation(program,this.attribute),
        this.render.gl.FALSE,
        this.matrix)
    }
}
//This part is also useless but kinda useful...
//#endregion
//#endregion
//-----------PACKAGES-----------
//Just compacts everything together for renderer to process.
//#region 
class RenderablePackage{
    /**
     * 
     * @param {ShaderProgram} shaderProgram The shader program
     * @param {Array} bufferList Buffers
     * @param {Number} renderType The type to draw from, e.g. TRIANGLES
     * @param {Array} uniformList Uniforms
     * @param {Number} offset Offset
     * @param {Boolean} usesIndexBuffer Uses index buffer?
     * @param {Number} numElements Number of elements
     */
    constructor(shaderProgram,renderType,bufferList,uniformList,offset,usesIndexBuffer,numElements){
        this.shaderProgram = shaderProgram;
        this.program = shaderProgram.program;
        this.bufferList = bufferList;
        this.uniformList = uniformList;
        this.renderType = renderType;
        this.offset = offset;
        this.usesIndexBuffer = usesIndexBuffer;
        this.indexAmount = numElements;
    }
}
//#endregion
//-----------MATERIALS-----------
//Materials for easier use of the library
//#region 
class SingleColorMaterial{
    /**
     * A single colored material for all of
     * @param {String} color 
     */
    constructor(color){
        if(color.startsWith("#")){
            color = glLibrary.hex2rgb(color,true);
        }
        this.vertexShader = new VertexShader(`
precision mediump float;
attribute vec3 vP;
uniform mat4 wM;
uniform mat4 vM;
uniform mat4 pM;
void main(void){
    gl_Position = pM*vM*wM*vec4(vP,1.0);
}
`);

        this.fragmentShader = new FragmentShader(`
precision mediump float;
void main(void){
    gl_FragColor = vec4(${color});
}
`);
    }
    build(render){
        var program = new ShaderProgram(render,this.vertexShader,this.fragmentShader);
        return {
            program:program,
            buffers:[],
            uniforms:[]
        }
    }
}
class MultiColorMaterial{
    /**
     * A material to color each vertex of an object with a certain color. More formats will be supported in Milestone 2
     * @param {Array} colors 
     */
    constructor(colors){
        this.vertexShader = new VertexShader(`
precision mediump float;
attribute vec3 vP;
attribute vec4 vC;
uniform mat4 wM;
uniform mat4 vM;
uniform mat4 pM;
varying vec4 fC;
void main(void){
    gl_Position = pM*vM*wM*vec4(vP,1.0);
    fC = vC;
}
`);
        this.fragmentShader = new FragmentShader(`
precision mediump float;
varying vec4 fC;
void main(void){
    gl_FragColor = fC;
}
`);
        this.colors = colors;
    }
    /**
     * 
     * @param {Renderer} render 
     */
    build(render){
        var program = new ShaderProgram(render,this.vertexShader,this.fragmentShader);
        var colorBufferData = [];
        for(var i=0; i<this.colors.length; i++){
            if(this.colors[i].startsWith("#")){
                this.colors[i] = glLibrary.hex2rgb(this.colors[i]);
            }
            colorBufferData.push(...this.colors[i])
        }
        var colorBuffer = new Buffer(render,colorBufferData,"vertColor",null,glDictionary.ATTRIBUTE,[
            3,
            render.gl.FLOAT,
            render.gl.FALSE,
            3*Float32Array.BYTES_PER_ELEMENT,
            0
        ],);
        return {
            program:program,
            buffers:[colorBuffer],
            uniforms:[]
        }
    }
}
//#endregion