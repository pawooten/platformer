PlayState = {};
// load game assets here
PlayState.preload = function () {
    this.game.load.json('level:1', 'level01.json');
    this.game.load.image('background', 'background.png');
    this.game.load.image('ground', 'ground.png');
    this.game.load.image('grass:8x1', 'grass_8x1.png');
    this.game.load.image('grass:6x1', 'grass_6x1.png');
    this.game.load.image('grass:4x1', 'grass_4x1.png');
    this.game.load.image('grass:2x1', 'grass_2x1.png');
    this.game.load.image('grass:1x1', 'grass_1x1.png');
    this.game.load.image('hero', 'hero_stopped.png');
    this.game.load.image('invisible-wall', 'invisible_wall.png');
    this.game.load.image('icon:coin', 'coin_icon.png');
    this.game.load.image('font:numbers', 'numbers.png');

    this.game.load.audio('sfx:jump', 'jump.wav');
    this.game.load.audio('sfx:coin', 'coin.wav');
    this.game.load.audio('sfx:stomp', 'stomp.wav');

    this.game.load.spritesheet('coin', 'coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', 'spider.png', 22, 22);
};
PlayState.init = function () {
    this.coinPickupCount = 0;
    this.game.renderer.renderSession.roundPixels = true;
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });
    this.keys.up.onDown.add(function() {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);
};
// create game entities and set up world here
PlayState.create = function () {
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp')
    };
    
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));

    this._createHud();
};
PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6);
    let coinIcon = this.game.make.image(0, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width, coinIcon.height / 2, this.coinFont);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.position.set(10, 10);
    this.hud.add(coinScoreImg);
};
PlayState.update = function () {
    this.coinFont.text = `x${this.coinPickupCount}`;
    this._handleCollisions();
    this._handleInput();
};
PlayState._onHeroVsCoin = function(hero, coin) {
    this.sfx.coin.play();
    this.coinPickupCount++;
    coin.kill();
}
PlayState._onHeroVsEnemy = function(hero, enemy) {
    if (hero.body.velocity.y > 0) {
        // kill enemies when hero is falling.
        enemy.die();
        this.sfx.stomp.play();
        hero.bounce();
    } else {
        this.sfx.stomp.play();
        this.game.state.restart();    
    }
}
PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, null, this);
};
PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    } else { // stop
        this.hero.move(0);
    }
};
PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;
    // spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});

    data.coins.forEach(this._spawnCoin, this);

    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};
PlayState._spawnCharacters = function (data) {
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);

    // spawn spiders
    data.spiders.forEach(function(spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);
};
PlayState._spawnCoin = function(coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6 fps, looped
    sprite.animations.play('rotate');

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
}
PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(platform.x, platform.y, platform.image);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x, platform.y, 'right');
};
PlayState._spawnEnemyWall = function(x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
}
PlayState.begin = function() {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
}
window.onload = function () {
    PlayState.begin();
};