// const data = [{ title: "burger", rate: 2, red: 255, green: 21, blue: 20 }];

var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth / 2; // equals window dimension
canvas.height = window.innerHeight / 2;
var ctx = canvas.getContext("2d");
var cw = canvas.width;
var ch = canvas.height;

var cx = cw / 2;
var cy = ch / 2;
var radius = 135;
var minutes = 0;
var minutesIncrement = 0.334;

animate();

function animate(time) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "indianred";
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.stroke();
  fillWedge(cx, cy, radius, minutesToAngle(0), minutesToAngle(minutes), "gold");
  ctx.stroke();
  minutes += minutesIncrement;
  if (minutes > 60) {
    minutes = 0;
  }
  requestAnimationFrame(animate);
}

var cx = canvas.width / 2;
var cy = canvas.height / 2;
var radius = (Math.min(canvas.width, canvas.height) * 0.9) / 2;
var startMinutes = 0; // start at 12 o'clock
var endMinutes = 5; // end at 5 minutes past 12
var startAngle = minutesToAngle(0); // the angle at 12 o'clock
var endAngle = minutesToAngle(5); // the angle at 5 minutes past 12

// fill the wedge for 5 elapsed minutes
fillWedge(cx, cy, radius, startAngle, endAngle, "gold");

function fillWedge(cx, cy, radius, startAngle, endAngle, fillcolor) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = fillcolor;
  ctx.fill();
}

function minutesToAngle(minutes) {
  var twelveOClock = -Math.PI / 2;
  var fullCircle = Math.PI * 2;
  return twelveOClock + fullCircle * (minutes / 60);
}
