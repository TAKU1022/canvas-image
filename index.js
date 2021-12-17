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
  }

  load(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      this.image.src = event.target.result;
    };
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

    this.text = '';
    this.x2 = 40;
    this.y2 = this.canvas.height / 2;
    this.size = 80;
    this.font = 'serif';
  }

  draw() {
    this.context.save();
    this.context.font = `${this.size}px ${this.font}`;
    this.context.fillText(this.text, this.x2, this.y2);
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
  canvasImage.draw();
};

const form = document.getElementById('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const input = event.currentTarget.firstElementChild;
  canvasText.text = input.value;
  canvasText.draw();
});

const downloadButton = document.getElementById('download-button');
const translateButtons = [...document.querySelectorAll('[data-translate]')];
const rotateButtons = [...document.querySelectorAll('[data-rotate]')];
const scaleButtons = [...document.querySelectorAll('[data-scale]')];

downloadButton.addEventListener('click', () => {
  canvasImage.download();
});

translateButtons.forEach((translateButton) => {
  translateButton.addEventListener('click', (event) => {
    if (!canvasImage.image.src) return;

    const target = event.currentTarget;
    const direction = target.dataset.translate;
    const distance = 10;

    switch (direction) {
      case 'up':
        canvasImage.translate(0, -distance);
        break;
      case 'down':
        canvasImage.translate(0, distance);
        break;
      case 'left':
        canvasImage.translate(-distance, 0);
        break;
      case 'right':
        canvasImage.translate(distance, 0);
        break;
      default:
        alert('エラー');
    }

    drawAll();
  });
});

rotateButtons.forEach((rotateButton) => {
  rotateButton.addEventListener('click', (event) => {
    if (!canvasImage.image.src) return;

    const target = event.currentTarget;
    const direction = target.dataset.rotate;
    const degees = 15;

    if (direction === 'right') {
      canvasImage.rotate(degees);
    } else if (direction === 'left') {
      canvasImage.rotate(-degees);
    } else {
      alert('エラー');
    }

    drawAll();
  });
});

scaleButtons.forEach((scaleButton) => {
  scaleButton.addEventListener('click', (event) => {
    if (!canvasImage.image.src) return;

    const target = event.currentTarget;
    const direction = target.dataset.scale;
    const magnification = 0.2;

    if (direction === 'up') {
      canvasImage.scale(magnification);
    } else if (direction === 'down') {
      canvasImage.scale(-magnification);
    } else {
      alert('エラー');
    }

    drawAll();
  });
});
