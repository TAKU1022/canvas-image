const canvas = document.getElementById('canvas');
/**
 * @type {CanvasRenderingContext2D}
 */
const context = canvas.getContext('2d');

const calculateRadian = (degrees) => (Math.PI / 180) * degrees;

let image = new Image();

class CanvasView {
  constructor(canvas, context, image) {
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.context = context;
    this.image = image;
    this.x1 = 0;
    this.y1 = 0;
    this.dx1 = 0;
    this.dy1 = 0;
    this.degrees1 = 0;
    this.mx1 = 1.0;
    this.my1 = 1.0;

    this.text = '';
    this.x2 = 40;
    this.y2 = this.canvas.height / 2;
    this.size = 80;
    this.font = 'serif';

    this.image.onload = () => {
      this.draw();
    };
  }

  load(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      this.image.src = event.target.result;
    };
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage() {
    this.context.save();
    this.context.translate(this.dx1, this.dy1);
    this.context.translate(
      this.image.width / 2 + this.dx1,
      this.image.height / 2 + this.dy1
    );
    this.context.rotate(calculateRadian(this.degrees1));
    this.context.scale(this.mx1, this.my1);
    this.context.translate(-this.image.width / 2, -this.image.height / 2);
    this.context.drawImage(this.image, this.x1, this.y1);
    this.context.restore();
  }

  drawText() {
    this.context.save();
    this.context.font = `${this.size}px ${this.font}`;
    this.context.fillText(this.text, this.x2, this.y2);
    this.context.restore();
  }

  draw() {
    this.clear();
    this.drawImage();
    this.drawText();
  }

  download() {
    const a = document.createElement('a');
    a.href = this.canvas.toDataURL('image/jpeg', 0.85);
    a.download = 'download.jpeg';
    a.click();
  }

  translate(dx, dy) {
    if (!this.image.src) return;
    this.dx1 += dx;
    this.dy1 += dy;
    this.draw();
  }

  rotate(degrees) {
    if (!this.image.src) return;
    this.degrees1 += degrees;
    this.draw();
  }

  scale(magnification) {
    if (!this.image.src) return;
    this.mx1 += magnification;
    this.my1 += magnification;
    if (this.mx1 < 0.1 && this.my1 < 0.1) {
      this.mx1 = 0.1;
      this.my1 = 0.1;
    }
    this.draw();
  }
}

const canvasView = new CanvasView(canvas, context, image);

document.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (!file) return;

  canvasView.load(file);
});

const form = document.getElementById('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const input = event.currentTarget.firstElementChild;
  canvasView.text = input.value;
  canvasView.drawText();
});

const downloadButton = document.getElementById('download-button');
const translateButtons = [...document.querySelectorAll('[data-translate]')];
const rotateButtons = [...document.querySelectorAll('[data-rotate]')];
const scaleButtons = [...document.querySelectorAll('[data-scale]')];

downloadButton.addEventListener('click', () => {
  canvasView.download();
});

translateButtons.forEach((translateButton) => {
  translateButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const direction = target.dataset.translate;
    const distance = 10;
    switch (direction) {
      case 'up':
        canvasView.translate(0, -distance);
        break;
      case 'down':
        canvasView.translate(0, distance);
        break;
      case 'left':
        canvasView.translate(-distance, 0);
        break;
      case 'right':
        canvasView.translate(distance, 0);
        break;
      default:
        alert('エラー');
    }
  });
});

rotateButtons.forEach((rotateButton) => {
  rotateButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const direction = target.dataset.rotate;
    const degees = 15;
    if (direction === 'right') {
      canvasView.rotate(degees);
    } else if (direction === 'left') {
      canvasView.rotate(-degees);
    } else {
      alert('エラー');
    }
  });
});

scaleButtons.forEach((scaleButton) => {
  scaleButton.addEventListener('click', (event) => {
    const target = event.currentTarget;
    const direction = target.dataset.scale;
    const magnification = 0.2;
    if (direction === 'up') {
      canvasView.scale(magnification);
    } else if (direction === 'down') {
      canvasView.scale(-magnification);
    } else {
      alert('エラー');
    }
  });
});
