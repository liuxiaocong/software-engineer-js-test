const photoEditor = (
  backgroundImage,
  canvas,
  loadedImage,
  imageContainer,
  sizeControllerWrap,
  sizeController,
  sizeControlProgress,
  loadPreviousButton,
  readerResult,
  fileName,) => {
  const inchToPx = 96;
  const targetWidth = inchToPx * 15; // inches
  const context = canvas.getContext('2d');
  const containerWidth = 600;
  const containerHeight = 600;
  const canvasWidth = 450;
  const canvasHeight = 300;
  const covertRate = targetWidth / 450;
  const canvasLeftPadding = (containerWidth - 450) / 2;
  const canvasTopPadding = (containerHeight - 300) / 2;
  const imageContainerStartPosition = {};
  const sizeControllerStartPosition = {};
  const maxScaleTimes = 5;
  const lastDescriptionKey = 'canvas_last_description';
  const lastImageDataKey = 'canvas_last_image_data';
  const description = {
    lastDescription: null,
    lastImageData: null,
  };
  description.lastImageData = localStorage.getItem(lastImageDataKey);
  description.last = localStorage.getItem(lastDescriptionKey);
  let image = loadedImage;
  let imageWidth = image.naturalWidth;
  let imageHeight = image.naturalHeight;
  let isLandscape = imageWidth > imageHeight;
  let minScaleTimes = 1;
  let initSizeControlPosition = 1;
  let sizeControlStep = (maxScaleTimes + minScaleTimes - 1) / 300;
  let currentBackgroundImageInfo = {};
  let isSizeControllerDragging = false;
  let isDragging = false;

  var ret = {
    start: function() {
      backgroundImage.src = image.src;
      this.initBackgroundImageSizeAndPosition();
      this.initSizeControl();
      this.detectLastAction();
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
      if (currentBackgroundImageInfo.orginalHeight / canvasHeight >
        currentBackgroundImageInfo.orginalWidth / canvasWidth) {
        minScaleTimes = 1 / (currentBackgroundImageInfo.orginalWidth / canvasWidth);
      } else {
        minScaleTimes = 1 / (currentBackgroundImageInfo.orginalHeight / canvasHeight);
      }
      sizeControlStep = (maxScaleTimes + minScaleTimes) / 300;
      initSizeControlPosition = ((1 - minScaleTimes) / sizeControlStep);
      console.log(sizeControlStep);
      console.log(initSizeControlPosition);
      sizeController.style.left = initSizeControlPosition + 'px';

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
        sizeControlProgress.style.width = (finalX / 300) * 100 + '%';
        this.updateImageSizeWithControl(finalX);
      });
    },

    updateImageSizeWithControl: function(sizeControlX) {
      let scale = 1 + (sizeControlX - initSizeControlPosition) * sizeControlStep;
      console.log(scale);
      if (scale < minScaleTimes) {
        scale = minScaleTimes;
      }
      if (scale > maxScaleTimes) {
        scale = maxScaleTimes;
      }
      console.log(scale);
      let width = currentBackgroundImageInfo.orginalWidth * scale;
      let height = currentBackgroundImageInfo.orginalHeight * scale;
      if (width < canvasWidth) {
        width = canvasWidth;
        height = currentBackgroundImageInfo.orginalHeight / currentBackgroundImageInfo.orginalWidth * width;
      }
      if (height < canvasHeight) {
        height = canvasHeight;
        width = currentBackgroundImageInfo.orginalWidth / currentBackgroundImageInfo.orginalHeight * height;
      }
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
      console.log(left);
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

    detectLastAction: function() {
      if (description.lastImageData && description.lastDescription) {
        loadPreviousButton.style.display = 'inline-block';
      }
    },

    showDescription: function() {
      console.log(canvasLeftPadding);
      console.log(backgroundImage.x);
      const data = {
        'canvas': {
          'width': 15,
          'height': 10,
          'photo': {
            'id': fileName,
            'width': (currentBackgroundImageInfo.width * covertRate / inchToPx).toFixed(2),
            'height': (currentBackgroundImageInfo.height * covertRate / inchToPx).toFixed(2),
            'x': ((canvasLeftPadding - currentBackgroundImageInfo.x) * covertRate / inchToPx).toFixed(2),
            'y': ((canvasTopPadding - currentBackgroundImageInfo.y) * covertRate / inchToPx).toFixed(2),
          },
        },
      };
      description.lastDescription = data;
      description.lastImageData = readerResult;
      loadPreviousButton.style.display = 'inline-block';

      localStorage.setItem(lastDescriptionKey, data);
      localStorage.setItem(lastImageDataKey, readerResult);
      console.log('current x:' + currentBackgroundImageInfo.x);
      console.log('current y:' + currentBackgroundImageInfo.y);
      alert(JSON.stringify(data));
    },

    restoreLastDescription: function() {
      if (description.lastImageData && description.lastDescription) {
        let img = new Image();
        img.src = description.lastImageData;
        let that = this;
        img.onload = function() {
          // grab some data from the image
          let imageData = {
            'width': img.naturalWidth,
            'height': img.naturalHeight,
          };
          image = img;
          imageWidth = image.naturalWidth;
          imageHeight = image.naturalHeight;
          isLandscape = imageWidth > imageHeight;
          that.start();
          const toX = canvasLeftPadding - description.lastDescription.canvas.photo.x * inchToPx / covertRate;
          const toY = canvasTopPadding - description.lastDescription.canvas.photo.y * inchToPx / covertRate;
          console.log('to x:' + toX);
          console.log('to y:' + toY);
          that.updateBackgroundImageSizeAndPosition(toX, toY,
            description.lastDescription.canvas.photo.width * inchToPx / covertRate,
            description.lastDescription.canvas.photo.height * inchToPx / covertRate);
        };
      }
    },
  };
  return ret;
};

module.exports = photoEditor;