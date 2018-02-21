var fs = require('fs');
var path = require('path');
var colors = require('colors');

const possibleTextColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'grey'];
const possibleBackgroundColors = ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite'];
// fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log'));
const cpFile = function (file, destDir) {
  let fileName = path.basename(file);
  let source = fs.createReadStream(file);
  var dest = fs.createWriteStream(path.resolve(destDir, fileName));

  source.pipe(dest);
  source.on('end', function () {
    let randomTextColor = possibleTextColors[Math.floor(Math.random()*possibleTextColors.length)];
    let randomBackgroundColor = possibleBackgroundColors[Math.floor(Math.random()*possibleBackgroundColors.length)];
    console.log(
      colors[randomTextColor][randomBackgroundColor]('Successfully copied: ' + file + ' at ' + Date.now())
    );
  });
  source.on('error', function () {
    console.log(colors.red('Error copying: ' + file));
  });
};

// deployment files
// cpFile('./scripts/main.js', './svgs/');


cpFile('./build/building_explorer.js', '/Volumes/byte/ca.office.diedrick.com/htdocs/the_mansion/');
