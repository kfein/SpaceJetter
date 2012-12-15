/******
* Fliegendes Objekt
*
*******/

FlyingObject = function(x, y, s, f, sp, w, h) {
	this.x = x;
	this.y = y;
	this.speed = s;
	this.frame = f;
	this.sprite = sp;
	this.width = w;
	this.height = h;
	this.defunct = false;
	
	this.setX = function(xPos) { this.x = xPos; };
	this.getX = function() { return this.x; };
	this.incX = function(inc) { this.x += inc; };
	this.decX = function(dec) { this.x -= dec; };
	
	this.setY = function(yPos) { this.y = yPos; };
	this.getY = function() { return this.y; };
	this.incY = function(inc) { this.y += inc; };
	this.decY = function(dec) { this.y -= dec; };
	
	this.setSpeed = function(s) { this.speed = s; };
	this.getSpeed = function() { return this.speed; };
	this.incSpeed = function(inc) { this.speed += inc; };
	this.decSpeed = function(dec) { this.speed -= dec; };
	
	this.setVertSpeed = function(s) { this.vertSpeed = s; };
	this.getVertSpeed = function() { return this.vertSpeed; };
	this.incVertSpeed = function(inc) { this.vertSpeed += inc; };
	this.decVertSpeed = function(dec) { this.vertSpeed -= dec; };
	
	this.setSprite = function(val) { this.sprite = val; };
	this.getSprite = function() { return this.sprite; };

	this.setFrame = function(f) { this.frame = f; };
	this.getFrame = function() { return this.frame; };
	
	this.setWidth = function(val) { this.width = val; };
	this.getWidth = function() { return this.width; };
	
	this.setHeight = function(val) { this.height = val; };
	this.getHeight = function() { return this.height; };
	
	this.setDefunct = function() { this.defunct = true; };
	
	this.init = function() {
		var sprite = this.getSprite();
		var frame = this.getFrame();
		this.setWidth(sprite.getWidth(frame));
		this.setHeight(sprite.getHeight(frame));
	};
}


/****
*  PowerUp
*
****/
PowerUp = function(sp) {
	this.base = FlyingObject;

	var x = getRandom(0, width-40);
	var y = getRandom(-100 , -50);
	
	var frame = 0;
	var speed = getRandom(3, 7);
	
	this.base(x, y, speed, frame, sp);
	
	var degree = getRandom(210, 330);
	var angle = degree * Math.PI / 180;
	this.vx = speed * Math.cos(angle);
	this.vy = speed * Math.sin(angle);
	this.counter = 0;
	
	this.type = "PowerUp";
}

PowerUp.prototype = new FlyingObject();
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype = {
	getVX: function() { return this.vx; },
	setVX: function(vx) { this.vx = vx; },
	
	getVY: function() { return this.vy; },
	setVY: function(vy) { this.vy = vy; },
	
	fly: function() {
		this.incY(lvlSpeed);
		
		if(this.counter < 24) {
			this.setFrame(this.counter);
			this.counter++;
		}
		else
			this.counter = 0;
	}
}

/****
*  PowerUp Shield
*
****/
PUShield = function(sp) {
	this.base = PowerUp;

	this.base(sp);
	this.init();
	
	this.type = "PUShield";
}

PUShield.prototype = new PowerUp();
PUShield.prototype.constructor = PUShield;

/****
*  PowerUp Rocket
*
****/
PURocket = function(sp) {
	this.base = PowerUp;

	this.base(sp);
	this.init();
	
	this.type = "PURocket";
}

PURocket.prototype = new PowerUp();
PURocket.prototype.constructor = PURocket;

/****
*  PowerUp PULaser
*
****/
PULaser = function(sp) {
	this.base = PowerUp;

	this.base(sp);
	this.init();
	
	this.type = "Shield";
}

PULaser.prototype = new PowerUp();
PULaser.prototype.constructor = PULaser;


/****
*  Gegner
*
****/
Enemy = function(s, sp) {
	this.base = FlyingObject;
	var yPos = getRandom(100, 200);
	var speed = s;
	var xPos;
	
	// Ermittle die Position des naechsten Objekts
	var side = getRandom(0, 1);
	xPos = getRandom(100, 200);
	
	this.base(xPos, yPos, speed, 6, sp);
	this.dir = side;
}

Enemy.prototype = new FlyingObject();
Enemy.prototype.constructor = Enemy;

/****
*  Enemy Bug 
*
****/
Bug = function(sp, paths) {
	this.base = Enemy;
	
	var speed = 0;

	this.base(speed, sp);
	this.init();
	
	
	this.degree = 0;
	
	this.type = "Bug";

	this.pathFinder = new PathManager(paths);
	this.newPath();	
}

Bug.prototype = new Enemy();
Bug.prototype.constructor = Bug;

Bug.prototype = {
	getDir: function() { return this.dir; },
	setDir: function(d) { this.dir = d; },
	
	getDegree: function() { return this.degree; },
	setDegree: function(d) { this.degree = ((d % 360) + 360) % 360; },
	
	incDegree: function(val) {
		this.degree = (((this.degree + val) % 360) + 360) % 360;
	},
	
	decDegree: function(val) {
		this.degree = (((this.degree - val) % 360) + 360) % 360;
	},
	
	newPath: function() {
		this.setX(this.pathFinder.getX());
		this.setY(this.pathFinder.getY());
	},
	
	fly: function() {	
		
		this.pathFinder.calculate();
		
		var vx = this.pathFinder.getVX();
		var vy = this.pathFinder.getVY();

		this.incX(vx);
		this.decY(vy);
		
		this.turn(this.pathFinder.getDegree());
	},
	
	turn: function(d) {
		
		this.setDegree(d);
		
		var degree = this.getDegree();
		var frame;
				
		// Ermittle Frame
		frame = (((degree % 360) + 360) % 360) / 30;
		//console.log("degree: "+ d + " frame: " +frame);
		
		this.setFrame(frame);
	},
	
	dirToDegree: function(dir) {
		return -dir * 30;
	},
	
	changeDirection: function() {
		var newDir = this.getDir() == 0 ? 1 : 0;
		this.setDir(newDir);
		this.setSpeed(-this.getSpeed());
		return newDir;
	}, 
	
	flyAway: function() {
		var dir = this.changeDirection();
		if(dir)
			this.decSpeed(10);
		else
			this.incSpeed(10);
	},
	
	// schie�en
	shoot: function() {
		bullets.push(new Bullet(bulletSprite, this.getX(), this.getY(), 0));
		bullets.push(new Bullet(bulletSprite, this.getX(), this.getY(), 1));
	}
}



/****
*  Asteroid
*
****/
Asteroid = function(sp, paths) {
	this.base = Enemy;
	
	var speed = 0;

	this.base(speed, sp);
	this.init();
	
	
	this.degree = 0;
	
	this.type = "Asteroid";
	this.picNr = getRandom(0, 11);
	this.pathFinder = new PathManager(paths);
	this.newPath();	
	this.count = 0;
	this.timer = getRandom(0,3);
}

Asteroid.prototype = new Enemy();
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype = {
	getDir: function() { return this.dir; },
	setDir: function(d) { this.dir = d; },
	
	setFlyAwayFlag: function() { this.flyAwayFlag = true; },
	getFlyAwayFlag: function() { return this.flyAwayFlag; },
	
	getDegree: function() { return this.degree; },
	setDegree: function(d) { this.degree = ((d % 360) + 360) % 360; },
	
	incDegree: function(val) {
		this.degree = (((this.degree + val) % 360) + 360) % 360;
	},
	
	decDegree: function(val) {
		this.degree = (((this.degree - val) % 360) + 360) % 360;
	},
	
	newPath: function() {
		this.setX(this.pathFinder.getX());
		this.setY(this.pathFinder.getY());
	},
	
	fly: function() {	
		
		this.pathFinder.calculate();
		
		var vx = this.pathFinder.getVX();
		var vy = this.pathFinder.getVY();
		
		this.incX(vx);
		this.decY(vy);
		
		this.turn(this.pathFinder.getDegree());
	},
	
	turn: function(d) {
		
		this.setDegree(d);
		
		if(this.count == this.timer) {
			if(this.picNr < 12) {
				this.setFrame(this.picNr);
				this.picNr++;
			}
			else {
				this.picNr = 0;
			}	
			this.count = 0;
		}
			
			
		this.count++;
	},
	
	changeDirection: function() {
		var newDir = this.getDir() == 0 ? 1 : 0;
		this.setDir(newDir);
		this.setSpeed(-this.getSpeed());
		return newDir;
	}, 
	
	flyAway: function() {
		var dir = this.changeDirection();
		if(dir)
			this.decSpeed(10);
		else
			this.incSpeed(10);
	}
}

/****
*  Spaceship
*
****/
Spaceship = function(x, y, horSpeed, vertSpeed, f) {	
	this.base = FlyingObject;
	
	this.base(x, y, horSpeed, f);

	this.type = "Spaceship";
	this.width = 128;
	this.height = 100;
	this.vertSpeed = vertSpeed;
	this.fligtAttitude = 0;
	this.tankStatus = 420;
	this.timer = 0;
	this.heightBarFrame = 3;
	this.rocketPowerUp = false;
	this.laserPowerUp = false;
	this.shieldPowerUp = false;
}

Spaceship.prototype = new FlyingObject();
Spaceship.prototype.constructor = Spaceship;

Spaceship.prototype = {
	setVertSpeed: function(s) { this.vertSpeed = s; },
	getVertSpeed: function() { return this.vertSpeed; },
	incVertSpeed: function(inc) { this.vertSpeed += inc; },
	decVertSpeed: function(dec) { this.vertSpeed -= dec; },
	
	setFlightAttitude: function(val) { this.flightAttitude = val; },
	getFlightAttitude: function() { return this.flightAttitude; },
	incFlightAttitude: function(inc) { this.flightAttitude += inc; },
	decFlightAttitude: function(dec) { this.flightAttitude -= dec; },
	
	setTankStatus: function(val) { this.tankStatus = val; },
	getTankStatus: function() { return this.tankStatus; },
	incTankStatus: function(inc) { this.tankStatus += inc; },
	decTankStatus: function(dec) { this.tankStatus -= dec; },
	
	getSprite: function() { return this.sprite; },
	
	derate: function() {
		if(this.vertSpeed <= -20)
			this.vertSpeed = -20;
		if(this.vertSpeed >= 20)
			this.vertSpeed = 20;
	},
	
	checkAttitude: function() {
		var nextLevelFlag = false;
		
		// Falls die Flughoehe kleiner Null ist nicht mehr sinken
		if(this.flightAttitude < 0) {
			this.setFlightAttitude(0);
			this.setVertSpeed(0);
		}
		
		// Falls die Flughoehe die maximale Level Hoehe erreicht
		if(this.flightAttitude > maxLvlHeight) {
			this.setFlightAttitude(maxLvlHeight);
			this.setVertSpeed(0);
			
			// lade naechstes Level
			nextLevelFlag = true;
		}
		
		this.setFlightAttitude(Math.round(this.flightAttitude));
		return nextLevelFlag;
	},
	
	checkBoundary: function() {
		// Beende Bewegung wenn Ballon am Rand ist
		var x = this.getX();
		var y = this.getY();
		var w = this.getWidth();
		var h = this.getHeight();
		
		if(x <= 0) { 				// linker Rand
			this.setX(0);
		}
		if((x + w) >= width) {		// rechter Rand
			this.setX((width - w));
		}		
		if(y <= 0) { 			// oberer Rand
			this.setY(0);
		}
		if((y + w) >= height) {		// unterer Rand
			this.setY((height - h));
		}
	},
	
	getTankFrame: function() {
		var frame = 0;
		var tankStatus = this.tankStatus;
		
		// Hole die richtige Tankanzeige, entsprechend dem aktuellen Status			
		if (tankStatus < 100){
			frame = 4;
		}
		if (tankStatus >= 100 && tankStatus < 200){
			frame = 3;
		}
		if (tankStatus >= 200 && tankStatus < 300){
			frame = 2;
		}
		if (tankStatus >= 300 && tankStatus < 400){
			frame = 1;
		} 
		if (tankStatus >= 400){
			frame = 0;
		}
		
		return frame;
	},
	
	// Kollisionsverarbeitung
	checkCollisions: function(object) {
		var spaceshipX = this.getX();
		var spaceshipY = this.getY();
		var objectX = object.getX();
		var objectY = object.getY();
		var objectWidth = object.getWidth();
		var objectHeigth = object.getHeight();
		
		if(spaceshipX + this.width >= objectX && spaceshipX <= objectX + objectWidth  && spaceshipY + this.height >= objectY && spaceshipY <= objectY + objectHeigth) {
			if(object instanceof PUShield) {
				this.shieldPowerUp = true;
				objects.push(new Shield(weaponSprite['shield'], this));
				object.setDefunct();
			}
			if(object instanceof PURocket) {
				this.rocketPowerUp = true;
				object.setDefunct();
			}
			if(object instanceof PULaser) {
				this.laserPowerUp = true;
				object.setDefunct();
			}
			if(object instanceof Asteroid) {
				/*if(!object.getFlyAwayFlag()) {
					object.flyAway();
					object.setFlyAwayFlag();
				}*/
			}
			
			/*else if(object instanceof Laser) {
				this.laserPowerUp = true;
				object.setDefunct();
			}*/
			/*else if(object instanceof Shield) {
				this.shieldPowerUp = true;
				object.setDefunct();
			}*/
		}
	},
	
	// Pruefe auf Treffer
	checkHit: function(object) { 
		var objectX = object.getX();
		var objectY = object.getY();
		var objectWidth = object.getWidth();
		var objectHeight = object.getHeight();
		
		for (var i = 0; i < bullets.length; i++) {
			if(bullets[i].getX() + bullets[i].getWidth() >= objectX && bullets[i].getX() <= objectX + objectWidth && bullets[i].getY() + bullets[i].getHeight() >= objectY && bullets[i].getY() <= objectY + objectHeight) {	
				if(!(object instanceof Shield) && !(object instanceof PUShield) && !(object instanceof PULaser) && !(object instanceof PURocket))
					object.defunct = true;
					
				bullets[i].defunct = true;
				lvlScore += 5;
			}
		}
	},
	
	// schie�en
	shoot: function() {
		bullets.push(new Bullet(weaponSprite['bullet'], this.getX(), this.getY(), 0));
		bullets.push(new Bullet(weaponSprite['bullet'], this.getX(), this.getY(), 1));
		
		if(this.rocketPowerUp)
			bullets.push(new Rocket(weaponSprite['rocket'], this.getX(), this.getY()));
		if(this.laserPowerUp)
			bullets.push(new Laser(weaponSprite['laser'], this.getX(), this.getY()));
	}
}

/****
*  Bullet
*
****/
Bullet = function(sp, shooterX, shooterY, side) {
	this.base = FlyingObject;
	
	var xPos;		
	var yPos;
	
	if(side == 0) {
		
		xPos = shooterX;
		yPos = shooterY + 40;
	}
	else {
		xPos = shooterX + 120;
		yPos = shooterY + 40;
	}
		
	var frame = 0;
	var speed = 40;
	
	this.canShoot = false;
	this.base(xPos, yPos, speed, 0, sp);
	this.init();
	
	this.type = "Bullet";
}

Bullet.prototype = new FlyingObject();
Bullet.prototype.constructor = Bullet;

Bullet.prototype = {
	fly: function() {
		this.decY(this.getSpeed());
	}
}

/****
*  Rocket
*
****/
Rocket = function(sp, shooterX, shooterY) {
	this.base = FlyingObject;
	
	var xPos = shooterX + 64;		
	var yPos = shooterY + 40;
		
	var frame = 0;
	var speed = 20;
	
	
	this.base(xPos, yPos, speed, frame, sp);
	this.init();
	
	this.canShoot = false;
	this.searchNearest();
	this.nearestX;
	this.nearestY;
	this.nearestObject;
	this.vx;
	this.vy;
	this.type = "Rocket";
}

Rocket.prototype = new FlyingObject();
Rocket.prototype.constructor = Rocket;

Rocket.prototype = {
	searchNearest: function() {
		this.nearestX = width;
		this.nearestY = height;
		for(o in objects) {
			var object = objects[o];
			if(!(object instanceof Shield) && !(object instanceof PUShield) && !(object instanceof PULaser) && !(object instanceof PURocket)) {
				if(object.getX() <= this.nearestX && object.getY() <= this.nearestY){
					this.nearestX = object.getX();
					this.nearestY = object.getY();
					this.nearestObject = object;
				}
			}
		}	
	},

	fly: function() {
		if(this.nearestObject != undefined && this.nearestObject.defunct == false) {
			var x1 = this.getX() + (this.getWidth() / 2);
			var x2 = this.nearestObject.getX() + (this.nearestObject.getWidth() / 2);
			
			var y1 = this.getY();
			var y2 = this.nearestObject.getY() + (this.nearestObject.getHeight() / 2);
			
			var angle = Math.atan2(y2-y1, x2-x1);
			
			var degree = (-angle * 360) / (2 * Math.PI);
			
			if(y1 < y2)
				degree = degree + 360;
				
			var	frame = Math.floor(degree / 10);
			
			this.setFrame(frame);
			
			this.vx = this.getSpeed() * Math.cos(angle);
			this.vy = this.getSpeed() * Math.sin(angle);
		}

		this.incX(this.vx);
		this.incY(this.vy);
	}
}

/****
*  Laser
*
****/
Laser = function(sp, shooterX, shooterY) {
	this.base = FlyingObject;
	
	var xPos = shooterX + 64 - 5;		
	var yPos = shooterY + 40;	
	var frame = 0;
	var speed = 60;
	
	this.base(xPos, yPos, speed, frame, sp);
	this.init();

	this.type = "Laser";
}

Laser.prototype = new FlyingObject();
Laser.prototype.constructor = Laser;

Laser.prototype = {
	fly: function() {
		this.decY(this.getSpeed());
	}
}

/****
*  Shield
*
****/
Shield = function(sp, obj) {
	this.base = FlyingObject;
	
	this.obj = obj;
	var xPos = this.obj.getX(); //shooterX + 64;		
	var yPos = this.obj.getY(); //shooterY + 40;
		
	var frame = 0;
	var speed = 20;
	
	this.base(xPos, yPos, speed, frame, sp);
	this.init();
	
	this.canShoot = false;
	this.vx;
	this.vy;
	this.type = "Rocket";

	//this.moveTo();
}

Shield.prototype = new FlyingObject();
Shield.prototype.constructor = Shield;

Shield.prototype = {

	fly: function() {
		var x1 = this.obj.getX() + (this.obj.getWidth() / 2);
		var y1 = this.obj.getY() + (this.obj.getHeight() / 2);

		var angle = this.degree * (Math.PI / 180);
		
		this.vx = (x1 + 100 * Math.cos(angle)) - (this.getWidth() / 2);
		this.vy = (y1 + 100 * Math.sin(angle)) - (this.getHeight() / 2);
		
		var	frame = Math.floor(this.degree / 15);
		
		if(this.degree < 355)
			this.degree += 5;
		else
			this.degree = 0;
		
		this.setFrame(frame);
		
		this.setX(this.vx);
		this.setY(this.vy);
		
	}
}

function getRandom(a, b) {
	var z = Math.random();
	z *= (b - a + 1);
	z += a;
	return (Math.floor(z));
}

