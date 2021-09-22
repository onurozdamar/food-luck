const data = [];

const form = document.getElementById("form");
const leftDiv = document.getElementById("left-div");

var canvas = document.getElementById("myCanvas");
canvas.width = form.clientWidth;
canvas.height = window.innerHeight - form.clientHeight - 50;
var ctx = canvas.getContext("2d");

const PI = Math.PI;
let radius = Math.min(canvas.width, canvas.height) / 2 - 40;
const wheelX = canvas.width / 2;
const wheelY = canvas.height / 2;
let acc = 3;

let animationAngle = 1;
let animating = false;
let winner;

var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;
let speed, speedStart;

let idCount = 0;

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

const rangeContainer = document.getElementById("range-container");
const createRangeButton = document.getElementById("create-range-button");

const spinButton = document.getElementById("spin");

const winnerSpan = document.getElementById("winner");
const winnerText = document.getElementById("winner-text");

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

  if (winner) {
    arc(winner);
  }
}

function highlightWinner() {
  let totalRate = data.reduce((a, b) => a + b?.rate ?? 0, 0);

  let angle = 0;
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
  arc(winner);

  winnerSpan.textContent = winner.title;
  winnerText.style.display = "block";
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

function arc(winner) {
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
}

function random() {
  return Math.floor(Math.random() * 225 + 30);
}

initTable();
drawWheel();

function animate() {
  if (acc <= 0.0000001 || speed < 0) {
    animating = false;
    highlightWinner();
    spawnPartices();
    animateConfetti();
    let audio = new Audio("./clap.mp3");
    audio.play();
    return;
  }
  // console.log("v", speed, "a", acc, "r", speed / speedStart);

  animationAngle += ((speed / 2) * PI) / speedStart;
  animationAngle += Math.random() / (2 * PI);
  speed -= Math.max(acc * Math.sign(speed), 0.1);
  acc = Math.exp(speed / speedStart) * Math.log(speed) * (speed / speedStart);
  // acc =
  //   Math.exp(speed / speedStart, 2) *
  //   Math.exp(speed / speedStart, 2) *
  //   Math.exp(speed / speedStart, 2) *
  //   Math.log(speed) *
  //   Math.log(speed) *
  //   (speed / speedStart);

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
  winnerText.style.display = "none";
  animating = true;
  winner = null;
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
  vote.innerHTML =
    "<i class='fas fa-poll' style='font-size:20px; color:rgb(12,255,123)'></i>";
  vote.setAttribute("class", "table-icon");

  vote.setAttribute("id", "open-modal");
  vote.onclick = () => {
    selectedRow = row;
    openVoteModal();
  };
  rateCell.appendChild(vote);

  const titleTextNode = document.createTextNode(title || 1);
  titleCell.appendChild(titleTextNode);

  const deleteIcon = document.createElement("div");
  deleteIcon.setAttribute("class", "table-icon");
  deleteIcon.innerHTML = "<i class='fas fa-trash'></i>";
  deleteIcon.setAttribute("id", "delete-icon");
  deleteIcon.style.color = "rgb(230, 48, 102)";
  deleteIcon.onclick = () => {
    selectedRow = row;
    openDeleteModal();
  };
  titleCell.appendChild(deleteIcon);

  winnerText.style.display = "none";
  winner = null;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});

function createRange(id) {
  const container = document.createElement("div");
  container.style.marginTop = 25;

  const range = document.createElement("input");
  range.setAttribute("id", "vote-range-" + id);
  range.setAttribute("class", "vote-range");
  range.type = "range";
  range.min = 0;
  range.max = 10;
  range.value = 0;
  range.step = 1;

  container.appendChild(range);

  const datalist = document.createElement("datalist");
  for (let index = 0; index <= range.max; index++) {
    const option = document.createElement("option");
    option.textContent = index;
    datalist.appendChild(option);
  }

  container.appendChild(datalist);

  return container;
}

createRangeButton.addEventListener("click", () => {
  const rangeCountInput = document.getElementById("range-count");

  if (rangeCountInput.value === "") {
    return;
  }

  while (rangeContainer.firstChild) {
    rangeContainer.removeChild(rangeContainer.firstChild);
  }

  const rangeCount = parseInt(rangeCountInput.value);

  for (let index = 0; index < rangeCount; index++) {
    const range = createRange();
    rangeContainer.appendChild(range);
  }

  rangeCountInput.value = "";
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
  const id = selectedRow.id.split("-")[1];
  const item = data.find((i) => i.id == id);
  const votingTitle = document.getElementById("voting-title");
  votingTitle.textContent = item.title;
  voteModal.style.display = "flex";
}

function closeVoteModal() {
  voteModal.style.display = "none";
}

function handleVote() {
  let totalVote = 0;

  for (
    let index = 0;
    index < document.getElementById("range-container").childNodes.length;
    index++
  ) {
    const range = rangeContainer.childNodes[index].firstChild;
    totalVote += parseInt(range.value);
  }

  const id = selectedRow.id.split("-")[1];
  const rateCell = document.getElementById("rate-span-" + id);
  rateCell.textContent = parseInt(rateCell.textContent) + totalVote;
  const item = data.find((i) => i.id == id);
  item.rate += totalVote;

  winnerText.style.display = "none";
  winner = null;

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

  winnerText.style.display = "none";
  winner = null;

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

spinButton.addEventListener("click", () => {
  if (animating || data.length === 0) {
    return;
  }
  // console.log("animate");
  winnerText.style.display = "none";
  speed = Math.random() * 300 + 600;
  speedStart = speed;
  animating = true;
  winner = null;
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

window.addEventListener("resize", (e) => {
  canvas.width = form.clientWidth;
  canvas.height = window.innerHeight - form.clientHeight - 50;
  // radius = Math.min(canvas.width, canvas.height) / 2 - 40;
  drawWheel();
});
