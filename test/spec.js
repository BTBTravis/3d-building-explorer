export default function() {
  let el = document.querySelector('#explorer');
  let badEl = document.querySelector('#exploafdifhdsifrer');
  let min = {
    el: el,
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
    }
  };
  let missingKey = Object.assign({}, min);
  delete missingKey.orbitMode;

  return {
    empty: {},
    min: min,
    invalidEl: Object.assign({}, min, {el: badEl}),
    missingKey: missingKey
  }
}
//export function diag(x, y) {
      //return sqrt(square(x) + square(y));
//}

