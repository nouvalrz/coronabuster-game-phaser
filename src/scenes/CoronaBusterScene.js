import Phaser from "phaser";
import FallingObject from "../ui/FallingObject";

export default class CoronaBusterScene extends Phaser.Scene{
    constructor() {
        super('corona-buster-scene');
    }

    init(){
        this.clouds = undefined
        this.nav_left = false
        this.nav_right = false
        this.shoot = false
        this.player = undefined
        this.speed = 100
        this.cursors = undefined
        this.emitter = undefined
        this.enemies = undefined
        this.enemySpeed = 60
    }

    preload(){
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('cloud', 'images/cloud.png')
        this.load.image('left-btn', 'images/left-btn.png')
        this.load.image('right-btn', 'images/right-btn.png')
        this.load.image('shoot-btn', 'images/shoot-btn.png')
        this.load.spritesheet('player', 'images/ship.png', {frameWidth: 66, frameHeight: 66})

        this.load.audio('woosh', 'sfx/woosh.mp3')

        this.load.image('smoke', 'https://labs.phaser.io/assets/particles/smoke-puff.png')

        this.load.image('enemy', 'images/enemy.png')
    }

    create(){
        const gameWidth = this.scale.width * 0.5
        const gameHeight = this.scale.height * 0.5
        this.add.image(gameWidth, gameHeight, 'background')

        this.clouds = this.physics.add.group({
            key: 'cloud',
            repeat: 20
        })
        Phaser.Actions.RandomRectangle(this.clouds.getChildren(), this.physics.world.bounds)

        this.createButton()

        this.player = this.createPlayer()

        this.cursors = this.input.keyboard.createCursorKeys()

        // const particles = this.add.particles('smoke')

        this.emitter = this.add.particles(0, 0, "smoke", {
            speed: 1,
            scale: { start: 0.12, end: 0.01, },
            alpha: 0.5
        }, );

        // this.emitter.setDisplaySize(0.2, 0.2)
        this.emitter.startFollow(this.player, 0, 30)

        // this.emitter.setParticleScale(0.5, 0.5)

        this.enemies = this.physics.add.group({
            classType: FallingObject,
            maxSize: 10,
            runChildUpdate: true
        })

        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })
    }

    update(){
        this.clouds.children.iterate((child)=>{
            child.setVelocityY(20)

            if(child.y > this.scale.height){
                child.x = Phaser.Math.Between(10, 400)
                child.y = child.displayHeight * -1
            }
        })
        this.movePlayer(this.player)
    }

    createButton(){
        this.input.addPointer(3)

        let shoot = this.add.image(320, 550, 'shoot-btn').setInteractive().setDepth(0.5).setAlpha(0.8)
        let nav_left = this.add.image(50, 550, 'left-btn').setInteractive().setDepth(0.5).setAlpha(0.8)
        let nav_right = this.add.image(nav_left.x + nav_left.displayWidth + 20, 550, 'right-btn').setInteractive().setDepth(0.5).setAlpha(0.8)

        nav_left.on('pointerdown', () => {
            this.nav_left = true
        }, this)
        nav_left.on('pointerout', () => {
            this.nav_left = false
        }, this)
        nav_right.on('pointerdown', () => {
            this.nav_right = true
        }, this)
        nav_right.on('pointerout', () => {
            this.nav_right = false
        }, this)
        shoot.on('pointerdown', () => {
            this.shoot = true
        }, this)
        shoot.on('pointerout', () => {
            this.shoot = false
        }, this)
    }

    movePlayer(player){
        if(this.nav_left || this.cursors.left.isDown){
            this.player.setVelocityX(this.speed * -1)
            this.player.anims.play('left', true)
            this.player.setFlipX(false)
            this.sound.play('woosh', {volume: 0.2})
        }else if(this.nav_right || this.cursors.right.isDown){
            this.player.setVelocityX(this.speed)
            this.player.anims.play('right', true)
            this.player.setFlipX(true)
            this.sound.play('woosh', {volume: 0.2})
        }else if(this.cursors.up.isDown){
            this.player.setVelocityY(this.speed * -1)
            this.player.anims.play('turn')
            this.sound.play('woosh', {volume: 0.2})
        }else if(this.cursors.down.isDown){
            this.player.setVelocityY(this.speed)
            this.player.anims.play('turn')
            this.sound.play('woosh', {volume: 0.2})
        }else{
            this.player.setVelocityX(0)
            this.player.setVelocityY(0)
            this.player.anims.play('turn')
        }
    }

    createPlayer(){
        const player = this.physics.add.sprite(200, 450, 'player')
        player.setCollideWorldBounds(true)

        this.anims.create({
            key: 'turn',
            frames: [{key: 'player', frame: 0}]
        })

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {start: 1, end: 2}),
            frameRate: 10
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {start: 1, end: 2}),
            frameRate: 10
        })

        return player
    }

    spawnEnemy(){
        const config = {
            speed: this.enemySpeed,
            rotation: 0.06
        }

        const enemy = this.enemies.get(0,0,'enemy', config)
        const enemyWidth = enemy.displayWidth
        const positionX = Phaser.Math.Between(enemyWidth, this.scale.width - enemyWidth)
        if(enemy){
            enemy.spawn(positionX)
        }
    }

}
