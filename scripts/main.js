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
  var camera, scene, svgScene, renderer, svgRenderer, orbit;
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
    svgScene = new THREE.Scene();

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

    // labels
    var labelNames = [
      'Main lobby & administrative offices',
      'Rehearsal Hall',
      'Pikes Peak',
      'Schauer Theater Entrance ',
      'Art Gallery',
      'Ruth A. Knoll Theater',
      'Restrooms',
      'Lodge/Ante room',
      'Auto Museum'
    ];
    // create a test area where we can caculate the widths of the divs
    // var testArea = document.createElement('div');
    // testArea.id = 'testArea';
    // document.body.appendChild(testArea);
    // var labelWidths = labelNames.map(function (text) {
    //   var newP = document.createElement('p');
    //   newP.appendChild(document.createTextNode(text));
    //   newP.id = 'labelTestWidth';
    //   document.body.appendChild(newP);
    //   var testP = document.getElementById('labelTestWidth');
    //   var width = testP.offsetWidth;
    //   return width;
    // });
    var baseLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    // make svgs out of the text
    var svgText = labelNames.map(function (txt) {
      // text - we have to append the svg to the dom in order to get the actual width of the text used in making the background part of the label
      var svgLabelTxt = baseLabel.cloneNode();
      svgLabelTxt.setAttribute('fill', 'white');
      svgLabelTxt.setAttribute('x', 105);
      svgLabelTxt.setAttribute('y', 15);
      svgLabelTxt.textContent = txt;
      // svg node that will temporarly be on the dom
      var svgParent = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgParent.appendChild(svgLabelTxt);
      document.body.appendChild(svgParent);
      // grab width off the text for later use
      var textWidth = svgLabelTxt.clientWidth;
      //set the svgs width based on the text width so we can see everything.. 
      svgParent.setAttribute('width', textWidth + 110);
      // bg - black box behind the text
      var bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bg.setAttribute('fill', 'black');
      bg.setAttribute('x', 0);
      bg.setAttribute('y', 0);
      bg.setAttribute('d', 'M100,0 H' + (textWidth - 100) + ' V20, H100');
      // line - annotation line from the bottom left cornor of the background box to cords 0, -120
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('fill', 'transparent');
      line.setAttribute('stroke', 'black');
      line.setAttribute('stroke-width', 2);
      line.setAttribute('x', 0);
      line.setAttribute('y', 0);
      line.setAttribute('d', 'M100,20 L0,120');
      svgParent.insertBefore(bg, svgLabelTxt);
      svgParent.insertBefore(line, svgLabelTxt);
      // remove svg from the dom as we will be letting three js handle it
      svgParent.parentNode.removeChild(svgParent);
      return svgParent;
    });
    console.log({svgText: svgText});
    // baseLabel.setAttribute( 'stroke', 'black' );
    // baseLabel.setAttribute( 'fill', 'black' );
    // node.setAttribute( 'r', '40' );
    // no
    var node = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
    node.setAttribute( 'stroke', 'black' );
    node.setAttribute( 'fill', 'red' );
    node.setAttribute( 'r', '40' );
    var labels = svgText.map(function (svg) {
      var parts = Array.from(svg.childNodes);
      var grp = parts.reduce(function (grp, svgPart) {
        grp.add(new THREE.SVGObject(svgPart.cloneNode()));
        return grp;
      }, new THREE.Group());
      grp.position.x = Math.random() * 100 - 50;
      grp.position.y = Math.random() * 100 - 50;
      // object.position.z = 0;
      svgScene.add(grp);
      return grp;
    });
    console.log({labels: labels});
    // for ( var i = 0; i < 50; i ++ ) {
    //   var object = new THREE.SVGObject( node.cloneNode() );
    //   object.position.x = Math.random() * 1000 - 500;
    //   object.position.y = Math.random() * 1000 - 500;
    //   object.position.z = Math.random() * 1000 - 500;
    //   scene.add( object );
    // }

    // renderer setup
    svgRenderer = new THREE.SVGRenderer();
    svgRenderer.setSize(window.innerWidth, window.innerHeight);
    svgRenderer.setClearColor(0x000000, 0); // the default
    svgRenderer.setQuality('low');
    document.body.appendChild(svgRenderer.domElement);

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
    svgRenderer.render(svgScene, camera);
  }
});
