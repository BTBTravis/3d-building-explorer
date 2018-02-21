const THREE = require('three'); // TODO: only import the part of the lib we need ex. import { Scene } from 'three'; .. should speed up load by reducing the bundeled js size.
const OrbitControls = require('three-orbit-controls')(THREE);
const ColladaLoader = require('three-collada-loader');
import { TweenLite } from 'gsap';

console.log("3D BUILDING EXPLORER");

var renderContainer = document.getElementById('building_explorer');
let getSetting = function (setting) {
    let data =  JSON.parse(renderContainer.getAttribute('data-' + setting));
    if(data.hasOwnProperty('data')) data = data.data;
    return data;
}
var devMode = getSetting('flymode'); // setting this to true enables orbit controlls
//devMode = true;
// define global varables
var camera, scene, renderer, orbit, meshesByMaterial, lightsByMaterial, rooms, meshes;
// define base materials
let matConfigs = getSetting('materials');
//console.log({"matConfigs": matConfigs});
let materials = matConfigs.reduce(function (obj, config) {
    obj[config.name] = new THREE.MeshPhongMaterial({ color: config.color, name: config.name });
    return obj;
}, {});
// util
var flattenThreeObj = function (threeobj) {
    return {
        px: threeobj.position.x,
        py: threeobj.position.y,
        pz: threeobj.position.z,
        qw: threeobj.quaternion._w,
        qx: threeobj.quaternion._x,
        qy: threeobj.quaternion._y,
        qz: threeobj.quaternion._z,
        sx: threeobj.scale.x,
        sy: threeobj.scale.y,
        sz: threeobj.scale.z
    };
};
// initlize everything as in load the 3d modeles prepare the scene then start the animation loop
init().then(function (x) {
    animate();
    // TODO: bring spinner in house as to not rely on other things
    //let spinnerEl = renderContainer.querySelector('.spinner');
    //spinnerEl.parentNode.removeChild(spinnerEl);
});

function init () {
    return new Promise((resolve, reject) => {

        // camera setup
        camera = new THREE.PerspectiveCamera(70, 2/1.75, 10, 10000);
        let initCamSettings = getSetting('inital-camera');
        camera.position.set(initCamSettings.px, initCamSettings.py, initCamSettings.pz); // xyz
        camera.quaternion.set(initCamSettings.qx, initCamSettings.qy, initCamSettings.qz, initCamSettings.qw); // xyzw
        //camera.filmGauge = 40;
        //camera.fov = 90;
        camera.updateProjectionMatrix();
        // orbit setup
        if (devMode) orbit = new OrbitControls(camera);
        // camera pos tool
        document.addEventListener('keydown', (e) => {
            console.log({key: e.key});
            if (e.key === 'm') {
                console.log(JSON.stringify(flattenThreeObj(camera)));
            }
        });

        // scene setup
        scene = new THREE.Scene();

        // global lights - these are not assocated with any paticular location
        let light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
        let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        //TODO: pull directional light info from global state object
        directionalLight.position.set(0, 50, 0);
        directionalLight.target.position.set(10, 10, -90);
        // directionalLight Tool
        // document.querySelector('body').addEventListener('keydown', function (e) {
        //   if (e.key === 'ArrowRight') directionalLight.target.position.x += 10;
        //   if (e.key === 'ArrowLeft') directionalLight.target.position.x -= 10;
        //   if (e.key === 'ArrowUp') directionalLight.target.position.y += 10;
        //   if (e.key === 'ArrowDown') directionalLight.target.position.y -= 10;
        //   if (e.key === '=') directionalLight.target.position.z += 10;
        //   if (e.key === '-') directionalLight.target.position.z -= 10;
        //   console.log({directionalLightTargetPOS: directionalLight.target.position});
        // });
        scene.add(directionalLight.target);
        scene.add(directionalLight);

        // click through navigation
        let locSettings = getSetting('camera-locations') ? getSetting('camera-locations') : [];
        // iterate over the nav links and set up there click actions like camera, color, and light tweens
        locSettings.map((config, i) => {
            let linkElm = document.querySelector(config.sel);
            if(!linkElm) return false;

            linkElm.addEventListener('click', (e) => {
                console.log({"config": config});
                meshes.map(function (mesh) {
                    //mesh.material.opacity = .5;
                    //mesh.material = new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true });
                    //mesh.material =  new THREE.MeshPhongMaterial({ color: 'red', opacity: .5 });
                    //mesh.material.opacity = .75;
                    //mesh.material.transparent = true;
                });
                rooms.map(room => {
                    room.children.map(function (mesh) {
                        mesh.material.opacity = 0;
                    });
                    if(config.hasOwnProperty('room_name') && room.name === config.room_name) {
                        room.children.map(function (mesh) {
                            mesh.material.opacity = 1;
                        });
                    }
                });
                //highlightMaterialNames.map((name) => { // clear all other highlights
                    //setMat(name); // passing just the name and not a material sets it to the base material
                //});
                //lightNames.map(function (name) { // turn off all the toggleable lights so we can turn them on again
                    //let lightObjs = lightsByMaterial[name];
                    //lightObjs.map(function (lightObj) {
                        //lightObj.light.intensity = 0; // TODO: actually turn off lights instead of setting their intensity to 0 might improve performance
                    //});
                //});
                //*
                // Tweens material assocated with linkElm.location.mat
                // @param {matName} string ex: stage
                //var tweenColor = function (matName) {
                    //return new Promise(function (resolve, reject) {
                        //// highlight this room
                        //// #F44336 hsl(4, 90%, 58%)  base: hsl(0, 0%, 100%)
                        //var newColor = new THREE.Color('hsl(0, 0%, 100%)');
                        //var newMat = new THREE.MeshPhongMaterial({ color: newColor });
                        //setMat(matName, newMat);
                        //var initalColorVals = { a: 0, b: 0, c: 100 };
                        //var updateColor = function () {
                            //newColor = new THREE.Color('hsl(' + Math.round(initalColorVals.a) + ', ' + Math.round(initalColorVals.b) + '%, ' + Math.round(initalColorVals.c) + '%)');
                            //newMat.color = newColor;
                        //};
                        //TweenLite.to(initalColorVals, 1, {
                            //a: 4,
                            //b: 90,
                            //c: 58,
                            //onUpdate: updateColor,
                            //onComplete: function () {
                                //resolve();
                            //}
                        //});
                    //});
                //};
                //*
                // Tweens the camera into place based on goalTransform pram
                // @param {goalTransform} obj ex: {"px":807.8943218414179,"py":520.3328393399023,"pz":-799.3262672698474,"qw":0.7815924058567101,"qx":-0.24803634983789802,"qy":0.5455440573410596,"qz":0.17312701050404108,"sx":1,"sy":1,"sz":1}
                var tweenCamTo = function (goalTransform) {
                    return new Promise(function (resolve, reject) {
                        const currentCameraVals = flattenThreeObj(camera);
                        var vals = Object.assign({}, currentCameraVals); // clone obj to make sure we are not working with refs
                        let updateCam = function () {
                            camera.position.set(vals.px, vals.py, vals.pz);
                            camera.quaternion.set(vals.qx, vals.qy, vals.qz, vals.qw);
                            camera.scale.set(vals.sx, vals.sy, vals.sz);
                            camera.updateMatrix();
                        };
                        goalTransform.onUpdate = updateCam;
                        goalTransform.onComplete = function () {
                            resolve();
                        };
                        TweenLite.to(vals, 1, goalTransform);
                    });
                };
                //*
                 //Tweens lights assocated with linkElm.location.lights to a certin intensity
                 //@param {lightName} string ex: first_floor
                //var tweenLights = function (lightName) {
                    //return new Promise(function (resolve, reject) {
                        //// get lights
                        //let lightObjs = lightsByMaterial[lightName];
                        //var state = {intensity: 0};
                        //var updateLights = function () {
                            //lightObjs.map(function (lightObj) {
                                //lightObj.light.intensity = state.intensity;
                            //});
                        //};
                        //TweenLite.to(state, 1, {
                            //intensity: lightObjs[0].goalIntensity,
                            //onUpdate: updateLights,
                            //onComplete: function () {
                                //resolve();
                            //}
                        //});
                    //});
                //};

                //(function () {
                    //if (prevID === '9' && currentID === '10') {
                        //let doorsTransform = JSON.parse('{"px":608.3856154283419,"py":154.2044856053559,"pz":2285.2780043777298,"qw":0.9954344818313129,"qx":0.09509532437825026,"qy":0.008152612145483476,"qz":-0.0007788310638772835,"sx":1,"sy":1,"sz":1}');
                        //return tweenCamTo(doorsTransform);
                    //} else return Promise.resolve();
                //})()
                    //.then(function () {
                         tweenCamTo(config.transform);
                    //})
                    //.then(function () {
                        //let promises = [];
                        //if (linkElm.location.mat) promises.push(tweenColor(linkElm.location.mat));
                        //if (linkElm.location.lights) promises.push(tweenLights(linkElm.location.lights));
                        //return Promise.all(promises);
                    //});
            });
        });
        // sketchup import
        var loader = new ColladaLoader();
        loader.load('./models/building.dae', function (result) {
            // import matrix fixes
            result.scene.applyMatrix(result.scene.matrix.identity());
            result.scene.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
            result.scene.updateMatrix();
            result.scene.updateMatrixWorld();
            console.log({ result: result });
            // Grab all the meshes from the scene
            meshes = result.scene.children.reduce(function sceneToMeshArray(arr, currentItem) {
                if (currentItem.type === 'Mesh') arr.push(currentItem);
                else if (currentItem.type === 'Object3D') arr = currentItem.children.reduce(sceneToMeshArray, arr);
                return arr;
            }, []);
            //console.log({"meshes": meshes});
            // Put meshes into arrayes by material for orginization as material is only way we have to seprate them in sketchup
            meshesByMaterial = meshes.reduce(function (obj, mesh) {
                if (typeof obj[mesh.material.name] === 'undefined') obj[mesh.material.name] = [];
                obj[mesh.material.name].push(mesh);
                return obj;
            }, {});
            // set all to base mat
            for (let key in meshesByMaterial) {
                if(materials.hasOwnProperty(key)){
                    meshesByMaterial[key].map(function (mesh) {
                        mesh.material = materials[key];
                    });
                } else {
                    meshesByMaterial[key].map(function (mesh) {
                        mesh.material = new THREE.MeshPhongMaterial({ color: '#ff00fe', name: 'default' });
                    });
                }
            }
            rooms = result.scene.children.reduce(function getRooms (arr, obj) {
                if(/^room_/.test(obj.name)) arr.push(obj);
                if (obj.type === 'Object3D') arr = obj.children.reduce(getRooms, arr);
                return arr;
            }, [] );
            rooms.map(function (room) {
                room.children.map(function (mesh) {
                    mesh.material =  new THREE.MeshBasicMaterial({ color: 'red', opacity: 0 });
                    mesh.material.transparent = true;
                });
            });
            console.log({"rooms": rooms});

            scene.add(result.scene);
            resolve(); // fulfilled
        });

        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setClearColor(0x000000, 0); // the default
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setPixelRatio(730 / 350);
        renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
        renderContainer.insertAdjacentElement('afterbegin', renderer.domElement);
        // window.addEventListener('resize', onWindowResize, false);
    });
}

function animate () {
    requestAnimationFrame (animate);
    if (devMode) orbit.update();
    renderer.render(scene, camera);
}
