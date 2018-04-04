(function () {
  var el = document.querySelector('#building_explorer');
  var explorer = new ThreeDBE({
    el: el,
    modelUrl: './models/example.dae',
    orbitMode: false,
    debugMode: false,
    initalCameraPos: {
      px: -614.58,
      py: 451.094,
      pz: 1048.455,
      qw: 0.9643,
      qx: -0.1503,
      qy: -0.2149,
      qz: -0.0335
    },
    cameraYoffset: 250,
    materials: [
      { name: 'roof_tile', color: '#a87f76' },
      { name: 'glass_1', color: '#cdd4d7' },
      { name: 'flat_stone_1', color: '#967f75' },
      { name: 'wood_1', color: '#4f4847' },
      { name: 'wood_2', color: '#776a6d' },
      { name: 'black_roofing', color: '#7f7f90' },
      { name: 'brick_1', color: '#9f968a' }
    ],
    cameraAspectFactor: 0.5,
    rooms: [
      {
        room_name: 'example_room_1',
        rot: -2.7,
        axisVal: 100
      }
    ]
  });
}());



