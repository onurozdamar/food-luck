const data = [];

var canvas = document.getElementById("myCanvas");
canvas.width = (window.innerWidth / 100) * 66; // equals window dimension
canvas.height = (window.innerHeight / 100) * 66;
var ctx = canvas.getContext("2d");

const PI = Math.PI;
const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
const wheelX = canvas.width / 2;
const wheelY = canvas.height / 2;
let acc = 3;

let animationAngle = 1;
let animating = false;

var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;
let speed, speedStart;

let idCount = 0;

const form = document.getElementById("form");
const addButton = document.getElementById("add");
const table = document.getElementById("table");

let selectedRow;

const vote_button = document.getElementById("vote-button");
const vote_cancel_button = document.getElementById("vote-cancel-button");
const voteModal = document.getElementById("vote-modal");
const voteModalContent = document.getElementById("vote-modal-content");

const delete_button = document.getElementById("delete-button");
const delete_cancel_button = document.getElementById("delete-cancel-button");
const deleteModal = document.getElementById("delete-modal");
const deleteModalContent = document.getElementById("delete-modal-content");

var particles = [];

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (data.length === 0) {
    circle(wheelX, wheelY, radius, "rgb(151,151,151)");
    return;
  }

  let totalRate = data.reduce((a, b) => a + b?.rate ?? 0, 0);

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

function highlightWinner() {
  let totalRate = data.reduce((a, b) => a + b?.rate ?? 0, 0);

  let angle = 0;
  let winner;
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    let sliceAngle = 2 * PI * (element.rate / totalRate);
    if (
      ((angle + (animationAngle % (2 * PI))) % (2 * PI)) + sliceAngle >
      2 * PI
    ) {
      // console.log("winner", element.title);
      winner = { ...element, angle, sliceAngle };
    }
    angle += sliceAngle;
  }

  ctx.beginPath();
  ctx.moveTo(wheelX, wheelY);
  ctx.arc(
    wheelX,
    wheelY,
    radius,
    winner.angle + animationAngle,
    winner.angle + winner.sliceAngle + animationAngle
  );
  ctx.closePath();
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.stroke();

  spawnPartices();
  animateConfetti();
  let audio = new Audio("./clap.mp3");
  audio.play();
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

function circle(cx, cy, radius, fillcolor) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, 0, 2 * PI);
  ctx.closePath();
  ctx.fillStyle = fillcolor;
  ctx.fill();
}

function random() {
  return Math.floor(Math.random() * 225 + 30);
}

initTable();
drawWheel();

function animate() {
  if (acc <= 0.01 || speed < 0) {
    animating = false;
    highlightWinner();
    return;
  }
  // console.log("v", speed, "a", acc, "r", speed / speedStart);

  animationAngle += ((speed / 2) * PI) / speedStart;
  animationAngle += Math.random() / (2 * PI);
  speed -= Math.max(acc * Math.sign(speed), 0.1);
  acc = (Math.exp(speed / speedStart) * Math.log(speed)) / 10;

  drawWheel();

  requestAnimationFrame(animate);
}

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
  if (animating || speed < 20 || data.length === 0) {
    return;
  }
  // console.log("animate");
  animating = true;
  acc = 3;
  animate();
  drawWheel();
});

function initTable() {
  const defaultData = [
    {
      title: "Tavuk",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 0,
    },
    {
      title: "Döner",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 1,
    },
    {
      title: "Lahmacun",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 2,
    },
    {
      title: "Çıtır",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 3,
    },
    {
      title: "Kajun",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 4,
    },
    {
      title: "Tost",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 5,
    },
    {
      title: "Pizza",
      rate: 1,
      red: random(),
      green: random(),
      blue: random(),
      id: 6,
    },
  ];
  for (let i = 0; i < defaultData.length; i++) {
    const element = defaultData[i];
    addData(element.title, element.rate, i);
  }
}

addButton.addEventListener("click", (event) => {
  const title = document.getElementById("title");
  const rate = document.getElementById("rate");

  if (!title.value) {
    return;
  }

  addData(title.value, rate.value, idCount);

  drawWheel();
});

function addData(title, rate, id) {
  // console.log(index);
  data.push({
    title: title,
    rate: parseInt(rate) || 1,
    red: random(),
    blue: random(),
    green: random(),
    id: id,
  });
  idCount++;
  const row = table.insertRow(data.length);
  row.setAttribute("id", "row-" + id);
  const titleCell = row.insertCell(0);
  const rateCell = row.insertCell(1);

  const rateSpan = document.createElement("span");
  rateSpan.setAttribute("id", "rate-span-" + id);
  const rateTextNode = document.createTextNode(rate || 1);
  rateSpan.appendChild(rateTextNode);
  rateCell.appendChild(rateSpan);

  const vote = document.createElement("div");
  vote.innerHTML = "<i class='fas fa-poll' style='font-size:20px;'></i>";
  vote.setAttribute("class", "table-icon");

  vote.setAttribute("id", "open-modal");
  vote.onclick = () => {
    openVoteModal();
    selectedRow = row;
  };
  rateCell.appendChild(vote);

  const titleTextNode = document.createTextNode(title || 1);
  titleCell.appendChild(titleTextNode);

  const deleteIcon = document.createElement("div");
  deleteIcon.setAttribute("class", "table-icon");
  deleteIcon.innerHTML = "<i class='fas fa-trash'></i>";
  deleteIcon.setAttribute("id", "delete-icon");
  deleteIcon.onclick = () => {
    openDeleteModal();
    selectedRow = row;
  };
  titleCell.appendChild(deleteIcon);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});

vote_button.addEventListener("click", () => {
  handleVote();
});

vote_cancel_button.addEventListener("click", () => {
  closeVoteModal();
});

function openVoteModal() {
  if (animating) {
    return;
  }
  voteModal.style.display = "flex";
}

function closeVoteModal() {
  voteModal.style.display = "none";
}

function handleVote() {
  const range = document.getElementById("vote-range");
  const id = selectedRow.id.split("-")[1];
  const rateCell = document.getElementById("rate-span-" + id);
  rateCell.textContent = parseInt(rateCell.textContent) + parseInt(range.value);
  const item = data.find((i) => i.id == id);
  item.rate += parseInt(range.value);

  drawWheel();
  closeVoteModal();
}

delete_button.addEventListener("click", () => {
  handleDelete();
});
delete_cancel_button.addEventListener("click", () => {
  closeDeleteModal();
});

function openDeleteModal() {
  if (animating) {
    return;
  }
  deleteModal.style.display = "flex";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
}

function handleDelete() {
  const id = selectedRow.id.split("-")[1];
  const item = data.find((i) => i.id == id);
  const index = data.indexOf(item);
  data.splice(index, 1);
  table.childNodes[1].removeChild(selectedRow);

  drawWheel();
  closeDeleteModal();
}

window.addEventListener("click", (e) => {
  if (e.target == voteModal) {
    closeVoteModal();
  }
  if (e.target == deleteModal) {
    closeDeleteModal();
  }
});

const spinButton = document.getElementById("spin");
spinButton.addEventListener("click", () => {
  if (animating || data.length === 0) {
    return;
  }
  // console.log("animate");
  speed = 700;
  speedStart = speed;
  animating = true;
  acc = 3;
  animate();
  drawWheel();
});
/*
  https://codepen.io/zadvorsky/pen/xzhBw
  confetti
*/

function animateConfetti() {
  if (particles.length === 0) {
    return;
  }
  drawWheel();
  particles.forEach(function (p) {
    p.update();
    if (p.complete) {
      particles.splice(particles.indexOf(p), 1);
    }
  });

  particles.forEach(function (p) {
    p.draw();
  });

  requestAnimationFrame(animateConfetti);
}

function spawnPartices() {
  for (var i = 0; i < 200; i++) {
    var p0 = new Point(wheelX, wheelY - 64);
    var p1 = new Point(wheelX, 0);
    var p2 = new Point(Math.random() * canvas.width, Math.random() * wheelY);
    var p3 = new Point(Math.random() * canvas.width, canvas.height + 64);

    particles.push(new Particle(p0, p1, p2, p3));
  }
}
Particle = function (p0, p1, p2, p3) {
  this.p0 = p0;
  this.p1 = p1;
  this.p2 = p2;
  this.p3 = p3;

  this.time = 0;
  this.duration = 3 + Math.random() * 2;
  this.color = "hsl(" + Math.floor(Math.random() * 360) + ",100%,50%)";

  this.w = 10;
  this.h = 7;

  this.complete = false;
};
Particle.prototype = {
  update: function () {
    this.time = Math.min(this.duration, this.time + 1 / 60);

    var f = Ease.outCubic(this.time, 0, 1, this.duration);
    var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

    var dx = p.x - this.x;
    var dy = p.y - this.y;

    this.r = Math.atan2(dy, dx) + PI / 2;
    this.sy = Math.sin(Math.PI * f * 10);
    this.x = p.x;
    this.y = p.y;

    this.complete = this.time === this.duration;
  },
  draw: function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r);
    ctx.scale(1, this.sy);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

    ctx.restore();
  },
};
Point = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};
/////////////////////////////
// math
/////////////////////////////
/**
 * easing equations from http://gizma.com/easing/
 * t = current time
 * b = start value
 * c = delta value
 * d = duration
 */
var Ease = {
  inCubic: function (t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
  },
  outCubic: function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  },
  inOutCubic: function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  },
  inBack: function (t, b, c, d, s) {
    s = s || 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
};

function cubeBezier(p0, c0, c1, p1, t) {
  var p = new Point();
  var nt = 1 - t;

  p.x =
    nt * nt * nt * p0.x +
    3 * nt * nt * t * c0.x +
    3 * nt * t * t * c1.x +
    t * t * t * p1.x;
  p.y =
    nt * nt * nt * p0.y +
    3 * nt * nt * t * c0.y +
    3 * nt * t * t * c1.y +
    t * t * t * p1.y;

  return p;
}
