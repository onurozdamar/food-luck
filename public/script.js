const data = [];

var canvas = document.getElementById("myCanvas");
canvas.width = (window.innerWidth / 100) * 66; // equals window dimension
canvas.height = (window.innerHeight / 100) * 66;
var ctx = canvas.getContext("2d");

const PI = Math.PI;
const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
const wheelX = canvas.width / 2;
const wheelY = canvas.height / 2;

let animationAngle = 1;
let animating = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let totalRate = 0;
  data.forEach((element) => {
    totalRate += element.rate;
  });

  let angle = 0;
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    let sliceAngle = 2 * PI * (element.rate / totalRate);
    slice(
      wheelX,
      wheelY,
      radius,
      angle + animationAngle,
      angle + sliceAngle + animationAngle,
      `rgb(${element.red},${element.green},${element.blue})`,
      element.title
    );
    angle += sliceAngle;
  }

  triangle(
    wheelX + radius,
    wheelY,
    wheelX + radius + 40,
    wheelY - 50,
    wheelX + radius + 40,
    wheelY + 50
  );
}

function slice(cx, cy, radius, startAngle, endAngle, fillcolor, text) {
  if (text.length > 13) {
    text = text.substring(0, 13) + "...";
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = fillcolor;
  ctx.fill();
  ctx.translate(cx, cy);
  ctx.rotate((startAngle + endAngle) / 2);
  ctx.fillStyle = "black";
  ctx.font = "30px Comic Sans MS";
  ctx.fillText(text, Math.max(radius - text.length * 20, 35), 10);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
}

function random() {
  return Math.floor(Math.random() * 225 + 30);
}

drawWheel();

function animate() {
  if (Math.abs(speed) <= 2) {
    animating = false;
    return;
  }
  animationAngle += speed / speedStart;
  animationAngle += Math.random();
  speed -= 3 * Math.sign(speed);
  drawWheel(speed);
  requestAnimationFrame(animate);
}

var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;
let speed, speedStart;

canvas.addEventListener("mousemove", function (e) {
  if (animating) {
    return;
  }
  if (timestamp === null) {
    timestamp = Date.now();
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    return;
  }

  var now = Date.now();
  var dt = now - timestamp;
  var dx = e.screenX - lastMouseX;
  var dy = e.screenY - lastMouseY;
  var vx = Math.round((dx / dt) * 100);
  var vy = Math.round((dy / dt) * 100);

  speed = Math.min(Math.sqrt(vx * vx + vy * vy), 700);
  speedStart = speed;

  timestamp = now;
  lastMouseX = e.screenX;
  lastMouseY = e.screenY;
});

canvas.addEventListener("mouseup", function (e) {
  animating = true;
  animate();
  drawWheel();
});

const form = document.getElementById("form");
const addButton = document.getElementById("add");
const table = document.getElementById("table");

addButton.addEventListener("click", () => {
  const title = document.getElementById("title");
  const rate = document.getElementById("rate");

  if (!title.value) {
    return;
  }
  data.push({
    title: title.value,
    rate: parseInt(rate.value) || 1,
    red: random(),
    blue: random(),
    green: random(),
  });

  const row = table.insertRow(data.length);
  const titleCell = row.insertCell(0);
  const rateCell = row.insertCell(1);

  titleCell.textContent = title.value;
  rateCell.textContent = rate.value || 1;

  drawWheel();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});
