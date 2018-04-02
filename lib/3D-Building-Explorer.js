import * as THREE from 'three'; // TODO: only import the part of the lib we need ex. import { Scene } from 'three'; .. should speed up load by reducing the bundeled js size.
//const OrbitControls = require('three-orbit-controls')(THREE);
//const ColladaLoader = require('three-collada-loader');
//import { TweenLite } from 'gsap';

export default function (config) {
//export default (config) => {
  console.log("THREE: ", THREE);
  console.log("3D BUILDING EXPLORER!!!");
  // TODO: default config
  //
  //if no config use default config
  var renderContainer = document.getElementById(config.el);
  //var devMode = getSetting('flymode'); // setting this to true enables orbit controlls
  // define global varables
  var views, camera, scene, renderer, orbit, meshesByMaterial, lightsByMaterial, rooms, meshes;
  // define base materials
  //TODO: get material configs
  //let matConfigs = getSetting('materials');
  //let materials = matConfigs.reduce(function (obj, config) {
  //obj[config.name] = new THREE.MeshPhongMaterial({ color: config.color, name: config.name });
  //return obj;
  //}, {});

    // util
    //var _flattenThreeObj = function (threeobj) {
        //return {
            //px: threeobj.position.x,
            //py: threeobj.position.y,
            //pz: threeobj.position.z,
            //qw: threeobj.quaternion._w,
            //qx: threeobj.quaternion._x,
            //qy: threeobj.quaternion._y,
            //qz: threeobj.quaternion._z,
            //sx: threeobj.scale.x,
            //sy: threeobj.scale.y,
            //sz: threeobj.scale.z
        //};
    //};

    //// initlize everything as in load the 3d modeles prepare the scene then start the animation loop
    //init().then(function (x) {
        //animate();
        //// TODO: bring spinner in house as to not rely on other things
        ////let spinnerEl = renderContainer.querySelector('.spinner');
        ////spinnerEl.parentNode.removeChild(spinnerEl);
    //});

    //function init () {
        //return new Promise((resolve, reject) => {
            //// view setup
            //views = [
                //{
                    //left: 0,
                    //top: 0,
                    //width: 1.0,
                    //height: 1.0,
                    //layer: 0
                //},
                //{
                    //left: 0,
                    //top: 0,
                    //width: 1.0,
                    //height: 1.0,
                    //layer: 2,
                //}
            //];
            //console.log({"views": views});
            //// camera setup
            //views.map(function (view) {
                //let initCamSettings = getSetting('inital-camera');
                //let camera = new THREE.PerspectiveCamera(70, 2/1.75, 10, 10000);
                //camera.layers.disable(0);
                //camera.layers.enable(view.layer);
                //camera.position.set(initCamSettings.px, initCamSettings.py, initCamSettings.pz); // xyz
                //camera.quaternion.set(initCamSettings.qx, initCamSettings.qy, initCamSettings.qz, initCamSettings.qw); // xyzw
                //camera.updateProjectionMatrix();
                //view.camera = camera;
            //});

            ////camera.fov = 90;
            //// orbit setup
            //if (devMode) orbit = new OrbitControls(views[0].camera);
            //// camera pos tool
            //document.addEventListener('keydown', (e) => {
                //console.log({key: e.key});
                //if (e.key === 'm') {
                    //console.log(JSON.stringify(_flattenThreeObj(views[0].camera)));
                //}
            //});

            //// scene setup
            //scene = new THREE.Scene();

            //// global lights - these are not assocated with any paticular location
            //let light = new THREE.AmbientLight(0x404040); // soft white light
            //scene.add(light);
            //let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            ////TODO: pull directional light info from global state object
            //directionalLight.position.set(0, 50, 0);
            //directionalLight.target.position.set(10, 10, -90);
            //// directionalLight Tool
            //// document.querySelector('body').addEventListener('keydown', function (e) {
            ////   if (e.key === 'ArrowRight') directionalLight.target.position.x += 10;
            ////   if (e.key === 'ArrowLeft') directionalLight.target.position.x -= 10;
            ////   if (e.key === 'ArrowUp') directionalLight.target.position.y += 10;
            ////   if (e.key === 'ArrowDown') directionalLight.target.position.y -= 10;
            ////   if (e.key === '=') directionalLight.target.position.z += 10;
            ////   if (e.key === '-') directionalLight.target.position.z -= 10;
            ////   console.log({directionalLightTargetPOS: directionalLight.target.position});
            //// });
            //scene.add(directionalLight.target);
            //scene.add(directionalLight);

            //// click through navigation
            //let locSettings = getSetting('camera-locations') ? getSetting('camera-locations') : [];
            //// iterate over the nav links and set up there click actions like camera, color, and light tweens
            //locSettings.map((config, i) => {
                //let linkElm = document.querySelector(config.sel);
                //if(!linkElm) return false;

                //linkElm.addEventListener('click', (e) => {
                    //console.log({"config": config});
                    //meshes.map(function (mesh) {
                        ////mesh.material.opacity = .5;
                        ////mesh.material = new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true });
                        ////mesh.material =  new THREE.MeshPhongMaterial({ color: 'red', opacity: .5 });
                        ////mesh.material.opacity = .75;
                        ////mesh.material.transparent = true;
                    //});
                    //rooms.map(room => {
                        //room.children.map(function (threeObj) {
                            //if(threeObj.type === "Object3D") threeObj = threeObj.children[0];
                            //threeObj.layers.set(3);
                        //});
                        //if(config.hasOwnProperty('room_name') && room.name === config.room_name) {
                            //room.children.map(function (threeObj) {
                                //if(threeObj.type === "Object3D") threeObj = threeObj.children[0];
                                //threeObj.layers.set(2);
                            //});
                        //}
                    //});
                    /**
                    * Tweens the camera into place based on goalTransform pram
                    * @param {obj} goalTransform ex: {"px":807.8943218414179,"py":520.3328393399023,"pz":-799.3262672698474,"qw":0.7815924058567101,"qx":-0.24803634983789802,"qy":0.5455440573410596,"qz":0.17312701050404108,"sx":1,"sy":1,"sz":1}
                    * @pram {THREE.camera} camera you want to tween
                    */
                    //var tweenCamTo = function (goalTransform, cam) {
                        //return new Promise(function (resolve, reject) {
                            //let gt = Object.assign({}, goalTransform);
                            //const currentCameraVals = _flattenThreeObj(cam);
                            //var vals = Object.assign({}, currentCameraVals); // clone obj to make sure we are not working with refs
                            //let updateCam = function () {
                                //cam.position.set(vals.px, vals.py, vals.pz);
                                //cam.quaternion.set(vals.qx, vals.qy, vals.qz, vals.qw);
                                //cam.scale.set(vals.sx, vals.sy, vals.sz);
                                //cam.updateMatrix();
                            //};
                            //gt.onUpdate = updateCam;
                            //gt.onComplete = function () {
                                //resolve();
                            //};
                            //TweenLite.to(vals, 1, gt);
                        //});
                    //};
                    //tweenCamTo(config.transform, views[0].camera);
                    //tweenCamTo(config.transform, views[1].camera);
                //});
            //});
            //// sketchup import
            //var loader = new ColladaLoader();
            //loader.load('./models/building.dae', function (result) {
                //// import matrix fixes
                //result.scene.applyMatrix(result.scene.matrix.identity());
                //result.scene.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
                //result.scene.updateMatrix();
                //result.scene.updateMatrixWorld();
                ////console.log({ result: result });
                //// Grab all the meshes from the scene
                //meshes = result.scene.children.reduce(function sceneToMeshArray(arr, currentItem) {
                    //if (currentItem.type === 'Mesh') arr.push(currentItem);
                    //else if (currentItem.type === 'Object3D') arr = currentItem.children.reduce(sceneToMeshArray, arr);
                    //return arr;
                //}, []);
                ////console.log({"meshes": meshes});
                //// Put meshes into arrayes by material for orginization as material is only way we have to seprate them in sketchup
                //meshesByMaterial = meshes.reduce(function (obj, mesh) {
                    //if (typeof obj[mesh.material.name] === 'undefined') obj[mesh.material.name] = [];
                    //obj[mesh.material.name].push(mesh);
                    //return obj;
                //}, {});
                //// set all to base mat
                //console.log({"meshesByMaterial": meshesByMaterial});
                //for (let key in meshesByMaterial) {
                    //if(materials.hasOwnProperty(key)){
                        //meshesByMaterial[key].map(function (mesh) {
                            //mesh.material = materials[key];
                        //});
                    //} else {
                        //meshesByMaterial[key].map(function (mesh) {
                            //mesh.material = new THREE.MeshPhongMaterial({ color: '#ff00fe', name: 'default' });
                        //});
                    //}
                //}
                //rooms = result.scene.children.reduce(function getRooms (arr, obj) {
                    //if(/^room_/.test(obj.name)) arr.push(obj);
                    //if (obj.type === 'Object3D') arr = obj.children.reduce(getRooms, arr);
                    //return arr;
                //}, [] );
                //// initlize rooms
                //rooms.map(function (room) {
                    //room.children.map(function (threeObj) {
                        //if(threeObj.type === "Object3D") {
                            //threeObj = threeObj.children[0];
                            //threeObj.material = new THREE.MeshBasicMaterial({ name: 'room_mat', color: '#FEECCC', opacity: 0.5 });
                            //threeObj.material.transparent = true;
                            //threeObj.layers.set(3);
                        //} else {
                            //threeObj.material = new THREE.MeshBasicMaterial({ name: 'room_mat', color: '#E3C495', opacity: 0.5 });
                            //threeObj.material.transparent = true;
                            //threeObj.layers.set(3);
                        //}
                    //});
                //});
                //console.log({"rooms": rooms});

                //scene.add(result.scene);
                //resolve(); // fulfilled
            //});

            //renderer = new THREE.WebGLRenderer({ alpha: true });
            //renderer.setClearColor(0x000000, 0); // the default
            //renderer.setPixelRatio(window.devicePixelRatio);
            //renderer.autoClear = false;
            //// renderer.setPixelRatio(730 / 350);
            //renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
            //renderContainer.insertAdjacentElement('afterbegin', renderer.domElement);
            //// window.addEventListener('resize', onWindowResize, false);
        //});
    //}

    //function animate () {
        //requestAnimationFrame (animate);
        //if (devMode) orbit.update();
        ////views.map(function (view) {
            ////renderer.render(scene, view.camera);
        ////});
        ////renderer.render(scene, camera);
        //renderer.clear();
        ////renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        //renderer.render( scene, views[0].camera );
        //renderer.clearDepth(); // important! clear the depth buffer
        ////renderer.setViewport( 10, window.innerHeight - insetHeight - 10, insetWidth, insetHeight );
        //renderer.render( scene, views[1].camera );
    //}
};
