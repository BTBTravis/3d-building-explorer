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
    }
  }
});
// load our modules in this order then run our code.
requirejs(['THREE', 'ColladaLoader', 'OrbitControls', 'TweenMax'], function (THREE) {
  var camera, scene, renderer, orbit;
  var modelRef = {};
  init();
  animate();
  function init () {
    // camera setup
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 20;
    camera.position.y = 35;
    camera.position.z = 75;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // orbit setup
    orbit = new THREE.OrbitControls(camera);
    orbit.maxPolarAngle = 1.4095;
    orbit.minPolarAngle = 1.0799;
    orbit.enablePan = false;
    orbit.enableZoom = false;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'p') console.log({orbit: orbit.getPolarAngle()});
      else if (e.key === 'r') console.log({modelRef: modelRef});
      else if (e.key === '='){
        modelRef.outerShell.map((mesh) => {
          mesh.material.opacity += 0.0005;
        });
      }
      else if (e.key === '-'){
        modelRef.outerShell.map((mesh) => {
          mesh.material.opacity -= 0.0005;
        });
      }
    });

    // scene setup
    scene = new THREE.Scene();

    // lights
    var light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.rotation.z = 25;
    scene.add(directionalLight);

    // sketchup import
    var loader = new THREE.ColladaLoader();
    loader.load('models/arts_center_002.dae', function (result) {
      console.log({ result: result });
      var model = result.scene;
      // Grab all the meshes from the scene
      var meshes = result.scene.children.reduce(function sceneToMeshArray (arr, currentItem) {
        if (currentItem.type === 'Mesh') arr.push(currentItem);
        else if (currentItem.type === 'Group') arr = currentItem.children.reduce(sceneToMeshArray, arr);
        return arr;
      }, []);
      // Get the outer shell by filter from the larges list of meshes
      var outerShell = meshes.filter((mesh) => { return mesh.material.name === 'material_8'; });
      outerShell.map((mesh) => { mesh.material.opacity = 0.1; });
      modelRef.outerShell = outerShell;
      // var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
      // var  =finalMesh new THREE.Mesh(meshGlob, baseMat);
      console.log({ meshes: meshes, outerShell: outerShell });
      // model.material = baseMat;
      scene.add(model);
    });
    // renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0); // the default
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
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
  }
});
