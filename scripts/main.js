// using requrie js to make sure we have all our dependinces
define('THREE', ['scripts/three.js'], function (THREE) {
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
  var camera, scene, svgScene, renderer, svgRenderer, orbit, labels;
  var createDebugLine;
  var modelRef = {};
  init().then(function (x) {
    animate();
  });

  // animate();
  function init() {
    return new Promise((resolve, reject) => {
      // camera setup
      // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000);
      camera = new THREE.PerspectiveCamera(70, 730 / 350, 100, 10000);
      camera.position.x = 800;
      camera.position.y = 1400;
      camera.position.z = 3000;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // orbit setup
      // orbit = new THREE.OrbitControls(camera);
      // orbit.maxPolarAngle = 1.4095;
      // orbit.minPolarAngle = 1.0799;
      // orbit.enablePan = false;
      // orbit.enableZoom = false;
      // TODO: Remove this dev code
      document.addEventListener('keydown', (e) => {
        if (e.key === 't') {
          console.log({ cameraMatrix: camera.matrix });
        } else if (e.key === 'p') {
          console.log(JSON.stringify({ pos: camera.position, rot: camera.rotation }));
        }
      });

      // scene setup
      scene = new THREE.Scene();
      svgScene = new THREE.Scene();
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
      var light = new THREE.AmbientLight(0x404040); // soft white light
      scene.add(light);
      var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.rotation.z = 25;
      scene.add(directionalLight);

      // story
      var story = [
        JSON.parse('{"pos":{"x":1044.3997622628433,"y":486.5492240308088,"z":1905.5138669935534},"rot":{"_x":-0.5808505882666883,"_y":0.5372944004849027,"_z":0.324100659420895,"_order":"XYZ"}}'),
        JSON.parse('{"pos":{"x":730.6354127575622,"y":128.0030142085583,"z":1028.4343024377617},"rot":{"_x":-0.4064187203576492,"_y":0.14101233880097266,"_z":0.060414353626450555,"_order":"XYZ"}}'),
        JSON.parse('{"pos":{"x":738.2024549007263,"y":94.39074553427079,"z":540.7112374330816},"rot":{"_x":-0.1614511234286556,"_y":0.04360276644121213,"_z":0.007099157734345543,"_order":"XYZ"}}'),
        JSON.parse('{"pos":{"x":745.0383793791751,"y":302.0066472602506,"z":95.51077819549289},"rot":{"_x":-0.1613509146310569,"_y":0.025899678967797633,"_z":0.00421508729592851,"_order":"XYZ"}}'),
        JSON.parse('{"pos":{"x":975.8515838744166,"y":479.8178013909712,"z":-227.29822519295607},"rot":{"_x":-2.5082220017296644,"_y":0.6493228714475728,"_z":2.7237508833819373,"_order":"XYZ"}}'),
        JSON.parse('{"pos":{"x":968.1633447649247,"y":383.82860360655764,"z":747.6106659259037},"rot":{"_x":-0.5789440233084452,"_y":0.730125913961676,"_z":0.4111234185416686,"_order":"XYZ"}}'),
      ];
      story.map((data, i) => {
        console.log({ data: data, i: i });
        document.addEventListener('keydown', (e) => {
          if (e.key == i) {
            var goalPos = data.pos;
            var start = {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z,
              xr: camera.rotation.x,
              yr: camera.rotation.y,
              zr: camera.rotation.z,
            };
            var tween = TweenLite.to(start, 1, {
              x: data.pos.x,
              y: data.pos.y,
              z: data.pos.z,
              xr: data.rot._x,
              yr: data.rot._y,
              zr: data.rot._z,
              onUpdate: updateCameraPos1
            });
            // each time the tween updates this function will be called.
            function updateCameraPos1() {
              // console.log({ startPos: startPos, goalPos: goalPos });
              camera.position.set(start.x, start.y, start.z);
              // var newRot = new THREE.Euler(start.xr, start.yr, start.zr, 'XYZ');
              // camera.setRotationFromEuler(newRot);
              // camera.rotateX(start.xr);
              camera.rotation.set(start.xr, start.yr, start.zr, 'XYZ');
              // camera.lookAt(new THREE.Vector3(1000, 0, 0));
              camera.updateMatrix();
            }
          }
        });
      });
      //   // pair.querySelector(rect)
      //   // TODO: reorder labels so you can click them better
      //   pair.elm.querySelector('rect').addEventListener('click', function (e) {
      //     var goalPos = pair.cameraCords;
      //     var startPos = {
      //       x: camera.position.x,
      //       y: camera.position.y,
      //       z: camera.position.z
      //     };
      //     var tween = TweenLite.to(startPos, 1, {x: goalPos.x, y: goalPos.y, z: goalPos.z, onUpdate: updateCameraPos});
      //     // each time the tween updates this function will be called.
      //     function updateCameraPos () {
      //       console.log({startPos: startPos, goalPos: goalPos});
      //       camera.position.set(startPos.x, startPos.y, startPos.z);
      //       camera.lookAt(new THREE.Vector3(0, 0, 0));
      //       camera.updateMatrix();
      //     }
      //   });
      // });

      // sketchup import
      var loader = new THREE.ColladaLoader();
      loader.load('models/arts_center_004.dae', function (result) {
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

        var meshesByMaterial = meshes.reduce(function (obj, mesh) {
          if (typeof obj[mesh.material.name] === 'undefined') obj[mesh.material.name] = [];
          obj[mesh.material.name].push(mesh);
          return obj;
        }, {});
        console.log({ meshesByMaterial: meshesByMaterial });
        // hide location cubes by moving them to a layer that the camera is not rendering
        meshesByMaterial.location.map(function (mesh) {
          mesh.layers.set(2);
        });
        // Get the outer shell by filter from the larges list of meshes
        var outerShell = meshes.filter((mesh) => { return mesh.material.name === 'material_8'; });
        outerShell.map((mesh) => { mesh.material.opacity = 0.1; });
        modelRef.outerShell = outerShell;
        // move labels into place
        var locationCubes = meshesByMaterial.location;
        // locationCubes[6].material = new THREE.MeshBasicMaterial({ color: 'green' });
        var labelPairs = {
          'mlao': {
            cubeIndex: 0,
            cameraCords: {
              x: 1085.423,
              y: 1443.4489,
              z: 2887.6134
            }
          },
          'rh': {
            cubeIndex: 1,
            cameraCords: {
              x: 394.681,
              y: 546.976538,
              z: 3338.419
            }
          },
          'pp': {
            cubeIndex: 2,
            cameraCords: {
              x: -935.137,
              y: 1605.586,
              z: 2854.4014
            }
          },
          'ste': {
            cubeIndex: 3,
            cameraCords: {
              x: 2656.39876,
              y: 1605.58693,
              z: 1402.011
            }
          },
          'ag': {
            cubeIndex: 4,
            cameraCords: {
              x: 2537.9710,
              y: 1605.5869,
              z: -1606.4848
            }
          },
          'lar': {
            cubeIndex: 5,
            cameraCords: {
              x: -2716.7743,
              y: 1605.5869,
              z: 1281.1040
            }
          },
          'rakt': {
            cubeIndex: 6,
            cameraCords: {
              x: 1776.091,
              y: 1605.58693,
              z: -2422.3108
            }
          },
          'am': {
            cubeIndex: 7,
            cameraCords: {
              x: 3287.484237,
              y: 725.11662,
              z: 516.384803
            }
          }
        };
        labels = labels.map(function (l) {
          var key = l.id.match(/label_(.+)/);
          var labelPair = labelPairs[key[1]];
          return {
            elm: l,
            cube: locationCubes[labelPair.cubeIndex],
            cameraCords: labelPair.cameraCords
          };
        });
        // setup camera tweens to locations
        labels.map(function (pair) {
          // pair.querySelector(rect)
          // TODO: reorder labels so you can click them better
          pair.elm.querySelector('rect').addEventListener('click', function (e) {
            var goalPos = pair.cameraCords;
            var startPos = {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z
            };
            var tween = TweenLite.to(startPos, 1, { x: goalPos.x, y: goalPos.y, z: goalPos.z, onUpdate: updateCameraPos });
            // each time the tween updates this function will be called.
            function updateCameraPos() {
              console.log({ startPos: startPos, goalPos: goalPos });
              camera.position.set(startPos.x, startPos.y, startPos.z);
              camera.lookAt(new THREE.Vector3(0, 0, 0));
              camera.updateMatrix();
            }
          });
        });

        // TODO: remove this dev code
        var mats = meshes.reduce((mats, mesh) => {
          if (!mats.includes(mesh.material.name)) mats.push(mesh.material.name);
          return mats;
        }, []);
        // var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
        // var  =finalMesh new THREE.Mesh(meshGlob, baseMat);
        console.log({ locationCubes: locationCubes, mats: mats, meshes: meshes, outerShell: outerShell });
        // model.material = baseMat;
        // locationCubes.map((cube) => scene.add(cube));
        scene.add(model);
        locationCubes.map(function (mesh) {
          console.log({ locationCube: mesh });
        });
        resolve(); // fulfilled
      });
      // labels setup
      labels = document.querySelectorAll('#label_container svg');
      labels = Array.from(labels);
      labels.map(function (svg) {
        var vbox = svg.getAttribute('viewBox');
        var vals = vbox.match(/0 0 (\d*\.?\d*) (\d*\.?\d*)/);
        svg.style.width = vals[1];
        svg.style.height = vals[2];
        svg.style.position = 'absolute';
      });

      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setClearColor(0x000000, 0); // the default
      renderer.setPixelRatio(window.devicePixelRatio);
      // renderer.setPixelRatio(730 / 350);
      renderer.setSize(730, 350);
      document.body.appendChild(renderer.domElement);
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
    // orbit.update();
    renderer.render(scene, camera);

    // update label pos
    // pair = [label, wayfinding mesh]
    labels.map(function (pair) {
      // console.log(typeof pair);
      // translate 3d space to screen space
      var vector = new THREE.Vector3();
      var widthHalf = 0.5 * renderer.context.canvas.width;
      var heightHalf = 0.5 * renderer.context.canvas.height;
      pair.cube.updateMatrixWorld();
      vector.setFromMatrixPosition(pair.cube.matrixWorld);
      vector.project(camera);
      vector.x = (vector.x * widthHalf) + widthHalf;
      vector.y = -(vector.y * heightHalf) + heightHalf;
      // move label into position
      // pair.elm.setAttribute('transform', 'translate(' + vector.x + ', ' + (vector.y - pair.elm.clientHeight) + ')');
      // find label distance from camera
      var cubePos = pair.cube.getWorldPosition();
      var cameraPos = camera.getWorldPosition();
      var disFromCamera = cameraPos.sub(cubePos);
      // fade labels by remaping the distance from camera to opacity on the svg
      // TODO: switch to using three js math's .mapLinear https://threejs.org/docs/#api/math/Math
      function remap(x, inMin, inMax, outMin, outMax) {
        var remapVal = (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        if (remapVal < outMin) remapVal = outMin;
        else if (remapVal > outMax) remapVal = outMax;
        return remapVal;
      }
      var opacity = remap(disFromCamera.length(), 2000, 5000, 0, 0.75);
      pair.elm.style.opacity = 1 - opacity.toFixed(4);
    });
  }
});
