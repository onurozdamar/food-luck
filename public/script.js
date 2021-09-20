const data = [
  {
    title: "Tavuk",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 0,
  },
  {
    title: "Döner",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 1,
  },
  {
    title: "Lahmacun",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 2,
  },
  {
    title: "Çıtır",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 3,
  },
  {
    title: "Kajun",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 4,
  },
  {
    title: "Tost",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 5,
  },
  {
    title: "Pizza",
    rate: 1,
    red: random(),
    green: random(),
    blue: random(),
    index: 6,
  },
];

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

drawWheel();

let acc = 3;

function animate() {
  if (acc <= 0.01) {
    animating = false;
    return;
  }
  // console.log("v", speed, "a", acc, "r", speed / speedStart);

  animationAngle += ((speed / 2) * PI) / speedStart;
  animationAngle += Math.random() / (2 * PI);
  speed -= Math.max(acc * Math.sign(speed), 0.1);
  acc = Math.log(speed * 10) / 10;

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
  if (animating || speed < 20) {
    return;
  }
  // console.log("animate");
  animating = true;
  acc = 3;
  animate();
  drawWheel();
});

const form = document.getElementById("form");
const addButton = document.getElementById("add");
const table = document.getElementById("table");

initTable();

function initTable() {
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    addData(element.title, element.rate, i);
  }
}

addButton.addEventListener("click", (event) => {
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
    index: data.length,
  });
  addData(title.value, rate.value, data.length - 1);

  drawWheel();
});

let selectedIndex = 0;

function addData(title, rate, index) {
  // console.log(index);
  const row = table.insertRow(index + 1);
  const titleCell = row.insertCell(0);
  const rateCell = row.insertCell(1);

  const rateSpan = document.createElement("span");
  rateSpan.setAttribute("id", "rate-span-" + index);
  const rateTextNode = document.createTextNode(rate || 1);
  rateSpan.appendChild(rateTextNode);
  rateCell.appendChild(rateSpan);

  const vote = document.createElement("div");
  vote.innerHTML = "<i class='fas fa-poll' style='font-size:20px;'></i>";
  vote.setAttribute("class", "table-icon");

  vote.setAttribute("id", "open-modal");
  vote.onclick = (event) => {
    openModal(event);
    selectedIndex = index;
  };
  rateCell.appendChild(vote);

  const titleTextNode = document.createTextNode(title || 1);
  titleCell.appendChild(titleTextNode);

  const deleteIcon = document.createElement("div");
  deleteIcon.setAttribute("class", "table-icon");
  deleteIcon.innerHTML = "<i class='fas fa-trash'></i>";
  deleteIcon.setAttribute("id", "delete-modal");
  deleteIcon.onclick = (event) => {
    openModal(event);
    selectedIndex = index;
  };
  titleCell.appendChild(deleteIcon);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});

const vote_button = document.getElementById("vote-button");
const vote_cancel_button = document.getElementById("vote-cancel-button");
const modal = document.getElementById("vote-modal");
const modalContent = document.getElementById("vote-modal-content");

vote_button.addEventListener("click", () => {
  handleVote();
});
vote_cancel_button.addEventListener("click", () => {
  closeModal();
});

function openModal(event) {
  modal.style.display = "flex";
  console.log(event.target.offsetTop);
  modalContent.style.top = event.clientY;
  modalContent.style.left = event.clientX;
}

function closeModal() {
  modal.style.display = "none";
}

function handleVote() {
  const range = document.getElementById("vote-range");
  const rateCell = document.getElementById("rate-span-" + selectedIndex);
  rateCell.textContent = parseInt(rateCell.textContent) + parseInt(range.value);
  data[selectedIndex].rate += parseInt(range.value);

  drawWheel();
  closeModal();
}

window.addEventListener("click", (e) => {
  if (e.target == modal) {
    closeModal();
  }
});
