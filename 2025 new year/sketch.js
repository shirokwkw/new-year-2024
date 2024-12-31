const SHELLTYPES = ['simple', 'split', 'burst', 'double', 
    'mega', 'writer', 'pent', 'comet'];
const GRAVITY = 0.2;
var PAUSED = true;
var MUTE = false;

var shells = []; 
var stars  = [];
var sounds = [];

let countdownTime = new Date('December 31, 2024 23:59:59').getTime(); // Set New Year's Eve time
let currentTime;
let fireworkSpamInterval; // Interval for spam fireworks
let fireworkSpamFrequency = 100; // Initial firework frequency (in ms)
let fireworkSpamEndTime = null; // Variable to track when the spam ends

// Preloading sounds to ensure they are loaded before use
function preload() {
  for (let i = 0; i < 3; i++) {
    sounds.push(loadSound('sounds/explosion' + i + '.mp3'));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  strokeWeight(1);
  colorMode(HSB);
  // Test sound autoplay
  sounds[0].play();
}

function draw() {
  translate(width / 2, height);
  background('rgba(0, 0, 0, 0.2)');

  // Remove the exploded shells and burnt-out stars
  shells = shells.filter(shell => !shell.exploded);
  stars = stars.filter(star => star.brt > 0);

  // Draw the shells and stars
  for (let shell of shells) 
    shell.draw();
  for (let star of stars) 
    star.draw();

  // Generate new shell with small probability
  if (random() < 0.03) {
    let s = new Shell();
    shells.push(s);     
  }

  // Calculate remaining time for the countdown
  currentTime = new Date().getTime();
  let timeRemaining = countdownTime - currentTime;

  if (timeRemaining <= 0) {
    // Start spam fireworks after countdown ends, if not already started
    if (!fireworkSpamInterval) {
      startSpamFireworks();
      fireworkSpamEndTime = currentTime + 20000; // Set the spam end time to 20 seconds later
    }
  }

  // Stop the firework spam after 20 seconds
  if (fireworkSpamEndTime && currentTime >= fireworkSpamEndTime) {
    clearInterval(fireworkSpamInterval);
    fireworkSpamInterval = null;
    fireworkSpamEndTime = null; // Reset the end time
  }
}

// Class for Firework Shells
class Shell {
  constructor(position, speed, type, sparkleTrail) {
    if (position == undefined)
      position = createVector(int(random(-width / 4, width / 4)), 0);
    if (speed == undefined)
      speed = createVector(random(-2, 2), -random(11, 16));
    if (sparkleTrail == undefined)
      sparkleTrail = random() < 0.5;
    if (type == undefined) {
      let randIndex = floor(random(0, SHELLTYPES.length));
      type = SHELLTYPES[randIndex];
    }
    this.position = position;
    this.speed = speed;
    this.sparkleTrail = sparkleTrail;
    this.fuse = random(-3, -1);
    this.hue = round(random(0, 360));  // Random hue
    this.saturation = random(50, 100); // Saturation range
    this.brightness = random(70, 100); // Brightness range
    this.type = type;
    this.exploded = false;
  }

  draw() {
    if (this.fuse < this.speed.y) {
      this.explode();
      return;
    }

    if (this.sparkleTrail) {
      let sparkleDir = random(0, TWO_PI);
      let sparkleVel = random(0, 1);
      let sparkleSpd = createVector(sparkleVel * cos(sparkleDir), sparkleVel * sin(sparkleDir))
      let sparklePos = createVector(this.position.x + sparkleSpd.x, 
                                    this.position.y + sparkleSpd.y);
      let s = new Star(sparklePos, sparkleSpd, random(50, 75), 
                      floor(random(20, 40)), floor(random(0,30)));
      stars.push(s);
    }

    stroke(this.hue, this.saturation, this.brightness);
    point(this.position.x, this.position.y);

    this.position.add(this.speed);
    this.speed.y = this.speed.y + GRAVITY;
  }

  drawStars(numStars, velMin, velMax, fadeMin, fadeMax, type, baseDir, angle) {
    for (let i = 0; i < numStars; i++) {
      let dir = random(0, TWO_PI);
      if (baseDir != undefined) 
        dir = baseDir + random(0, PI/angle);
      let vel = random(velMin, velMax);
      let starSpd = createVector(this.speed.x + vel * cos(dir), 
                                 this.speed.y + vel * sin(dir)); 
      let hue = random(0, 360); // Random hue for stars
      let sat = random(50, 100); // Random saturation for stars
      let fade = random(fadeMin, fadeMax);
      let star = new Star(this.position.copy(), starSpd, fade, hue, sat, type);
      stars.push(star);
    }
  }

  explode() {
    if (this.type == 'split') {
      this.drawStars(30, 3, 5, 3, 8, 'writer');
      this.drawStars(10, 3, 5, 3, 6, 'sparkler');
    } else if (this.type == 'burst') {
      this.drawStars(60, 0, 6, 3, 8, 'sparkler');
    } else if (this.type == 'double') {
      this.drawStars(90, 3, 5, 2, 4);
      this.drawStars(90, 0.5, 2, 4, 6, 'writer');            
    } else if (this.type == 'mega') {
      this.drawStars(600, 0, 8, 3, 8);
    } else if (this.type == 'writer') {
      this.drawStars(100, 0, 5, 1, 3, 'writer');
    } else if (this.type == 'simple') {
      this.drawStars(100, 0, 5, 1, 3);
    } else if (this.type == 'pent') {
      let baseDir = random(0, TWO_PI);
      this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (2/5)*PI, 6);
      this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (4/5)*PI, 6);
      this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (6/5)*PI, 6);
      this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (8/5)*PI, 6);
      this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (10/5)*PI, 6);           
    } else if (this.type == 'comet') {
      let baseDir = random(0, TWO_PI);
      this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (2/3)*PI, 128);
      this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (4/3)*PI, 128);
      this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (6/3)*PI, 128);
      this.drawStars(200, 0, 8, 3, 8, 'writer');
    }
    this.exploded = true;
    if (!MUTE) {
      let randIndex = floor(random(0, sounds.length));
      sounds[randIndex].play();
    }        
  }
}

// Star class to represent individual firework particles
class Star {
  constructor(position, speed, fade, hue, sat, type) {
    this.position = position;
    this.speed = speed; 
    this.fade = fade;
    this.hue = hue;
    this.sat = sat;
    this.type = (type == undefined ? "default" : type);
    this.brt = 255;
    this.burntime = 0;
  }

  draw() {
    stroke(this.hue, this.sat, this.brt);
    let newXPos = this.position.x + log(this.burntime) * 8 * this.speed.x;
    let newYPos = this.position.y + log(this.burntime) * 8 * this.speed.y 
                  + this.burntime * GRAVITY;

    point(newXPos, newYPos);

    if (this.type == "writer" && this.burntime > 1) {
      line(newXPos, newYPos, this.position.x + log(this.burntime - 2) * 8 * 
           this.speed.x, this.position.y + log(this.burntime - 2) * 8 * 
           this.speed.y + this.burntime * GRAVITY);
    }

    if (this.type == "sparkler") {
      let dir = random(0, TWO_PI);
      let vel = random(0, 1);
      let starSpd = createVector(vel * cos(dir), vel * sin(dir))
      let star = new Star(createVector(newXPos + starSpd.x, newYPos + starSpd.y), 
                         starSpd, random(5, 10), this.hue, this.sat);
      stars.push(star);
    }

    this.burntime++;
    this.brt = max(0, this.brt - this.fade);  
  }
}

function startSpamFireworks() {
  // Trigger fireworks in rapid succession every 100ms
  fireworkSpamInterval = setInterval(() => {
    let shell = new Shell();
    shell.position = createVector(random(-width / 2, width / 2), 0); // Fire from random locations
    shells.push(shell);
    
    // Increase frequency of fireworks over time (speed up spam)
    fireworkSpamFrequency = max(10, fireworkSpamFrequency - 10); // Make it faster over time
  }, fireworkSpamFrequency);
}
