// using requrie js to make sure we have all our dependinces
define('THREE', ['/assets/js/3D/scripts/three.js'], function (THREE) {
  window.THREE = THREE;
  return THREE;
});
// ColladaLoader used to load in the sketchup export requries three js so configuring requirejs to know that
requirejs.config({
  paths: {
    TweenMax: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min'
  },
  shim: {
    ColladaLoader: {
      deps: ['THREE']
    },
    OrbitControls: {
      deps: ['THREE']
    },
    SVGRenderer: {
      deps: ['THREE']
    },
    Projector: {
      deps: ['THREE']
    }
  }
});
// load our modules in this order then run our code.
requirejs(['THREE', 'ColladaLoader', 'Projector', 'SVGRenderer', 'OrbitControls', 'TweenMax'], function (THREE) {
  var devMode = false; // setting this to true enables orbit controlls
  var camera, scene, renderer, orbit, meshesByMaterial;
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
  });

  // animate();
  function init () {
    return new Promise((resolve, reject) => {
      // camera setup
      // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000);
      camera = new THREE.PerspectiveCamera(70, 730 / 350, 10, 100000);
      camera.position.x = 800;
      camera.position.y = 1400;
      camera.position.z = 3000;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // orbit setup
      if (devMode) orbit = new THREE.OrbitControls(camera);
      // orbit.maxPolarAngle = 1.4095;
      // orbit.minPolarAngle = 1.0799;
      // orbit.enablePan = false;
      // orbit.enableZoom = false;
      // TODO: Remove this dev code
      document.addEventListener('keydown', (e) => {
        if (e.key === 'm') {
          console.log(JSON.stringify(flattenThreeObj(camera)));
        } else if (e.key === 'p') {
          console.log(JSON.stringify({ pos: camera.position, rot: camera.rotation }));
        }
      });

      // scene setup
      scene = new THREE.Scene();
      // debug setup
      createDebugLine = function (posVector, color) {
        var debugLineGeo = new THREE.Geometry();
        debugLineGeo.vertices.push(new THREE.Vector3(500, 500, 0));
        debugLineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        debugLineGeo.vertices.push(new THREE.Vector3(-500, 500, 0));
        var debugLine = new THREE.Line(debugLineGeo, new THREE.LineBasicMaterial({ color: color }));
        debugLine.position.set(posVector.x, posVector.y, posVector.z);
        scene.add(debugLine);
      };

      // lights
      let light = new THREE.AmbientLight(0x404040); // soft white light
      scene.add(light);
      let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.rotation.z = 25;
      scene.add(directionalLight);

      // click through navigation
      var navLinks = Array.from(document.querySelectorAll('nav.floorplan-nav li')); // get the li's off the dom
      var Location = function (str) { // was having trouble with the locations not being uniform so defining a location object to keep things little more orginized
        var data = JSON.parse(str);
        var exceptedKeys = ['transform', 'mat'];
        for (var i = 0; i < exceptedKeys.length; i++) {
          if (typeof data[exceptedKeys[i]] !== 'undefined') this[exceptedKeys[i]] = data[exceptedKeys[i]];
          else this[exceptedKeys[i]] = false;
        }
      };
      navLinks = navLinks.map(function (el) { // go though the li's and turn their data attr into a location obj and attach that as a property
        el.location = new Location(el.getAttribute('data-room-3dinfo'));
        return el;
      });
      console.log({navLinks: navLinks});
      var highlightMaterialNames = navLinks.reduce((arr, el) => { // figure out what materials are eligible to be highlighted so we can hightlight them between clicks
        if (el.location.mat && !arr.includes(el.location.mat)) arr.push(el.location.mat);
        return arr;
      }, []);
      navLinks.map((linkElm, i) => {
        linkElm.addEventListener('click', (e) => {
          // active styles
          const prevID = navLinks.reduce(function (id, el) {
            if (el.classList.contains('default')) id = el.getAttribute('data-room-id');
            return id;
          }, null);
          const currentID = linkElm.getAttribute('data-room-id');
          // TODO: perhaps move this to other js file so it's not so deep as its not really anything to do with 3d rendering
          navLinks.map(function (el) { el.classList.remove('default'); });
          linkElm.classList.add('default');
          // clear all other highlights
          highlightMaterialNames.map((name) => {
            setMat(name); // passing just the name and not a material sets it to the base material
          });
          // hight light rooms
          var tweenColor = function () {
            // highlight this room
            // #F44336 hsl(4, 90%, 58%)  base: hsl(0, 0%, 100%)
            var newColor = new THREE.Color('hsl(0, 0%, 100%)');
            var newMat = new THREE.MeshPhongMaterial({ color: newColor });
            setMat(linkElm.location.mat, newMat);
            var initalColorVals = { a: 0, b: 0, c: 100 };
            var updateColor = function () {
              newColor = new THREE.Color('hsl(' + Math.round(initalColorVals.a) + ', ' + Math.round(initalColorVals.b) + '%, ' + Math.round(initalColorVals.c) + '%)');
              newMat.color = newColor;
            };
            TweenLite.to(initalColorVals, 1, {
              a: 4,
              b: 90,
              c: 58,
              onUpdate: updateColor
            });
          };
          // move camera into place
          // var goalVals = linkElm.location.transform;
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
                if (linkElm.location.mat) tweenColor();
                resolve();
              };
              TweenLite.to(vals, 1, goalTransform);
            });
          };
          if (prevID === '9' && currentID === '10') {
            let doorsTransform = JSON.parse('{"px":608.3856154283419,"py":154.2044856053559,"pz":2285.2780043777298,"qw":0.9954344818313129,"qx":0.09509532437825026,"qy":0.008152612145483476,"qz":-0.0007788310638772835,"sx":1,"sy":1,"sz":1}');
            tweenCamTo(doorsTransform).then(function () {
              return tweenCamTo(linkElm.location.transform);
            });
          } else {
            tweenCamTo(linkElm.location.transform);
          }
          // {"px":547.8035813921869,"py":300.58333634620533,"pz":2416.833743525899,"qw":0.9976567165276948,"qx":-0.04691722329335851,"qy":0.04974311856935126,"qz":0.002339290622278365,"sx":1,"sy":1,"sz":1}
        });
      });
      // sketchup import
      var loader = new THREE.ColladaLoader();
      loader.load('/assets/js/3D/models/arts_center_007.dae', function (result) {
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
        meshesByMaterial.shell.map((mesh) => {
          mesh.material.opacity = 0.4;
        });
        meshesByMaterial.wall_glass.map((mesh) => {
          mesh.material.opacity = 0.2;
        });
        console.log({ meshesByMaterial: meshesByMaterial });
        // interior lighting
        meshesByMaterial.rec_light.map(function (mesh) {
          const worldPos = mesh.getWorldPosition();
          mesh.layers.set(2);
          let light = new THREE.PointLight(0xffffff, 0.03, 100);
          light.distance = 4000;
          light.decay = 1;
          light.position.set(worldPos.x, worldPos.y - 10, worldPos.z);
          scene.add(light);
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
      renderer.setSize(730, 350);
      var renderContainer = document.querySelector('.floorplan-container');
      // renderContainer.prepend(renderer.domElement);
      renderContainer.insertAdjacentElement('afterbegin', renderer.domElement);
      // document.body.appendChild(renderer.domElement);
      // window.addEventListener('resize', onWindowResize, false);
    });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function animate() {
    requestAnimationFrame(animate);
    if (devMode) orbit.update();
    renderer.render(scene, camera);
  }
});
