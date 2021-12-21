const canvas = document.getElementById('canvas');
/**
 * @type {CanvasRenderingContext2D}
 */
const context = canvas.getContext('2d');

const calculateRadian = (degrees) => (Math.PI / 180) * degrees;

let image = new Image();

class CanvasView {
  constructor(canvas, context) {
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.context = context;
  }

  translate(dx, dy) {
    this.dx += dx;
    this.dy += dy;
  }

  rotate(degrees) {
    this.degrees += degrees;
  }

  scale(magnification) {
    this.mx += magnification;
    this.my += magnification;
    if (this.mx < 0.1 && this.my < 0.1) {
      this.mx = 0.1;
      this.my = 0.1;
    }
  }
}

class CanvasImage extends CanvasView {
  constructor(canvas, context, image) {
    super(canvas, context);

    this.image = image;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.degrees = 0;
    this.mx = 1.0;
    this.my = 1.0;
    this.isDrawn = false;
  }

  load(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      this.image.src = event.target.result;
    };
    this.isDrawn = true;
  }

  draw() {
    this.context.save();
    this.context.translate(this.dx, this.dy);
    this.context.translate(
      this.image.width / 2 + this.dx,
      this.image.height / 2 + this.dy
    );
    this.context.rotate(calculateRadian(this.degrees));
    this.context.scale(this.mx, this.my);
    this.context.translate(-this.image.width / 2, -this.image.height / 2);
    this.context.drawImage(this.image, this.x, this.y);
    this.context.restore();
  }

  download() {
    const a = document.createElement('a');
    a.href = this.canvas.toDataURL('image/jpeg', 0.85);
    a.download = 'download.jpeg';
    a.click();
  }
}

class CanvasText extends CanvasView {
  constructor(canvas, context) {
    super(canvas, context);

    this.textarea = '';
    this.x2 = 0;
    this.y2 = this.canvas.height / 2;
    this.fontSize = 40;
    this.fontFamily = 'sans-serif';
    this.lineHeight = 1.5;
    this.fontsArray = [];
    this.dx = 0;
    this.dy = 0;
    this.degrees = 0;
    this.mx = 1.0;
    this.my = 1.0;
    this.isDrawn = false;
  }

  draw() {
    this.context.save();
    this.textarea === '' ? (this.isDrawn = false) : (this.isDrawn = true);
    this.context.translate(this.dx, this.dy);
    this.context.translate(
      this.canvas.width / 2 + this.dx,
      this.canvas.height / 2 + this.dy
    );
    this.context.rotate(calculateRadian(this.degrees));
    this.context.scale(this.mx, this.my);
    this.context.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    this.textarea.split('\n').forEach((text, index) => {
      this.context.fillText(
        text,
        this.x2,
        this.y2 + this.fontSize * this.lineHeight * index
      );
    });
    this.context.restore();
  }
}

const canvasImage = new CanvasImage(canvas, context, image);
const canvasText = new CanvasText(canvas, context);

const drawAll = () => {
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  canvasImage.draw();
  canvasText.draw();
};

const fileInput = document.getElementById('file');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (!file) return;

  canvasImage.load(file);
});

image.onload = () => {
  drawAll();
};

const downloadButton = document.getElementById('download-button');
const textarea = document.getElementById('textarea');
const fontRadioButtons = [...document.getElementsByName('fonts')];

downloadButton.addEventListener('click', () => {
  canvasImage.download();
});

textarea.addEventListener('input', (event) => {
  canvasText.textarea = event.currentTarget.value;
  drawAll();
});

fontRadioButtons.forEach((radio) => {
  canvasText.fontsArray.push(radio.value);
});

fontRadioButtons.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    const fontFamilyName = event.currentTarget.value;
    canvasText.fontFamily = fontFamilyName;

    WebFont.load({
      google: {
        families: canvasText.fontsArray,
      },
      active() {
        drawAll();
      },
    });
  });
});

const translateButtons = [...document.querySelectorAll('[data-translate]')];
const rotateButtons = [...document.querySelectorAll('[data-rotate]')];
const scaleButtons = [...document.querySelectorAll('[data-scale]')];

translateButtons.forEach((translateButton) => {
  translateButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const canvasName =
      target.dataset.canvas === 'image' ? canvasImage : canvasText;

    if (!canvasName.isDrawn) return;

    const direction = target.dataset.translate;
    const distance = 10;

    switch (direction) {
      case 'up':
        canvasName.translate(0, -distance);
        break;
      case 'down':
        canvasName.translate(0, distance);
        break;
      case 'left':
        canvasName.translate(-distance, 0);
        break;
      case 'right':
        canvasName.translate(distance, 0);
        break;
      default:
        alert('エラー');
    }

    drawAll();
  });
});

rotateButtons.forEach((rotateButton) => {
  rotateButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const canvasName =
      target.dataset.canvas === 'image' ? canvasImage : canvasText;

    if (!canvasName.isDrawn) return;

    const direction = target.dataset.rotate;
    const degees = 15;

    if (direction === 'right') {
      canvasName.rotate(degees);
    } else if (direction === 'left') {
      canvasName.rotate(-degees);
    } else {
      alert('エラー');
    }

    drawAll();
  });
});

scaleButtons.forEach((scaleButton) => {
  scaleButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const canvasName =
      target.dataset.canvas === 'image' ? canvasImage : canvasText;

    if (!canvasName.isDrawn) return;

    const direction = target.dataset.scale;
    const magnification = 0.2;

    if (direction === 'up') {
      canvasName.scale(magnification);
    } else if (direction === 'down') {
      canvasName.scale(-magnification);
    } else {
      alert('エラー');
    }

    drawAll();
  });
});
