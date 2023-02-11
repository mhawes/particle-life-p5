let height = 1060;
let width = 1900;

let surface;
let mouseColorIx = 0;
let availableColours = ["red", "yellow", "blue", "green", "peach", "aqua", "orange", "teal", "darkmagenta", "deeppink"];
let pauseSim = false;


let showMatrix = false;
let matrixSide = 60;

let radOne = 20;
let radTwo = radOne * 2;
let radThree = radTwo * 2;
let radFour = radThree * 2;
let radFive = radFour * 2;

class Atom {
  constructor(color, position, velocity) {
    this.color = color;
    this.position = position;
    this.velocity = velocity;
    this.colorRef = color.toString("#rrggbb");
    this.mass = 7;
  }

  draw() {
    noStroke();
    fill(this.color);
    circle(this.position.x, this.position.y, this.mass);
  }
}

class Surface {
  constructor() {
    this.atoms = [];
    this.attractionMatrix = new AttractionMatrix();
  }

  addAtom(color, position) {
    append(this.atoms, new Atom(
      color,
      position,
      createVector(0, 0))
    )
  }

  addAtoms(color, count) {
    this.attractionMatrix.addColor(color);

    for (let i = 0; i < count; ++i) {
      append(this.atoms, new Atom(
        color,
        createVector(random(width), random(height)),
        createVector(0, 0))
      )
    }
  }

  doCalculations() {
    for (let i = 0; i < this.atoms.length; ++i) {
      let force = createVector(0, 0);
      for (let j = 0; j < this.atoms.length; ++j) {
          let atomA = this.atoms[i];
          let atomB = this.atoms[j];

          let g = this.attractionMatrix.getAttractionForColors(atomA.colorRef, atomB.colorRef) * 0.01;

          let dx = atomA.position.x - atomB.position.x;
          let dy = atomA.position.y - atomB.position.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          // atom force radius 
          if (distance > 0 && distance <= radOne) {
            let F = g * 1 / distance
            force.x += (F * dx);
            force.y += (F * dy);
          } else if (distance > radOne && distance <= radTwo) {
            g *= 0.5;
            let F = g * 1 / distance
            force.x += (F * dx);
            force.y += (F * dy);
          } else if (distance > radTwo && distance < radThree) {
            g *= 0.25;
            let F = g * 1 / distance
            force.x += (F * dx);
            force.y += (F * dy);
          } else if (distance > radThree && distance < radFour) {
            g *= 0.125;
            let F = g * 1 / distance
            force.x += (F * dx);
            force.y += (F * dy);
          } else if (distance > radFour && distance < radFive) {
            g *= 0.0625;
            let F = g * 1 / distance
            force.x += (F * dx);
            force.y += (F * dy);
          }

          atomA.velocity = p5.Vector.add(atomA.velocity.mult(0.1), force);
          atomA.position = p5.Vector.add(atomA.position, atomA.velocity);

          // wrapping
          if (atomA.position.x <= 0) { atomA.position.x = width; } 
          if (atomA.position.x > width){ atomA.position.x = 0; }
          if (atomA.position.y <= 0) { atomA.position.y = height; } 
          if (atomA.position.y > height){ atomA.position.y = 0; }
      }
    }
  }

  draw() {
    for (let i = 0; i < this.atoms.length; ++i) {
      this.atoms[i].draw();
    }
  }

  printDebug() {
    this.attractionMatrix.printDebug();
  }
}

class AttractionMatrix {
  constructor() {
    this.attractions = new p5.TypedDict();
    this.colorRefs = [];
  }

  addColor(color) {
    let newColorRef = color.toString("#rrggbb")
    let newColorDict = new p5.TypedDict();
    
    // add color to refs
    append(this.colorRefs, newColorRef);

    for (let i = 0; i < this.colorRefs.length; ++i) {
      // update existing color inner dicts
      let existingColorRef = this.colorRefs[i];
      if (!this.attractions.hasKey(existingColorRef)) {
        this.attractions.create(existingColorRef, new p5.TypedDict());
      }
      this.attractions.get(existingColorRef).create(newColorRef, 0);

      // populate the new dict with random default 
      newColorDict.create(existingColorRef, 0);
    }

    // add color to attractions dict
    this.attractions.create(newColorRef, newColorDict);
  }

  getAttractionForColors(colorARef, colorBRef) {
    return this.attractions.get(colorARef).get(colorBRef);
  }

  setAttractionForColors(colorA, colorB, attraction) {
    const colorARef = colorA.toString("#rrggbb")
    const colorBRef = colorB.toString("#rrggbb")
    this.attractions.get(colorARef).set(colorBRef, attraction);
  }

  randomise() {
    for (let i = 0; i < this.colorRefs.length; ++i) {
      for (let j = 0; j < this.colorRefs.length; ++j) {
        const colorARef = this.colorRefs[i];
        const colorBRef = this.colorRefs[j];
        this.attractions.get(colorARef).set(colorBRef, round(random(-0.5, 0.5), 2));
      }
    }
  }

  printDebug() {
    for (let i = 0; i < this.colorRefs.length; ++i) {
      let existingColorRef = this.colorRefs[i];
      print(existingColorRef + ":");
      this.attractions.get(existingColorRef).print();
    }
  }
}

function mouseClicked() {
  if (!showMatrix) {
    surface.addAtom(color(availableColours[mouseColorIx]), createVector(mouseX, mouseY));
  } else { 
    updateMatrixValue();
  }
}

function mouseDragged() {
  if (!showMatrix) {
    surface.addAtom(color(availableColours[mouseColorIx]), createVector(mouseX, mouseY));
  }
}

function keyPressed() {
  if (keyCode == ENTER) {
    ++mouseColorIx;
    if (mouseColorIx >= surface.attractionMatrix.colorRefs.length) {
      mouseColorIx = 0;
    }
  }
  // show matrix view
  if (keyCode == CONTROL) {
    showMatrix = !showMatrix;
  }
  // pause
  if (keyCode == 19) {
    pauseSim = !pauseSim;
  }
}

function setup() {
  createCanvas(width, height);
  surface = new Surface();
  for (let i = 0; i < availableColours.length; ++i) {
    surface.addAtoms(color(availableColours[i]), 0);
  }
}

function updateMatrixValue() {
  let colorA = getMouseMatrixColorA();
  let colorB = getMouseMatrixColorB();
  let isRandButton = mouseX < matrixSide && mouseY < matrixSide;

  if (isRandButton) {
    surface.attractionMatrix.randomise();
  } else if (colorA != null && colorB != null) {
    let colorARef = color(colorA).toString("#rrggbb");
    let colorBRef = color(colorB).toString("#rrggbb");
    let amount = getMouseMatrixAmount();
    surface.attractionMatrix.setAttractionForColors(colorARef, colorBRef, amount);
  }
}

function getMouseMatrixAmount() {
  let result = 0;
  for (let i = 0; i < availableColours.length; ++i) {
    let origY = matrixSide * (i + 1);
    if (mouseY >= origY && mouseY < origY + matrixSide) {
      return round(((mouseY - origY) / matrixSide) - 0.5, 2);
    }
  }
  return result;
}

function getMouseMatrixColorA() {  
  for (let i = 0; i < availableColours.length; ++i) {
    let origX = matrixSide * (i + 1);
    if (mouseX >= origX && mouseX < origX + matrixSide) {
      return availableColours[i];
    }
  }
  return null;
}

function getMouseMatrixColorB() {  
  for (let i = 0; i < availableColours.length; ++i) {
    let origY = matrixSide * (i + 1);
    if (mouseY >= origY && mouseY < origY + matrixSide) {
      return availableColours[i];
    }
  }
  return null;
}

function drawMatrix() {
  strokeWeight(5);
  stroke(50);

  // draw random button
  fill(color("grey"));
  rect(0, 0, matrixSide, matrixSide);
  textSize(12);
  fill(color("white"));
  text("RAND", matrixSide / 4, matrixSide / 2);

  // draw labels
  for (let i = 0; i < availableColours.length; ++i) {
    fill(color(availableColours[i]));
    let orig = matrixSide * (i + 1);
    rect(orig, 0, matrixSide, matrixSide);
    rect(0, orig, matrixSide, matrixSide);
  }

  strokeWeight(1);
  stroke(10);

  // draw martix
  for (let i = 0; i < availableColours.length; ++i) {
    for (let j = 0; j < availableColours.length; ++j) {
      let colorARef = color(availableColours[i]).toString("#rrggbb");
      let colorBRef = color(availableColours[j]).toString("#rrggbb");
      let attraction = surface.attractionMatrix.getAttractionForColors(colorARef, colorBRef);

      let origX = matrixSide * (i + 1);
      let origY = matrixSide * (j + 1);
      fill(0);
      rect(origX, origY, matrixSide, matrixSide);

      // draw the value in the box
      textSize(12);
      fill(color("white"));
      text(attraction, origX + matrixSide / 3, origY + matrixSide / 2);
    }
  }
}

function drawAtomCursor() {
  // draw an atom over the mouse pointer
  noStroke();
  fill(color(availableColours[mouseColorIx]));
  circle(mouseX, mouseY, 6);
}

function draw() {
  background(0);
  if (!pauseSim) {
    surface.doCalculations();
  }
  surface.draw();
  drawAtomCursor();

  if (showMatrix) {
    drawMatrix();
  }
}
