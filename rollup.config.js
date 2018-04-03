// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
{
  input: 'lib/3D-Building-Explorer.js',
  output: {
    file: 'dist/3D-Building-Explorer.min.js',
    //format: 'iife',
    format: 'umd',
    sourceMap: 'inline',
    name: 'ThreeDBE'
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    //eslint({
    //exclude: [
    //'src/styles/**',
    //]
    //}),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
},
  {
    input: 'test/test.js',
    output: {
      file: 'dist/test.js',
      //format: 'iife',
      format: 'umd',
      sourceMap: 'inline',
      name: 'test'
    },
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  }
];
