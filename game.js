'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y
  }

  plus(vector) {
      if(!(vector instanceof Vector)) {
        throw new Error ('Можно прибавить к вектору только весктор типа Vector');
      } else {
        let x = vector.x + this.x;
        let y = vector.y + this.y;
        return new Vector(x, y);
      }
  }

  times(number) {
    let x = this.x * number;
    let y = this.y * number;
    return new Vector(x, y)
  }
}

class Actor {
  constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector(), ) {
    if(!(position instanceof Vector) || !(speed instanceof Vector) || !(size instanceof Vector)) {
      throw new Error ('Передан объект не класса Vector');
    }
    this.pos =  position;//new Vector(position.x, position.y);
    this.size = size;
    this.speed = speed;
  }

  get type() {
    if(this instanceof Player) {
       return 'player'
     } else if(this instanceof Coin) {
       return 'coin'
     } else if(this instanceof Fireball){
       return 'fireball' 
     } else {
       return 'actor';
     }
  }

  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.size.x + this.pos.x;
  }
  get bottom() {
    return this.size.y + this.pos.y;
  }
  
  act() {

  }

  isIntersect(object) {
    if(object === this) {
      return false
    }

    if(object === undefined || !(object instanceof Actor)){
      throw new Error ('Передан объет отличный от Actor');
    } else {
      if(object.right <= this.left || object.left >= this.right || object.bottom <= this.top || this.bottom <= object.top) {
        return false;
      } else {
        return true;
      }
    }
  }
}

class Level {
  constructor(gamePole = [], actors = []) {
    this.grid = gamePole;
    this.actors = actors;
    this.height = this.grid.length; 
    this.status = null;
    this.finishDelay = 1; //должна меняться до сотояния меньше 0 - это как ?!
  }

  get player() {
    let player;
    this.actors.forEach(function(el) {
      if(el.type === 'player') {
        player = el;
      }
    })
    return player;
  }

  get width() {
    let max = 0;
    for(let i = 0; i < this.grid.length; i ++) {
      if(this.grid[i].length > max) {
        max = this.grid[i].length
      }
    }
    return max
  }

  isFinished() {
    if(this.status !== null && this.finishDelay < 0) {
      return true;
    } else {
      return false;
    }
  }

  actorAt(actor) {
    if(this.actors === undefined) {
      return undefined;
    } else {
      let result = this.actors.find(el => {
        return el.isIntersect(actor);
      })
      return result;
    }
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error("Нужно передать объект типа Vector");
    };

    let top = Math.floor(pos.y);
    let right = Math.ceil(pos.x + size.x);
    let bottom = Math.ceil(pos.y + size.y);
    let left = Math.floor(pos.x);
    
    if (bottom > this.grid.length) {
      return('lava');
    }else if (left < 0 || top < 0 || right > this.grid.length) {
      return 'wall';
    }
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        if (this.grid[y][x] !== undefined) {
          return this.grid[y][x];
        };
      };
    };
    return;
  };

  removeActor(object) {
    let typeObject = object.type;
    let indexObjet
    if(object.hasOwnProperty('title')) {
      indexObjet = this.actors.findIndex(el => {
      return el.type === typeObject && el.title === object.title
      })
    } else {
      indexObjet = this.actors.findIndex(el => {
      return el.type === typeObject
      })
    }
    if(indexObjet !== -1) {
      this.actors.splice(indexObjet, 1)
    }
  }

  noMoreActors(type) {
    let presenceType = this.actors.findIndex(el => {
      return el.type === type;
    })
    if(presenceType !== -1) {
      return false;
    } else {
      return true;
    }
  }

  playerTouched(type, actor) {
    if(this.status === null) {
      if(type === 'lava' || type === 'fireball') {
        this.status = 'lost';
      }
      
      if(type === 'coin' && actor.type === 'coin') {
        this.removeActor(actor)
        if(this.noMoreActors('coin') === true) {
          this.status = 'won'
        };
      }
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    if(this.dictionary[symbol] !== undefined) {
      return this.dictionary[symbol];
    } else {
      return undefined;
    }
  }

  obstacleFromSymbol(symbol) {
    if(symbol === 'x') {
      return 'wall';
    } else if(symbol === '!') {
      return 'lava';
    } else {
      return undefined;
    }
  }

  createGrid(gamePolePlan) {
    let gamePole = [];
    gamePolePlan.forEach((el, index) => {
      gamePole[index] = [];
      for(let i of el) {
        gamePole[index].push(this.obstacleFromSymbol(i))
      }
    })
    return gamePole;
  }

  createActors(gamePolePlan = []) {
    if (!this.dictionary) {
        return [];
      };
    let actorList = [];

    gamePolePlan.forEach((string, y) => {
      string.split('').forEach((symbol, x) => {

        let actor = this.actorFromSymbol(symbol);
        if (!((typeof actor === 'function') && (new actor instanceof Actor))) {
          return;
        };
        actorList.push(new actor(new Vector(x, y)));
      });
    });
    return actorList;
  }

  parse(gamePolePlan) {
    let grid = this.createGrid(gamePolePlan)
    let actors = this.createActors(gamePolePlan)
    return new Level(grid, actors)
  }
}

class Player extends Actor {
  constructor(position = new Vector()) {
    super()
    this.pos = new Vector(position.x, position.y - 0.5);
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0)
  }
}

class Coin extends Actor {
  constructor(position = new Vector()) {
    super()
    this.pos = new Vector(position.x + 0.2, position.y + 0.1);
    this.size = new Vector(0.6, 0.6);
    this.speed = new Vector(0, 0);
    this.basePos = new Vector(position.x + 0.2, position.y + 0.1);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI
  }

  updateSpring(time = 1) {
    this.spring = this.spring + (this.springSpeed * time);
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    let springVector = this.getSpringVector();
    return this.basePos.plus(springVector);
  }

  act(time = 1) {
    this.pos = this.getNextPosition(time);
  }
}

class Fireball extends Actor {
  constructor(position, speed) {
    super(position, new Vector(1, 1),  speed);
  }

  getNextPosition(time = 1) {
    let x = this.pos.x + (this.speed.x * time);
    let y = this.pos.y + (this.speed.y * time);

    return new Vector(x, y);
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    let obstacle = level.obstacleAt(nextPosition, this.size);
    if(obstacle === 'lava' || obstacle === 'wall') {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position) {
    super(position);
    this.speed = new Vector(2, 0);
    this.size = new Vector(1, 1)
  }
}

class VerticalFireball extends Fireball {
  constructor(position) {
    super(position);
    this.speed = new Vector(0, 2);
    this.size = new Vector(1, 1)
  }
}

class FireRain extends Fireball {
  constructor(position) {
    super(position);
    this.speed = new Vector(0, 3);
    this.size = new Vector(1, 1);
    this.firstPosistion = position;
  }

  handleObstacle() {
    this.pos = this.firstPosistion;
  }
}
