var fs = require('fs');
var path = require('path');

// fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log'));
const cpFile = function (file, destDir) {
  let fileName = path.basename(file);
  let source = fs.createReadStream(file);
  var dest = fs.createWriteStream(path.resolve(destDir, fileName));

  source.pipe(dest);
  source.on('end', function () {
    console.log('Successfully copied: ' + file + ' at ' + Date.now());
  });
  source.on('error', function () {
    console.log('Error copying: ' + file);
  });
};

// deployment files
// cpFile('./scripts/main.js', './svgs/');
cpFile('./scripts/main.js', '/Volumes/byte/schauer.office.diedrick.com/htdocs/assets/js/3D/scripts/');
