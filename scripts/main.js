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
  function init () {
    return new Promise((resolve, reject) => {
      // camera setup
      // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 10000);
      camera = new THREE.PerspectiveCamera(70, 730 / 350, 100, 10000);
      camera.position.x = 800;
      camera.position.y = 1400;
      camera.position.z = 3000;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // orbit setup
      orbit = new THREE.OrbitControls(camera);
      orbit.maxPolarAngle = 1.4095;
      orbit.minPolarAngle = 1.0799;
      orbit.enablePan = false;
      orbit.enableZoom = false;
      // TODO: Remove this dev code
      document.addEventListener('keydown', (e) => {
        if (e.key === 'p') console.log({ orbit: orbit.getPolarAngle() });
        else if (e.key === 'r') console.log({ modelRef: modelRef });
        else if (e.key === '=') {
          modelRef.outerShell.map((mesh) => {
            mesh.material.opacity += 0.0005;
          });
        } else if (e.key === '-') {
          modelRef.outerShell.map((mesh) => {
            mesh.material.opacity -= 0.0005;
          });
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

      // sketchup import
      var loader = new THREE.ColladaLoader();
      loader.load('models/arts_center_003.dae', function (result) {
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
        // Get the outer shell by filter from the larges list of meshes
        var outerShell = meshes.filter((mesh) => { return mesh.material.name === 'material_8'; });
        outerShell.map((mesh) => { mesh.material.opacity = 0.1; });
        modelRef.outerShell = outerShell;
        // move labels into place
        var locationCubes = meshes.filter((mesh) => { return mesh.material.name === 'location'; });

        locationCubes.map(function (mesh) {
          // mesh.position.set(1, -100, 1);
        });
        locationCubes[6].material = new THREE.MeshBasicMaterial({ color: 'green' });
        var labelPairs = {
          'mlao': 0,
          'rh': 1,
          'pp': 2,
          'ste': 3,
          'ag': 4,
          'lar': 5,
          'rakt': 6,
          'am': 7
        };
        labels = labels.map(function (l) {
          var key = l.id.match(/label_(.+)/);
          key = labelPairs[key[1]];
          return [l, locationCubes[key]];
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
    orbit.update();
    renderer.render(scene, camera);

    // update label pos
    // pair = [label, wayfinding mesh]
    labels.map(function (pair) {
      // console.log(typeof pair);
      if (typeof pair !== 'object') return pair;
      // translate 3d space to screen space
      var vector = new THREE.Vector3();
      var widthHalf = 0.5 * renderer.context.canvas.width;
      var heightHalf = 0.5 * renderer.context.canvas.height;
      pair[1].updateMatrixWorld();
      vector.setFromMatrixPosition(pair[1].matrixWorld);
      vector.project(camera);
      vector.x = (vector.x * widthHalf) + widthHalf;
      vector.y = - (vector.y * heightHalf) + heightHalf;
      pair[0].setAttribute('transform', 'translate(' + vector.x + ', ' + (vector.y - pair[0].clientHeight) + ')');
    });
  }
});
