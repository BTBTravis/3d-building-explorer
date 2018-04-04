export default function() {
  let el = document.querySelector('#explorer');
  let badEl = document.querySelector('#exploafdifhdsifrer');
  const min = {
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
    cameraAspectFactor: 0.5,
    materials: [
      { name: 'example_mat_1', color: '#ffffff' },
      { name: 'example_mat_2', color: '#a87f76' },
      { name: 'example_mat_3', color: '#a87f76' },
      { name: 'example_mat_4', color: '#a87f76' }
    ],
    rooms: [
      { room_name: 'example_room_1', rot: -2.7, axisVal: 100 }
    ]
  };
  let missingKey = Object.assign({}, min);
  delete missingKey.orbitMode;

  const invalidMaterial = Object.assign({}, min);
  invalidMaterial.materials = [...min.materials, { name: 'example_mat_5', color: '#dfifhsea87f76'}];

  return {
    empty: {},
    min: min,
    invalidEl: Object.assign({}, min, {el: badEl}),
    missingKey: missingKey,
    invalidMaterial: invalidMaterial
  }
}

