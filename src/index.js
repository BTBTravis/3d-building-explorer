//TODO: requrie three js and orbit controller



var devMode = false; // setting this to true enables orbit controlls
var renderContainer = document.getElementById('three-dee-explorer');
var camera, scene, renderer, orbit, meshesByMaterial, lightsByMaterial;
// define base materials
var baseColor = new THREE.Color('white');
var baseMaterial = new THREE.MeshPhongMaterial({ color: baseColor, name: 'baseMat' });
var setMat = function (key, mat = false) {
    if (!mat) mat = baseMaterial;
    if (meshesByMaterial.hasOwnProperty(key)) {
        meshesByMaterial[key].map((mesh) => {
            mesh.material = mat;
        });
    }
};
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
init().then(function (x) {
    animate();
    let spinnerEl = renderContainer.querySelector('.spinner');
    spinnerEl.parentNode.removeChild(spinnerEl);
});

// animate();
function init () {
    return new Promise((resolve, reject) => {
        // camera setup
        camera = new THREE.PerspectiveCamera(70, renderContainer.clientWidth / renderContainer.clientHeight, 10, 100000);
        camera.position.set(593.405, 1121.285, 3165.17); // xyz
        camera.quaternion.set(-0.3231, 0.2770, 0.099548, 0.89938); // xyzw
        // orbit setup
        if (devMode) orbit = new THREE.OrbitControls(camera);
        // TODO: Remove this dev code
        document.addEventListener('keydown', (e) => {
            console.log({key: e.key});
            if (e.key === 'm') {
                console.log(JSON.stringify(flattenThreeObj(camera)));
            } else if (e.key === 'p') {
                console.log(JSON.stringify({ pos: camera.position, rot: camera.rotation }));
            }
        });
        // scene setup
        scene = new THREE.Scene();
        // TODO: Remove this dev code
        // let geo = new THREE.Geometry();
        // geo.vertices.push(
        //   new THREE.Vector3(600, 2000, 1000),
        //   new THREE.Vector3(600, 0, 1000)
        // );
        // let line = new THREE.Line(geo, new THREE.LineBasicMaterial({color: 'blue'}));
        // scene.add(line);

        // global lights - these are not assocated with any paticular location
        let light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
        let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 50, 0);
        directionalLight.target.position.set(10, 10, -90);
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
        var navLinks = Array.from(document.querySelectorAll('nav.floorplan-nav li')); // get the li's off the dom
        var Location = function (str) { // was having trouble with the locations not being uniform so defining a location object to keep things little more orginized
            var data = JSON.parse(str);
            var exceptedKeys = ['transform', 'mat', 'lights'];
            for (var i = 0; i < exceptedKeys.length; i++) {
                if (typeof data[exceptedKeys[i]] !== 'undefined') this[exceptedKeys[i]] = data[exceptedKeys[i]];
                else this[exceptedKeys[i]] = false;
            }
        };
        navLinks = navLinks.map(function (el) { // go though the li's and turn their data attr into a location obj and attach that as a property
            el.location = new Location(el.getAttribute('data-room-3dinfo'));
            return el;
        });
        var highlightMaterialNames = navLinks.reduce((arr, el) => { // figure out what materials are eligible to be highlighted so we can hightlight them between clicks
            if (el.location.mat && !arr.includes(el.location.mat)) arr.push(el.location.mat);
            return arr;
        }, []);
        var lightNames = navLinks.reduce((arr, el) => { // figure out what materials are eligible to be highlighted so we can hightlight them between clicks
            if (el.location.lights && !arr.includes(el.location.lights)) arr.push(el.location.lights);
            return arr;
        }, []);
        console.log({lightNames: lightNames});
        // iterate over the nav links and set up there click actions like camera, color, and light tweens
        navLinks.map((linkElm, i) => {
            linkElm.addEventListener('click', (e) => {
                // active styles
                const prevID = navLinks.reduce(function (id, el) {
                    if (el.classList.contains('default')) id = el.getAttribute('data-room-id');
                    return id;
                }, null);
                const currentID = linkElm.getAttribute('data-room-id'); // current location id assocated with the database record aka room id
                navLinks.map(function (el) { el.classList.remove('default'); }); // remove all active classes on the left menu
                linkElm.classList.add('default');
                highlightMaterialNames.map((name) => { // clear all other highlights
                    setMat(name); // passing just the name and not a material sets it to the base material
                });
                lightNames.map(function (name) { // turn off all the toggleable lights so we can turn them on again
                    let lightObjs = lightsByMaterial[name];
                    lightObjs.map(function (lightObj) {
                        lightObj.light.intensity = 0; // TODO: actually turn off lights instead of setting their intensity to 0 might improve performance
                    });
                });
                /**
                 * Tweens material assocated with linkElm.location.mat
                 * @param {matName} string ex: stage
                 */
                var tweenColor = function (matName) {
                    return new Promise(function (resolve, reject) {
                        // highlight this room
                        // #F44336 hsl(4, 90%, 58%)  base: hsl(0, 0%, 100%)
                        var newColor = new THREE.Color('hsl(0, 0%, 100%)');
                        var newMat = new THREE.MeshPhongMaterial({ color: newColor });
                        setMat(matName, newMat);
                        var initalColorVals = { a: 0, b: 0, c: 100 };
                        var updateColor = function () {
                            newColor = new THREE.Color('hsl(' + Math.round(initalColorVals.a) + ', ' + Math.round(initalColorVals.b) + '%, ' + Math.round(initalColorVals.c) + '%)');
                            newMat.color = newColor;
                        };
                        TweenLite.to(initalColorVals, 1, {
                            a: 4,
                            b: 90,
                            c: 58,
                            onUpdate: updateColor,
                            onComplete: function () {
                                resolve();
                            }
                        });
                    });
                };
                /**
                 * Tweens the camera into place based on goalTransform pram
                 * @param {goalTransform} obj ex: {"px":807.8943218414179,"py":520.3328393399023,"pz":-799.3262672698474,"qw":0.7815924058567101,"qx":-0.24803634983789802,"qy":0.5455440573410596,"qz":0.17312701050404108,"sx":1,"sy":1,"sz":1}
                 */
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
                /**
                 * Tweens lights assocated with linkElm.location.lights to a certin intensity
                 * @param {lightName} string ex: first_floor
                 */
                var tweenLights = function (lightName) {
                    return new Promise(function (resolve, reject) {
                        // get lights
                        let lightObjs = lightsByMaterial[lightName];
                        var state = {intensity: 0};
                        var updateLights = function () {
                            lightObjs.map(function (lightObj) {
                                lightObj.light.intensity = state.intensity;
                            });
                        };
                        TweenLite.to(state, 1, {
                            intensity: lightObjs[0].goalIntensity,
                            onUpdate: updateLights,
                            onComplete: function () {
                                resolve();
                            }
                        });
                    });
                };

                (function () {
                    if (prevID === '9' && currentID === '10') {
                        let doorsTransform = JSON.parse('{"px":608.3856154283419,"py":154.2044856053559,"pz":2285.2780043777298,"qw":0.9954344818313129,"qx":0.09509532437825026,"qy":0.008152612145483476,"qz":-0.0007788310638772835,"sx":1,"sy":1,"sz":1}');
                        return tweenCamTo(doorsTransform);
                    } else return Promise.resolve();
                })()
                    .then(function () {
                        return tweenCamTo(linkElm.location.transform);
                    })
                    .then(function () {
                        let promises = [];
                        if (linkElm.location.mat) promises.push(tweenColor(linkElm.location.mat));
                        if (linkElm.location.lights) promises.push(tweenLights(linkElm.location.lights));
                        return Promise.all(promises);
                    });
            });
        });
        // sketchup import
        var loader = new THREE.ColladaLoader();
        loader.load('/assets/js/3D/models/arts_center_008.dae', function (result) {
            // import matrix fixes
            result.scene.applyMatrix(result.scene.matrix.identity());
            result.scene.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
            result.scene.updateMatrix();
            result.scene.updateMatrixWorld();
            console.log({ result: result });
            var model = result.scene;
            // Grab all the meshes from the scene
            var meshes = result.scene.children.reduce(function sceneToMeshArray(arr, currentItem) {
                if (currentItem.type === 'Mesh') arr.push(currentItem);
                else if (currentItem.type === 'Group') arr = currentItem.children.reduce(sceneToMeshArray, arr);
                return arr;
            }, []);
            // Put meshes into arrayes by material for orginization as material is only way we have to seprate them in sketchup
            meshesByMaterial = meshes.reduce(function (obj, mesh) {
                if (typeof obj[mesh.material.name] === 'undefined') obj[mesh.material.name] = [];
                obj[mesh.material.name].push(mesh);
                return obj;
            }, {});
            // set all to base mat
            for (var key in meshesByMaterial) if (key !== 'shell' && key !== 'wall_glass') setMat(key);
            meshesByMaterial.shell.map(function (mesh) {
                mesh.material.opacity = 0.4;
            });
            meshesByMaterial.wall_glass.map(function (mesh) {
                mesh.material.opacity = 0.2;
            });
            meshesByMaterial.existing.map(function (mesh) {
                let mat = new THREE.MeshLambertMaterial({color: 'white'});
                mesh.material = mat;
            });


            console.log({ meshesByMaterial: meshesByMaterial });
            // interior lighting
            lightsByMaterial = {};
            lightsByMaterial['first_floor'] = meshesByMaterial.rec_light.map(function (mesh) {
                const worldPos = mesh.getWorldPosition();
                mesh.layers.set(2);
                let light = new THREE.PointLight(0xffffff, 0, 100);
                light.distance = 2000;
                light.decay = 1;
                light.position.set(worldPos.x, worldPos.y - 10, worldPos.z);
                scene.add(light);
                return {light: light, goalIntensity: 0.03};
                // var pointLightHelper = new THREE.PointLightHelper(light, 10, 'red');
                // scene.add(pointLightHelper);
            });

            scene.add(model);
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

// function onWindowResize () {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// }
function animate () {
    requestAnimationFrame (animate);
    if (devMode) orbit.update();
    renderer.render(scene, camera);
}
