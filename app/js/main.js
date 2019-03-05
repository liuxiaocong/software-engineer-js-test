// NOTE: you can use CommonJS here, for instance:
// var foo = require("npm-dependency");
// var bar = require("./path/to/local/file_without_extension");
// module.exports = someVariable;

// grab DOM elements inside index.html

var fileSelector = document.getElementById('fileSelector');
var imageContainer = document.getElementById('imageContainer');
var debugContainer = document.getElementById('debugContainer');
var generateButton = document.getElementById('generateButton');
var canvas = document.getElementById('canvas');
var backgroundImage = document.getElementById('backgroundImage');
var editor;

// some functions to get you started !!

function log(msg) {
  // show debug/state message on screen
  debugContainer.innerHTML += '<p>' + msg + '</p>';
}

function photoEditor(backgroundImage, canvas, image) {
  let description = {};
  let context = canvas.getContext('2d');
  let containerWidth = 600;
  let containerHeight = 600;
  let canvasWidth = 450;
  let canvasHeight = 300;
  let canvasLeftPadding = (containerWidth - 450) / 2;
  let canvasTopPadding = (containerHeight - 300) / 2;
  let imageWidth = image.naturalWidth;
  let imageHeight = image.naturalHeight;
  let isLandscape = imageWidth > imageHeight;
  let currentBackgroundImageInfo = {};
  var ret = {
    start: function() {
      backgroundImage.src = image.src;
      this.initBackgroundImageSizeAndPosition();
      imageContainer.addEventListener('mousedown', function(e) {
        console.log(e);
      });
    },
    initBackgroundImageSizeAndPosition: function() {
      console.log(isLandscape);
      if (isLandscape) {
        const width = imageWidth / imageHeight * containerWidth;
        this.updateBackgroundImageSizeAndPosition(0, 0, width, containerHeight);
      } else {
        const height = imageHeight / imageWidth * containerHeight;
        this.updateBackgroundImageSizeAndPosition(0, 0, containerWidth, height);
      }
    },
    updateBackgroundImageSizeAndPosition: function(x, y, width, height) {
      console.log('updateBackgroundImageSizeAndPosition: x=' + x + ', y=' + y +
        ', width=' + width + ', height=' + height);
      backgroundImage.style.left = x + 'px';
      backgroundImage.style.top = y + 'px';
      backgroundImage.style.width = width + 'px';
      backgroundImage.style.height = height + 'px';
      currentBackgroundImageInfo = {
        left: x,
        top: y,
        width: width,
        height: height,
      };
      this.updateCanvasDisplay();
    },

    updateCanvasDisplay: function() {
      const x = canvasLeftPadding - currentBackgroundImageInfo.left;
      const y = canvasTopPadding - currentBackgroundImageInfo.top;
      console.log('updateCanvasDisplay : x=' + x + ', y=' + y + ', width=' +
        currentBackgroundImageInfo.width + ', height=' +
        currentBackgroundImageInfo.height);
      //context.drawImage(image, x, y, currentBackgroundImageInfo.width,
      //  currentBackgroundImageInfo.height);

      context.drawImage(image, -x, -y, backgroundImage.width,
        backgroundImage.height);
    },

    setBodyScrollEnable: function(enable) {
      if (enable) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    },
  };
  return ret;
}

fileSelector.onchange = function(e) {
  // get all selected Files
  var files = e.target.files;
  var file;
  for (var i = 0; i < files.length; ++i) {
    file = files[i];
    // check if file is valid Image (just a MIME check)
    switch (file.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        // read Image contents from file
        var reader = new FileReader();
        reader.onload = function(e) {
          // create HTMLImageElement holding image data
          var img = new Image();
          img.src = reader.result;

          img.onload = function() {
            // grab some data from the image
            var imageData = {
              'width': img.naturalWidth,
              'height': img.naturalHeight,
            };
            log('Loaded Image w/dimensions ' + imageData.width + ' x ' +
              imageData.height);
            editor = photoEditor(backgroundImage, canvas, img);
            editor.start();

          };
          // do your magic here...
        };
        reader.readAsDataURL(file);
        // process just one file.
        return;

      default:
        log('not a valid Image file :' + file.name);
    }
  }
};

generateButton.onclick = function(e) {
  log('GENERATE BUTTON CLICKED!! Should this do something else?');
};

log('Test application ready');

