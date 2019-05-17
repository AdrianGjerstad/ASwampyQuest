/* ABOUT
Credits:
  Jacob Adams - Graphic Designer
  Adrian Gjerstad - Audial Designer

  Adrian Gjerstad - Developer

  Lisa Kronander - Teacher

Created in 7th Grade at HMS

MIT License

Copyright (c) 2019 Adrian Gjerstad, Jacob Adams

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Enum BLOCK_ID
let BLOCK_ID = {
  GRASS: "grass",
  ROCK: "rock",
  WATER: "water",
  FLY: "fly",
  DIRT: "dirt",
  FLAG: "flag",
};

let GAME_STATE = {
  MAIN_MENU: "main",
  CREDITS: "credits",
  LEVEL_SELECT: "levels",
  GAME: "game",
};
let gameState = GAME_STATE.MAIN_MENU;

let images = {
  grass: null,
  rock: null,
  water: null,
  fly: null,
  dirt: null,
  flags: null,

  game_over: null,
  finish: null,
};

let frog = {
  idle: null,
  side: null,
  right: null,
  left: null,
};

let antihitboxes = [BLOCK_ID.WATER,
  BLOCK_ID.FLY,
  BLOCK_ID.DIRT,
  BLOCK_ID.FLAG
];

const size = 64;
let skybox = null;

let back = null;

class Block {
  constructor(blockId, x, y) {
    this.id = blockId;
    this.meta = "";
    this.x = x;
    this.y = y;
  }

  draw(scroll) {
    if (this.id === BLOCK_ID.FLAG) {
      if (this.meta === "green") {
        image(images.flags, this.x * size - scroll, this.y * size, 64, 64, 0, 0, 64, 64);
      } else {
        image(images.flags, this.x * size - scroll, this.y * size, 64, 64, 64, 0, 64, 64);
      }
      return;
    }

    if (images[this.id] == undefined) {
      fill(0);
      rect(this.x, this.y, size, size);
    }

    image(images[this.id], this.x * size - scroll, this.y * size);
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.air = false;
  }

  applyGravity() {
    this.vy += 1 / (size);
  }

  update() {
    this.applyGravity();

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(scroll) {
    // TODO: Switch images
    if (this.vy < 0) {
      image(frog.side, this.x * size - scroll, this.y * size, 64, 64, 0, 0, 64, 64);
    } else if (this.vy > 0) {
      image(frog.side, this.x * size - scroll, this.y * size, 64, 64, 64, 0, 64, 64);
    } else if (this.air) {
      image(frog.side, this.x * size - scroll, this.y * size, 64, 64, 0, 0, 64, 64);
    } else if (this.vx > 0) {
      if (frameCount % 20 < 20 / 2) {
        image(frog.right, this.x * size - scroll, this.y * size, 64, 64, 0, 0, 64, 64);
      } else {
        image(frog.right, this.x * size - scroll, this.y * size, 64, 64, 64, 0, 64, 64);
      }
    } else if (this.vx < 0) {
      if (frameCount % 20 < 20 / 2) {
        image(frog.left, this.x * size - scroll, this.y * size, 64, 64, 0, 0, 64, 64);
      } else {
        image(frog.left, this.x * size - scroll, this.y * size, 64, 64, 64, 0, 64, 64);
      }
    } else {
      image(frog.idle, this.x * size - scroll, this.y * size);
    }
  }
}

class Level {
  constructor(array, id) {
    this.array = array;
    this.scroll = 0;

    this.greatestX = 0;

    for (let i = 0; i < array.length; ++i) {
      if (array[i].x > this.greatestX) this.greatestX = array[i].x;
      if(array[i].id === BLOCK_ID.FLAG) array[i].meta = "";
    }

    this.finished = false;
    this.game_over = false;

    this.cloud_scroll = 0;

    this.hi_score = (localStorage.getItem("aswampyquest.adriangjerstad.com." + id + ".hi_score") || 0);
    this.score = 0;
    this.id = id;

    this.fly_count = 0;
    
    this.unlocked = false;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    for (let i = 0; i < this.array.length; ++i) {
      if (this.array[i].id === BLOCK_ID.FLAG) {
        this.array[i].meta = "green";
        break;
      }
    }

    if (this.hi_score < this.score) {
      localStorage.setItem("aswampyquest.adriangjerstad.com." + this.id + ".hi_score", this.score);
      this.hi_score = this.score;
    }
  }

  gameover() {
    this.game_over = true;
    player.x = -1;
    player.y = 10;
  }

  draw() {
    for (let i = 0; i < 5; ++i) {
      image(skybox, (-((this.scroll + this.cloud_scroll) % 256) + (i * 256)), 0);
    }

    for (let i = 0; i < this.array.length; ++i) {
      if (floor(this.scroll / size) - 1 < this.array[i].x) {
        this.array[i].draw(this.scroll);
      }
    }

    if (this.game_over) {
      fill(0, 127);
      rect(0, 0, width, height);

      image(images.game_over, width / 2 - size * 1.5 - 30, height / 16);

      fill(255);
      noStroke();
      textFont("Courier");
      textSize(24);
      textAlign(CENTER, CENTER);

      text("SCORE: " + this.score, width / 4, height / 4);
      text("HI: " + this.hi_score, width / 4 * 3, height / 4);

      image(images.fly, width / 2 - textWidth(this.fly_count + "") - 18, height / 2 - 14, 18, 28, 15, 15, 18, 28);

      text(this.fly_count, width / 2, height / 2);

      text("Press (R) to Restart", width / 2, height / 4 * 3);
    } else if (this.finished) {
      fill(0, 127);
      rect(0, 0, width, height);

      image(images.finish, width / 2 - size * 1.5 - 20, height / 16);
      image(images.grass, width / 2 - size * 1.5 - 30, height / 16 + 3 * size);
      image(images.grass, width / 2 - size * 1.5 - 30 + size, height / 16 + 3 * size);
      image(images.grass, width / 2 - size * 1.5 - 30 + size * 2, height / 16 + 3 * size);
      image(images.grass, width / 2 - size * 1.5 - 30 + size * 3, height / 16 + 3 * size);

      image(frog.idle, width / 2 - size / 2, height / 16 + 2 * size);

      fill(255);
      noStroke();
      textFont("Courier");
      textSize(24);
      textAlign(CENTER, CENTER);

      text("SCORE: " + this.score, width / 4, height / 4);
      text("HI: " + this.hi_score, width / 4 * 3, height / 4);

      image(images.fly, width / 2 - textWidth(this.fly_count + "") - 18, height / 2 + 14, 18, 28, 15, 15, 18, 28);

      text(this.fly_count, width / 2, height / 2 + 28);

      text("Press (R) to Restart", width / 2, height / 4 * 3);
      text("Press (C) to Continue", width / 2, height / 4 * 3 + 28);
    }
  }

  collisionX(player) {
    for (let i = 0; i < this.array.length; ++i) {
      let is_fly = false;
      let is_flag = false;
      if (this.array[i].id === BLOCK_ID.FLY) is_fly = true;
      if (this.array[i].id === BLOCK_ID.FLAG) is_flag = true;
      let ghost = false;
      for (let j = 0; j < antihitboxes.length; ++j) {
        if (antihitboxes[j] === this.array[i].id && !is_fly && !is_flag) {
          ghost = true;
        }
      }
      if (ghost) continue;

      if (player.y + 0.5 > this.array[i].y && player.y < this.array[i].y + 0.5) {
        if (player.x + 0.5 <= this.array[i].x && player.x + 1 + player.vx - 1 / size > this.array[i].x) {
          if (is_fly) {
            this.fly_count++;
            this.array.splice(i, 1);
            --i;

            continue;
          }
          if (is_flag) {
            this.finish();
            continue;
          }
          player.x = this.array[i].x - 0.8;
        } else if (player.x >= this.array[i].x + 0.5 && player.x - 1 + player.vx + 1 / size < this.array[i].x) {
          if (is_fly) {
            this.fly_count++;
            this.array.splice(i, 1);
            --i;

            continue;
          }
          if (is_flag) {
            this.finish();
            continue;
          }
          player.x = this.array[i].x + 0.9;
        }
      }
    }
  }

  collisionY(player) {
    for (let i = 0; i < this.array.length; ++i) {
      let is_fly = false;
      let is_flag = false;
      if (this.array[i].id === BLOCK_ID.FLY) is_fly = true;
      if (this.array[i].id === BLOCK_ID.FLAG) is_flag = true;
      let ghost = false;
      for (let j = 0; j < antihitboxes.length; ++j) {
        if (antihitboxes[j] === this.array[i].id && !is_fly && !is_flag) {
          ghost = true;
        }
      }
      if (ghost) continue;

      if (player.x + 0.8 > this.array[i].x && player.x < this.array[i].x + 0.9) {
        if (player.y + 1 <= this.array[i].y && player.y + 1 + player.vy >= this.array[i].y) {
          if (is_fly) {
            this.fly_count++;
            this.array.splice(i, 1);
            --i;

            continue;
          }
          if (is_flag) {
            this.finish();
            continue;
          }
          player.y = this.array[i].y - 1 - (1 / size);
          player.vy = 0;
          player.air = false;
        } else if (player.y-0.3 > this.array[i].y && player.y + player.vy-0.3 < this.array[i].y) {
          if (is_fly) {
            this.fly_count++;
            this.array.splice(i, 1);
            --i;

            continue;
          }
          if (is_flag) {
            this.finish();
            continue;
          }
          player.y = this.array[i].y + 0.7;
          player.vy = 0;
        }
      }
    }
  }
}

function preload() {
  let imageKeys = Object.keys(images);

  for (let i = 0; i < imageKeys.length; ++i) {
    images[imageKeys[i]] = loadImage(imageKeys[i] + ".png");
  }

  skybox = loadImage("sky.png");

  soundFormats("mp3", "ogg");
  back = loadSound("background.mp3");

  frog.idle = loadImage("frog.png");
  frog.side = loadImage("frog_spritesheet.png");
  frog.right = loadImage("frog_right.png");
  frog.left = loadImage("frog_left.png");
}

let level_arrays = [
  [ // LEVEL 1 - TUTORIAL
    new Block(BLOCK_ID.GRASS, 0, 8),
    new Block(BLOCK_ID.ROCK, -1, 1),
    new Block(BLOCK_ID.ROCK, 1, -1),
    new Block(BLOCK_ID.ROCK, 1, -2),
    new Block(BLOCK_ID.ROCK, 0, 0),
    new Block(BLOCK_ID.ROCK, 0, 2),
    new Block(BLOCK_ID.ROCK, 1, 0),
    new Block(BLOCK_ID.ROCK, 1, 2),
    new Block(BLOCK_ID.FLY, 0, 1),
    new Block(BLOCK_ID.GRASS, 1, 8),
    new Block(BLOCK_ID.GRASS, 2, 8),
    new Block(BLOCK_ID.GRASS, 3, 8),
    new Block(BLOCK_ID.GRASS, 4, 8),
    new Block(BLOCK_ID.WATER, 5, 8),
    new Block(BLOCK_ID.FLY, 5, 4),
    new Block(BLOCK_ID.ROCK, 5, 5),
    new Block(BLOCK_ID.DIRT, 5, 6),
    new Block(BLOCK_ID.DIRT, 5, 7),
    new Block(BLOCK_ID.DIRT, 5, 8),
    new Block(BLOCK_ID.WATER, 6, 8),
    new Block(BLOCK_ID.WATER, 7, 8),
    new Block(BLOCK_ID.ROCK, 7, -4),
    new Block(BLOCK_ID.ROCK, 7, -3),
    new Block(BLOCK_ID.ROCK, 7, -2),
    new Block(BLOCK_ID.ROCK, 7, -1),
    new Block(BLOCK_ID.ROCK, 7, 0),
    new Block(BLOCK_ID.ROCK, 7, 1),
    new Block(BLOCK_ID.ROCK, 7, 2),
    new Block(BLOCK_ID.ROCK, 7, 3),
    new Block(BLOCK_ID.ROCK, 7, 4),
    new Block(BLOCK_ID.ROCK, 7, 5),
    new Block(BLOCK_ID.DIRT, 7, 6),
    new Block(BLOCK_ID.FLY, 7, 6),
    new Block(BLOCK_ID.ROCK, 7, 7),
    new Block(BLOCK_ID.DIRT, 7, 8),
    new Block(BLOCK_ID.WATER, 8, 8),
    new Block(BLOCK_ID.WATER, 9, 8),
    new Block(BLOCK_ID.WATER, 10, 8),
    new Block(BLOCK_ID.FLY, 10, 4),
    new Block(BLOCK_ID.ROCK, 10, 5),
    new Block(BLOCK_ID.DIRT, 10, 6),
    new Block(BLOCK_ID.DIRT, 10, 7),
    new Block(BLOCK_ID.DIRT, 10, 8),
    new Block(BLOCK_ID.WATER, 11, 8),
    new Block(BLOCK_ID.WATER, 12, 8),
    new Block(BLOCK_ID.WATER, 13, 8),
    new Block(BLOCK_ID.GRASS, 14, 8),
    new Block(BLOCK_ID.GRASS, 15, 8),
    new Block(BLOCK_ID.FLAG, 15, 7),
  ],
  [ // LEVEL 2 - BY JACOB ADAMS
    new Block(BLOCK_ID.GRASS, 0, 8),
    new Block(BLOCK_ID.GRASS, 1, 8),
    new Block(BLOCK_ID.GRASS, 2, 8),
    new Block(BLOCK_ID.WATER, 3, 8),
    new Block(BLOCK_ID.ROCK, 3, 6),
    new Block(BLOCK_ID.DIRT, 3, 7),
    new Block(BLOCK_ID.DIRT, 3, 8),
    new Block(BLOCK_ID.WATER, 4, 8),
    new Block(BLOCK_ID.WATER, 5, 8),
    new Block(BLOCK_ID.WATER, 6, 8),
    new Block(BLOCK_ID.ROCK, 6, 4),
    new Block(BLOCK_ID.DIRT, 6, 5),
    new Block(BLOCK_ID.DIRT, 6, 6),
    new Block(BLOCK_ID.DIRT, 6, 7),
    new Block(BLOCK_ID.DIRT, 6, 8),
    new Block(BLOCK_ID.WATER, 7, 8),
    new Block(BLOCK_ID.WATER, 8, 8),
    new Block(BLOCK_ID.WATER, 9, 8),
    new Block(BLOCK_ID.ROCK, 9, 2),
    new Block(BLOCK_ID.DIRT, 9, 3),
    new Block(BLOCK_ID.DIRT, 9, 4),
    new Block(BLOCK_ID.DIRT, 9, 5),
    new Block(BLOCK_ID.DIRT, 9, 6),
    new Block(BLOCK_ID.DIRT, 9, 7),
    new Block(BLOCK_ID.DIRT, 9, 8),
    new Block(BLOCK_ID.WATER, 10, 8),
    new Block(BLOCK_ID.WATER, 11, 8),
    new Block(BLOCK_ID.GRASS, 12, 8),
    new Block(BLOCK_ID.FLY, 12, 7),
    new Block(BLOCK_ID.GRASS, 13, 8),
    new Block(BLOCK_ID.GRASS, 14, 8),
    new Block(BLOCK_ID.GRASS, 15, 8),
    new Block(BLOCK_ID.FLAG, 15, 7),
    new Block(BLOCK_ID.ROCK, 14, 1),
    new Block(BLOCK_ID.ROCK, 15, 1),
    new Block(BLOCK_ID.FLY, 15, 0),
  ],
  [ // LEVEL 3 - BY JACOB ADAMS
    new Block(BLOCK_ID.GRASS, 0, 8),
    new Block(BLOCK_ID.GRASS, 1, 8),
    new Block(BLOCK_ID.GRASS, 2, 8),
    new Block(BLOCK_ID.GRASS, 3, 8),
    new Block(BLOCK_ID.WATER, 4, 8),
    new Block(BLOCK_ID.WATER, 5, 8),
    new Block(BLOCK_ID.WATER, 6, 8),
    new Block(BLOCK_ID.GRASS, 7, 8),
    new Block(BLOCK_ID.GRASS, 8, 8),
    new Block(BLOCK_ID.FLY, 8, 7),
    new Block(BLOCK_ID.WATER, 9, 8),
    new Block(BLOCK_ID.WATER, 10, 8),
    new Block(BLOCK_ID.WATER, 11, 8),
    new Block(BLOCK_ID.WATER, 12, 8),
    new Block(BLOCK_ID.ROCK, 13, 8),
    new Block(BLOCK_ID.GRASS, 14, 8),
    new Block(BLOCK_ID.GRASS, 15, 8),
    new Block(BLOCK_ID.ROCK, 0, 0),
    new Block(BLOCK_ID.ROCK, 1, 0),
    new Block(BLOCK_ID.ROCK, 1, -1),
    new Block(BLOCK_ID.ROCK, 1, -2),
    new Block(BLOCK_ID.ROCK, 1, -3),
    new Block(BLOCK_ID.ROCK, 0, 2),
    new Block(BLOCK_ID.ROCK, 1, 2),
    new Block(BLOCK_ID.ROCK, -1, 1),
    new Block(BLOCK_ID.FLY, 0, 1),
    new Block(BLOCK_ID.ROCK, 4, 6),
    new Block(BLOCK_ID.DIRT, 5, 8),
    new Block(BLOCK_ID.DIRT, 5, 7),
    new Block(BLOCK_ID.DIRT, 5, 6),
    new Block(BLOCK_ID.ROCK, 5, 5),
    new Block(BLOCK_ID.GRASS, 5, 4),
    new Block(BLOCK_ID.ROCK, 11, 7),
    new Block(BLOCK_ID.DIRT, 11, 8),
    new Block(BLOCK_ID.ROCK, 13, 5),
    new Block(BLOCK_ID.ROCK, 13, 6),
    new Block(BLOCK_ID.ROCK, 13, 7),
    new Block(BLOCK_ID.FLAG, 14, 7),
  ],
  [ // LEVEL 4 - BY JACOB ADAMS
    new Block(BLOCK_ID.GRASS, 0, 8),
    new Block(BLOCK_ID.GRASS, 1, 8),
    new Block(BLOCK_ID.GRASS, 2, 8),
    new Block(BLOCK_ID.GRASS, 3, 8),
    new Block(BLOCK_ID.GRASS, 4, 8),
    new Block(BLOCK_ID.WATER, 5, 8),
    new Block(BLOCK_ID.WATER, 6, 8),
    new Block(BLOCK_ID.WATER, 7, 8),
    new Block(BLOCK_ID.WATER, 8, 8),
    new Block(BLOCK_ID.GRASS, 9, 8),
    new Block(BLOCK_ID.GRASS, 10, 8),
    new Block(BLOCK_ID.GRASS, 11, 8),
    new Block(BLOCK_ID.GRASS, 12, 8),
    new Block(BLOCK_ID.GRASS, 13, 8),
    new Block(BLOCK_ID.GRASS, 14, 8),
    new Block(BLOCK_ID.GRASS, 15, 8),
    new Block(BLOCK_ID.FLY, 15, 7),
    new Block(BLOCK_ID.ROCK, 0, 1),
    new Block(BLOCK_ID.ROCK, -1, 0),
    new Block(BLOCK_ID.ROCK, -1, -1),
    new Block(BLOCK_ID.ROCK, -1, -2),
    new Block(BLOCK_ID.ROCK, -1, -3),
    new Block(BLOCK_ID.FLY, 0, 0),
    new Block(BLOCK_ID.ROCK, 4, 6),
    new Block(BLOCK_ID.ROCK, 5, 6),
    new Block(BLOCK_ID.DIRT, 5, 7),
    new Block(BLOCK_ID.DIRT, 5, 8),
    new Block(BLOCK_ID.ROCK, 4, 4),
    new Block(BLOCK_ID.ROCK, 4, 2),
    new Block(BLOCK_ID.ROCK, 6, 5),
    new Block(BLOCK_ID.ROCK, 6, 3),
    new Block(BLOCK_ID.ROCK, 8, 6),
    new Block(BLOCK_ID.FLY, 8, 5),
    new Block(BLOCK_ID.ROCK, 15, 5),
    new Block(BLOCK_ID.ROCK, 14, 3),
    new Block(BLOCK_ID.ROCK, 13, 2),
    new Block(BLOCK_ID.FLAG, 12, 2),
    new Block(BLOCK_ID.ROCK, 12, 3),
    new Block(BLOCK_ID.ROCK, 11, 3),
    new Block(BLOCK_ID.ROCK, 10, 2),
    new Block(BLOCK_ID.ROCK, 10, 1),
    new Block(BLOCK_ID.ROCK, 10, 0),
  ]
]

let levels = [
  new Level(level_arrays[0].slice(), 0),
  new Level(level_arrays[1].slice(), 1),
  new Level(level_arrays[2].slice(), 2),
  new Level(level_arrays[3].slice(), 3),
];
let current_level = 0;
let level_select = 0;
let level_select_scroll = 0;

let player = new Player(1, 7 - 1 / size);

function setup() {
  createCanvas(1024, 576);
  if(parseInt(localStorage.getItem("aswampyquest.adriangjerstad.com.level_count"))>levels.length) {
    localStorage.setItem("aswampyquest.adriangjerstad.com.level_count", levels.length);
  }
  for(let i = 0; i < parseInt(localStorage.getItem("aswampyquest.adriangjerstad.com.level_count")||1); ++i) {
    levels[i].unlocked = true;
  }
  
  if(localStorage.getItem("aswampyquest.adriangjerstad.com.level_count")==null) {
    localStorage.setItem("aswampyquest.adriangjerstad.com.level_count", 1);
  }
  
  setInterval(update, 1000 / 60);

  back.setVolume(0.5);
  back.loop();
}

function draw() {
  if (width === windowWidth) scale(windowWidth / 1024, windowHeight / 576);

  background(255, 0, 0);
  
  for(let i = 0; i < 4; ++i) {
    image(skybox, i*size*4, 0);
  }
  
  image(images.rock, 6*size, 5*size);
  image(images.rock, 7*size, 5*size);
  image(images.rock, 8*size, 5*size);
  image(images.rock, 9*size, 5*size);
  
  image(frog.idle, 7.5*size, 4*size);
  image(images.fly, 7.5*size, 3*size);
  
  fill(0);
  noStroke();
  textFont("Courier");
  textSize(64);
  textAlign(CENTER, CENTER);
  
  if(gameState === GAME_STATE.MAIN_MENU) {
  text("A Swampy Quest", width/2, height/4);
  
  text("(L)evels", width/4, height/4*3);
  text("(C)redits", width/4*3, height/4*3);
  } else if(gameState === GAME_STATE.CREDITS) {
  stroke(255);
  text("Credits", width/2, 48);
  textSize(24);
  text("Jacob Adams - Graphic Designer\nAdrian Gjerstad - Audio Designer\nJacob Adams - Level Designer\n\nAdrian Gjerstad - Developer\n\nCopyright © 2019 Adrian Gjerstad, Jacob Adams.\nLicensed by the MIT License.\nAll visual and audial works have been\ncopyrighted without license, making the\nU.S. Copyright Law go in full effect.", width/2, height/2);
    text("(X)", width-24, 20);
  } else if(gameState === GAME_STATE.LEVEL_SELECT) {
    textSize(24);
    text("(X)", width-24, 20);
    textAlign(LEFT, TOP);
    text("LEVEL SELECT", size, 16);
    textAlign(CENTER, CENTER);
    text("Press (Enter) to select", width/2, height-size/2)
    let page = createGraphics(width-size*2, height/3*2);
    if(level_select_scroll < 0) level_select_scroll = 0;
    if(level_select_scroll > max((ceil((levels.length)/2+1)*size*4)-width-size*2, 0)) level_select_scroll = (ceil((levels.length)/2+1)*size*4)-width-size*2;
    page.translate(-level_select_scroll, 0);
    for(let i = 0; i < levels.length; ++i) {
      page.fill(200, 127);
      if(level_select === i) page.stroke(0);
      else page.noStroke();
      page.rect(floor(i/2)*size*4, (i%2)*height/3+10, size*4-20, height/3-11);
      page.fill(0);
      page.noStroke();
      page.textFont("Courier");
      page.textSize(24);
      page.textAlign(CENTER, CENTER);
      
      page.text("LEVEL " + (i+1), floor(i/2)*size*4+size*2-10, (i%2)*height/3+30);
      page.text((levels[i].unlocked ? "HI: " + levels[i].hi_score : "LOCKED"), floor(i/2)*size*4+size*2-10, (i%2)*height/3+60);
    }
    
    image(page, size, size);
  }
  
  if (gameState !== GAME_STATE.GAME) return;

  levels[current_level].draw();
  player.draw(levels[current_level].scroll);

  // HUD
  image(images.fly, 20, 20, 18, 28, 15, 15, 18, 28);
  fill(0);
  noStroke();
  textFont("Courier");
  textSize(24);
  textAlign(LEFT, TOP);

  text(levels[current_level].fly_count, 45, 24);

  textAlign(RIGHT, TOP);
  text("SCORE: " + levels[current_level].score, width - 20, 24);
}

function update() {
  if (gameState === GAME_STATE.GAME) {
    if (levels[current_level].greatestX > levels[current_level].scroll / size + width / size - 1) {
      levels[current_level].scroll++;
    }
    levels[current_level].cloud_scroll += 0.1;

    if (player.vy > 0 && !player.air) player.air = true;

    player.update();
    levels[current_level].collisionX(player);
    levels[current_level].collisionY(player);

    if (player.x >= width / size - 1) player.x = width / size - 1;

    if (!levels[current_level].game_over && !levels[current_level].finished) levels[current_level].score = floor(levels[current_level].fly_count * 100 + (255 - floor(frameCount / 60)));
    if (levels[current_level].score === 0 || player.x - (levels[current_level].scroll / size) <= -1 || player.y >= height / size + 1) {
      levels[current_level].gameover();
    }
  }
}

function keyPressed() {
  if(gameState === GAME_STATE.GAME) {
    if(keyCode === 88) gameState = GAME_STATE.LEVEL_SELECT;
  if (keyCode === RIGHT_ARROW && !levels[current_level].finished) {
    player.vx = (1 / size) * 10;
  } else if (keyCode === LEFT_ARROW && !levels[current_level].finished) {
    player.vx = -(1 / size) * 10;
  } else if (keyCode === UP_ARROW && !player.air && !levels[current_level].finished) {
    player.vy = -(1 / size) * 21;
    player.air = true;
  }

  if (levels[current_level].game_over || levels[current_level].finished) {
    if (keyCode === 82) {
      player = new Player(1, 7 - 1 / size);
      levels[current_level] = new Level(level_arrays[current_level].slice(), levels[current_level].id);
      levels[current_level].unlocked = true;

      frameCount = 0;
    }
  }

  if (levels[current_level].finished) {
    if (keyCode === 67) {
      if(levels[current_level+1]!==undefined) {
      levels[current_level] = new Level(level_arrays[current_level].slice(), levels[current_level].id);
      levels[current_level].unlocked = true;
      
      ++current_level;
      levels[current_level].unlocked = true;
      localStorage.setItem("aswampyquest.adriangjerstad.com.level_count", parseInt(localStorage.getItem("aswampyquest.adriangjerstad.com.level_count"))+1);

      player = new Player(1, 7 - 1 / size);
      levels[current_level] = new Level(level_arrays[current_level].slice(), levels[current_level].id);

      frameCount = 0;
      } else gameState = GAME_STATE.LEVEL_SELECT;
    }
  }
  } else if(gameState === GAME_STATE.MAIN_MENU) {
    if(keyCode === 67) gameState = GAME_STATE.CREDITS;
    if(keyCode === 76) gameState = GAME_STATE.LEVEL_SELECT;
  } else if(gameState === GAME_STATE.CREDITS) {
    if(keyCode === 88) gameState = GAME_STATE.MAIN_MENU;
  } else if(gameState === GAME_STATE.LEVEL_SELECT) {
    if(keyCode === 88) gameState = GAME_STATE.MAIN_MENU;
    if(keyCode === ENTER) {
      if(levels[level_select].unlocked) {
        frameCount = 0;
        current_level = level_select;
        player = new Player(1, 7 - 1 / size);
      levels[current_level] = new Level(level_arrays[current_level].slice(), levels[current_level].id);
      levels[current_level].unlocked = true;
        gameState = GAME_STATE.GAME;
      }
    }
    
    if(keyCode === 76) level_select_scroll -= 40;
    if(keyCode === 82) level_select_scroll += 40;
    
    if(keyCode === RIGHT_ARROW) level_select+=2;
    if(keyCode === LEFT_ARROW) level_select-=2;
    if(keyCode === DOWN_ARROW) level_select++;
    if(keyCode === UP_ARROW) level_select--;
    
    if(level_select >= levels.length) level_select = levels.length-1;
    if(level_select < 0) level_select = 0;
  }
}

function keyReleased() {
  if(gameState === GAME_STATE.GAME) {
  if (keyCode === RIGHT_ARROW && player.vx > 0) {
    player.vx = 0;
  } else if (keyCode === LEFT_ARROW && player.vx < 0) {
    player.vx = 0;
  }
  }
}

