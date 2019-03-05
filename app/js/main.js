// NOTE: you can use CommonJS here, for instance:
// var foo = require("npm-dependency");
// var bar = require("./path/to/local/file_without_extension");
// module.exports = someVariable;

// grab DOM elements inside index.html

var fileSelector = document.getElementById('fileSelector');
var imageContainer = document.getElementById('imageContainer');
var debugContainer = document.getElementById('debugContainer');
var generateButton = document.getElementById('generateButton');
var backgroundImage = document.getElementById('backgroundImage');
var canvas = document.getElementById('canvas');
var sizeControllerWrap = document.getElementById('sizeControllerWrap');
var sizeController = document.getElementById('sizeController');
var sizeControlProgress = document.getElementById('sizeControlProgress');
var editor;

// some functions to get you started !!

function log(msg) {
  // show debug/state message on screen
  debugContainer.innerHTML += '<p>' + msg + '</p>';
}

function photoEditor(
  backgroundImage, canvas, image, imageContainer, sizeControllerWrap,
  sizeController, sizeControlProgress) {
  const description = {};
  const context = canvas.getContext('2d');
  const containerWidth = 600;
  const containerHeight = 600;
  const canvasWidth = 450;
  const canvasHeight = 300;
  const canvasLeftPadding = (containerWidth - 450) / 2;
  const canvasTopPadding = (containerHeight - 300) / 2;
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  const isLandscape = imageWidth > imageHeight;
  const imageContainerStartPosition = {};
  const sizeControllerStartPosition = {};
  let currentBackgroundImageInfo = {};
  let isSizeControllerDragging = false;
  let isDragging = false;

  var ret = {
    start: function() {
      backgroundImage.src = image.src;
      this.initBackgroundImageSizeAndPosition();
      this.initSizeControl();
      imageContainer.addEventListener('mousedown', (e) => {
        console.log('mousedown>>>>>>>>>>>>>>>>>>>');
        isDragging = true;
        imageContainerStartPosition.x = e.clientX;
        imageContainerStartPosition.y = e.clientY;
        imageContainerStartPosition.imageX = currentBackgroundImageInfo.x;
        imageContainerStartPosition.imageY = currentBackgroundImageInfo.y;
      });
      imageContainer.addEventListener('mouseup', (e) => {
        console.log('mouseup');
        isDragging = false;
      });
      imageContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) {
          return;
        }
        // move the background image
        const moveX = e.clientX - imageContainerStartPosition.x;
        const moveY = e.clientY - imageContainerStartPosition.y;
        const imageX = imageContainerStartPosition.imageX;
        const imageY = imageContainerStartPosition.imageY;
        let finalX = imageX + moveX;
        let finalY = imageY + moveY;
        this.updateBackgroundImageSizeAndPosition(finalX, finalY,
          currentBackgroundImageInfo.width, currentBackgroundImageInfo.height);
      });
    },

    initSizeControl: function() {
      console.log('initSizeControl');
      sizeControllerWrap.addEventListener('mousedown', (e) => {
        console.log('mousedown');
        isSizeControllerDragging = true;
        sizeControllerStartPosition.left = sizeController.style.left ? parseInt(sizeController.style.left) : 0;
        sizeControllerStartPosition.x = e.clientX;
        sizeControllerStartPosition.y = e.clientY;
      });
      sizeControllerWrap.addEventListener('mouseup', (e) => {
        console.log('mouseup');
        isSizeControllerDragging = false;
      });
      sizeControllerWrap.addEventListener('mousemove', (e) => {
        if (!isSizeControllerDragging) {
          return;
        }
        const moveX = e.clientX - sizeControllerStartPosition.x;
        let finalX = sizeControllerStartPosition.left + moveX;
        if (finalX < 0) {
          finalX = 0;
        }
        if (finalX > 300) {
          finalX = 300;
        }
        sizeController.style.left = finalX + 'px';
        this.updateImageSizeWithControl(finalX);
      });
    },

    updateImageSizeWithControl: function(size) {
      let scale = 1;
      if (size > 1) {
        scale = (1 + size / 100).toFixed(2);
      }
      if (scale > 5) {
        scale = 5;
      }
      const width = currentBackgroundImageInfo.orginalWidth * scale;
      const height = currentBackgroundImageInfo.orginalWidth * scale;
      const xNeedMove = (width - currentBackgroundImageInfo.width) / 2;
      const yNeedMove = (height - currentBackgroundImageInfo.height) / 2;
      const x = currentBackgroundImageInfo.x - xNeedMove;
      const y = currentBackgroundImageInfo.y - yNeedMove;
      this.updateBackgroundImageSizeAndPosition(x, y, width, height);

    },

    initBackgroundImageSizeAndPosition: function() {
      console.log(isLandscape);
      if (isLandscape) {
        const width = imageWidth / imageHeight * containerWidth;
        currentBackgroundImageInfo.orginalWidth = width;
        currentBackgroundImageInfo.orginalHeight = containerHeight;
        this.updateBackgroundImageSizeAndPosition(0, 0, width, containerHeight);
      } else {
        const height = imageHeight / imageWidth * containerHeight;
        currentBackgroundImageInfo.orginalWidth = containerWidth;
        currentBackgroundImageInfo.orginalHeight = height;
        this.updateBackgroundImageSizeAndPosition(0, 0, containerWidth, height);
      }
    },
    updateBackgroundImageSizeAndPosition: function(x, y, width, height) {
      console.log('updateBackgroundImageSizeAndPosition: x=' + x + ', y=' + y +
        ', width=' + width + ', height=' + height);
      const maxX = canvasLeftPadding;
      const maxY = canvasTopPadding;
      // minX + currentBackgroundImageInfo.width > canvasLeftPadding + canvasWidth;
      const minX = canvasLeftPadding + canvasWidth -
        currentBackgroundImageInfo.width;
      const minY = canvasTopPadding + canvasHeight -
        currentBackgroundImageInfo.height;
      let left = x;
      let top = y;
      if (left > maxX) {
        left = maxX;
      }
      if (top > maxY) {
        top = maxY;
      }
      if (left < minX) {
        left = minX;
      }
      if (top < minY) {
        top = minY;
      }

      backgroundImage.style.left = left + 'px';
      backgroundImage.style.top = top + 'px';
      backgroundImage.style.width = width + 'px';
      backgroundImage.style.height = height + 'px';
      currentBackgroundImageInfo = Object.assign(currentBackgroundImageInfo, {
        x: left,
        y: top,
        width: width,
        height: height,
      });
      this.updateCanvasDisplay();
    },

    updateCanvasDisplay: function() {
      const x = canvasLeftPadding - currentBackgroundImageInfo.x;
      const y = canvasTopPadding - currentBackgroundImageInfo.y;
      console.log('updateCanvasDisplay : x=' + x + ', y=' + y + ', width=' + currentBackgroundImageInfo.width +
        ', height=' + currentBackgroundImageInfo.height);
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
            editor = photoEditor(backgroundImage, canvas, img, imageContainer, sizeControllerWrap, sizeController,
              sizeControlProgress);
            editor.start();

          };
          // do your magic here...i do it above..
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

