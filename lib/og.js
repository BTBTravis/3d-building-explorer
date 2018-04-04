const THREE = require('three'); // TODO: only import the part of the lib we need ex. import { Scene } from 'three'; .. should speed up load by reducing the bundeled js size.
const OrbitControls = require('three-orbit-controls')(THREE);
const ColladaLoader = require('three-collada-loader');
import { TweenLite } from 'gsap';

console.log("3D BUILDING EXPLORER!!!");

var renderContainer = document.getElementById('building_explorer');
let getSetting = function (setting) {
    let data =  JSON.parse(renderContainer.getAttribute('data-' + setting));
    if(data.hasOwnProperty('data')) data = data.data;
    return data;
}
var orbitMode = getSetting('orbit-mode'); // setting this to true enables orbit controlls
var debugMode = getSetting('debug-mode'); // setting this to true enables orbit controlls
// define global varables
var views, camera, scene, renderer, orbit, meshesByMaterial, lightsByMaterial, rooms, meshes;
let parent;
let camDir = new THREE.Vector3();
// define base materials
let matConfigs = getSetting('materials');
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
let makeBoxAt = function (x, y, z) {
    var box = new THREE.Box3();
    box.setFromCenterAndSize( new THREE.Vector3( x, y, z ), new THREE.Vector3( 100, 100, 100 ) );
    var helper = new THREE.Box3Helper( box, 0xffff00 );
    scene.add( helper );
}


// initlize everything as in load the 3d modeles prepare the scene then start the animation loop
window.modelLoaded = (function () {
   return new Promise(function(superResolve, superReject) {
       init().then(function (x) {
           animate();
       })
       .then(function () {
           superResolve();
       });
   });
})();

function init () {
    return new Promise((resolve, reject) => {
        // view setup
        views = [
            {
                left: 0,
                top: 0,
                width: 1.0,
                height: 1.0,
                layer: 0
            },
            {
                left: 0,
                top: 0,
                width: 1.0,
                height: 1.0,
                layer: 2,
            }
        ];
        console.log({"views": views});
        // camera setup
        views.map(function (view) {
            let initCamSettings = getSetting('inital-camera');
            let initWidth = renderContainer.clientWidth > 750 ? 750 : renderContainer.clientWidth;
            let initHeight = initWidth / 3;
            //let camera = new THREE.PerspectiveCamera(70, 2/1.75, 10, 10000);
            //let aspect = renderContainer.clientWidth /  renderContainer.clientHeight;
            let aspect = initWidth / initHeight;
            let factor = getSetting('camera-aspect-factor') ? getSetting('camera-aspect-factor') : {num: 0.5};
            let camera = new THREE.PerspectiveCamera(70, aspect * factor.num, 10, 10000);
            camera.layers.disable(0);
            camera.layers.enable(view.layer);
            camera.position.set(initCamSettings.px, initCamSettings.py, initCamSettings.pz); // xyz
            camera.quaternion.set(initCamSettings.qx, initCamSettings.qy, initCamSettings.qz, initCamSettings.qw); // xyzw
            camera.updateProjectionMatrix();
            view.camera = camera;
        });

        //camera.fov = 90;
        // orbit setup
        if (orbitMode) orbit = new OrbitControls(views[0].camera);
        // camera pos tool
        document.addEventListener('keydown', (e) => {
            console.log({key: e.key});
            if (e.key === 'm') {
                console.log(JSON.stringify(flattenThreeObj(views[0].camera)));
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
        let roomSettings = getSetting('room-infos') ? getSetting('room-infos') : [];
        // iterate over the nav links and set up there click actions like camera, color, and light tweens
        window.buildingController = (function () {
            let clear = function () { // function to clear highlight
                rooms.map(room => {
                    room.children.map(function (threeObj) {// move all rooms to non visible layer
                        if(threeObj.type === "Object3D") threeObj = threeObj.children[0];
                        threeObj.layers.set(3);
                    });
                });
            };
            let moveTo = roomSettings.reduce((obj, config) => {
                console.log({"config": config});
                obj[config.id] = function () {
                    // handle moveing rooms to the correct layers
                    clear();
                    rooms.map(room => {
                        if(config.hasOwnProperty('room_name') && room.name === config.room_name) { // move the selected room to the room layer
                            room.children.map(function (threeObj) {
                                if(threeObj.type === "Object3D") threeObj = threeObj.children[0];
                                threeObj.layers.set(2);
                            });
                        }
                    });
                    // Tween Rotation
                    let initCamSettings = getSetting('inital-camera');
                    let y2 = getSetting('y2');
                    var tweenRotTo = function (goalRot) {
                        return new Promise(function (resolve, reject) {
                            let rot = Object.assign({}, {y: goalRot});
                            let initRot = Object.assign({}, {y: parent.rotation.y});
                            rot.onUpdate = function () {
                                parent.rotation.y = initRot.y;
                                let m = y2.num / 2.21;
                                let x = initRot.y;
                                let y = m * ( x + .49 );
                                let newPos = new THREE.Vector3();
                                let initCamPos = new THREE.Vector3(initCamSettings.px, initCamSettings.py, initCamSettings.pz); // xyz
                                newPos.copy(camDir);
                                newPos.multiplyScalar(y);
                                //newPos.multiplyScalar(-500);
                                //newPos.addScalar(initDol.a);
                                initCamPos.add(newPos);
                                //console.log("A", initDol.a);
                                views[0].camera.position.copy(initCamPos);
                                views[1].camera.position.copy(initCamPos);
                            };
                            rot.onComplete = function () {
                                resolve();
                            };
                            TweenLite.to(initRot, 1, rot);
                        });
                    };
                    var tweenDollyTo = function (goalDol, vs) {
                        return new Promise(function (resolve, reject) {
                            let dol = Object.assign({}, {a: goalDol});
                            //let initDol = Object.assign({}, {y: parent.rotation.y});
                            let initDol = Object.assign({}, {a: vs[0].axisVal});
                            //let sign = dol.a > initDol.a ? 1 : -1;
                            console.log({"initDol": initDol, "dol":dol});
                            let initCamSettings = getSetting('inital-camera');
                            dol.onUpdate = function () {
                                let newPos = new THREE.Vector3();
                                let initCamPos = new THREE.Vector3(initCamSettings.px, initCamSettings.py, initCamSettings.pz); // xyz
                                newPos.copy(camDir);
                                newPos.multiplyScalar(initDol.a);
                                //newPos.addScalar(initDol.a);
                                initCamPos.add(newPos);
                                //console.log("A", initDol.a);
                                vs[0].camera.position.copy(initCamPos);
                                vs[1].camera.position.copy(initCamPos);
                            };
                            dol.onComplete = function () {
                                vs[0].axisVal = dol.a;
                                resolve();
                            };
                            TweenLite.to(initDol, 1, dol);
                        });
                    };
                    tweenRotTo(config.rot);
                };
                return obj;
            }, {});
            return {
                moveTo: moveTo,
                clear: clear
            }
        })();

        // sketchup import
        var loader = new ColladaLoader();
        loader.load('./models/building.dae', function (result) {
            // import matrix fixes
            result.scene.applyMatrix(result.scene.matrix.identity());
            result.scene.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
            //result.scene.matrixAutoUpdate  = true;
            parent = new THREE.Object3D();
            scene.add( parent );
            let pivot = new THREE.Object3D();
            parent.add(pivot);
            pivot.position.set(0, 0, 500);
            pivot.add(result.scene);

            //const camDir = new THREE.Vector3();
            let newParentPos = new THREE.Vector3();
            let yOffset = getSetting('cameraYoffset');
            newParentPos.setY(yOffset.num);
            let tempV =  camDir.subVectors(views[0].camera.position, newParentPos).normalize();
            camDir = tempV.clone();
            views.map(function (view) {
                view.axisVal = 0;
                return view;
            });
            //views[0].camera.lookAt(parent.position);
            //var arrowHelper = new THREE.ArrowHelper( camDir, parent.position, 1000, 'red' );
            //scene.add( arrowHelper );
            if(debugMode) {
                document.querySelector('body').addEventListener('keydown', function (e) {
                    if (e.key === 'd') parent.rotation.y += .05;
                    if (e.key === 's') parent.rotation.y -= .05;
                    if (e.key === 'r') {
                        let newPos = new THREE.Vector3();
                        newPos.copy(camDir);
                        newPos.multiplyScalar(100);
                        views[0].camera.position.add(newPos);
                        //views[0].camera.lookAt(parent.position);
                    }
                    if (e.key === 'f') {
                        let newPos = new THREE.Vector3();
                        newPos.copy(camDir);
                        newPos.multiplyScalar(-100);
                        views[0].camera.position.add(newPos);
                        //views[0].camera.lookAt(parent.position);
                    }
                });
            }
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
            console.log({"meshesByMaterial": meshesByMaterial});
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
            // initlize rooms
            rooms.map(function (room) {
                room.children.map(function (threeObj) {
                    if(threeObj.type === "Object3D") {
                        threeObj = threeObj.children[0];
                        threeObj.material = new THREE.MeshBasicMaterial({ name: 'room_mat', color: '#FEECCC', opacity: 0.5 });
                        threeObj.material.transparent = true;
                        threeObj.layers.set(3);
                    } else {
                        threeObj.material = new THREE.MeshBasicMaterial({ name: 'room_mat', color: '#E3C495', opacity: 0.5 });
                        threeObj.material.transparent = true;
                        threeObj.layers.set(3);
                    }
                });
            });
            console.log({"rooms": rooms});

            //scene.add(result.scene);
            resolve(); // fulfilled
        });

        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setClearColor(0x000000, 0); // the default
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;
        // renderer.setPixelRatio(730 / 350);
        let initWidth = renderContainer.clientWidth > 750 ? 750 : renderContainer.clientWidth;
        let initHeight = initWidth / 3;
        //let aspect = initWidth /  initHeight;
        renderer.setSize(initWidth, initHeight);
        //renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
        renderContainer.insertAdjacentElement('afterbegin', renderer.domElement);
        // window.addEventListener('resize', onWindowResize, false);
        if(debugMode) {
            var gridHelper = new THREE.GridHelper( 10000, 100 );
            scene.add( gridHelper );
            var axesHelper = new THREE.AxesHelper( 1000 );
            scene.add( axesHelper );
        }
    });
}

function animate () {
    requestAnimationFrame (animate);
    if (orbitMode) orbit.update();
    //views.map(function (view) {
        //renderer.render(scene, view.camera);
    //});
    //renderer.render(scene, camera);
    renderer.clear();
    //renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
    renderer.render( scene, views[0].camera );
    renderer.clearDepth(); // important! clear the depth buffer
    //renderer.setViewport( 10, window.innerHeight - insetHeight - 10, insetWidth, insetHeight );
    renderer.render( scene, views[1].camera );
}
