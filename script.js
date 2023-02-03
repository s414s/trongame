class Game{

    constructor(width=1000, height=600){

        this.config = {
            fps: 50,
            speed: 4,
            player1Color: "rojo",
            player2Color: "azul",
            dotSize: 5,
            canvasHeight: height,
            canvasWidth: width,
            status: "on",
            player1Start: {x: 200, y: 200},
            player2Start: {x: 400, y: 400}
        }

        this.player1 = new Player(this, "Player 1", this.config.player1Start.x, this.config.player1Start.y, "blue");
        this.player2 = new Player(this, "Player 2", this.config.player2Start.x, this.config.player2Start.y, "red");

        this.inputHandler = new InputHandler(this, this.player1, this.player2);

        //---- Canvas set up ----
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.config.canvasWidth;
        this.canvas.height = this.config.canvasHeight;

        this.start_game = ()=>{setInterval(() => {
            this.load_fp();
        }, this.config.fps);}

        this.loader = (context, callback)=>{
            context.fillStyle = "black";
            context.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            console.log("loaded!");
            this.scan_bg();
            callback();
        }

        this.loader(this.ctx, this.start_game);
    }

    load_fp(){

        this.load_bg();
        this.player1.move_motorbike();
        this.player2.move_motorbike();
        this.player1.next_pixel();
        this.player2.next_pixel();
        this.player1.is_within_limits();
        this.player2.is_within_limits();
        this.paint_pixels(this.player1.position, this.player1.color);
        this.paint_pixels(this.player2.position, this.player2.color);
        this.scan_bg();
        
    }
    
    load_bg(){
        this.ctx.putImageData(this.scannedImage, 0, 0);
    }

    paint_pixels(position, color){
        const dS = this.config.dotSize;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x-dS/2, position.y-dS/2, this.config.dotSize, this.config.dotSize);
    }
    
    scan_bg(){
        this.scannedImage = this.ctx.getImageData(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    }

    end_game(namePlayer){

        window.alert("El jugador " + namePlayer + " ha perdido");
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        this.scan_bg();
        this.player1.position.x = this.config.player1Start.x;
        this.player1.position.y = this.config.player1Start.y;
        this.player2.position.x = this.config.player2Start.x;
        this.player2.position.y = this.config.player2Start.y;
    }

}

class InputHandler{

    constructor(game, player1, player2){
        this.game = game;
        this.player1 = player1;
        this.player2 = player2;

        this.player1Keys = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowRight: "right",
            ArrowLeft: "left",
        }

        this.player2Keys = {
            KeyW: "up",
            KeyS: "down",
            KeyD: "right",
            KeyA: "left"
        }

        document.addEventListener("keydown", (e) => {

            if(Object.keys(this.player1Keys).includes(e.code)){
                this.player1.controller[this.player1Keys[e.code]] = true;
                this.player1.changeBearing();
            }else if(Object.keys(this.player2Keys).includes(e.code)){
                this.player2.controller[this.player2Keys[e.code]] = true;
                this.player2.changeBearing();
            }else{
                console.log("Key not set")
            }
            
        })

        document.addEventListener("keyup", (e) => {

            if(Object.keys(this.player1Keys).includes(e.code)){
                this.player1.controller[this.player1Keys[e.code]] = false;
                this.player1.changeBearing();
            }else if(Object.keys(this.player2Keys).includes(e.code)){
                this.player2.controller[this.player2Keys[e.code]] = false;
                this.player2.changeBearing();
            }else{
                console.log("Key not set")
            }
        })
    }
}

class Player{

    constructor(game, name, positionX, positionY, color){
        this.game = game;
        this.name = name;
        this.position = {x: positionX, y: positionY};
        this.bearing = "up";
        this.color = color;
        this.controller = {
            up: false,
            down: false,
            right: false,
            left: false
        };
    }

    changeBearing(){

        const tc = this.controller;
        let bearing = null;

        if (tc.up && tc.right) {           bearing = "upRight";
        } else if (tc.right && tc.down) {  bearing = "downRight";
        } else if (tc.down && tc.left) {   bearing = "downLeft";
        } else if (tc.up && tc.left) {     bearing = "upLeft";
        } else if (tc.up) {                bearing = "up";
        } else if (tc.right) {             bearing = "right";
        } else if (tc.down) {              bearing = "down";
        } else if (tc.left) {              bearing = "left";
        }

        if( bearing !== null ){ this.bearing = bearing;}
    }

    next_pixel(){

        const offset = (this.game.config.dotSize/2);

        const positionReader = {
            up: { x: this.position.x, y: this.position.y-offset },
            right: { x: this.position.x+offset, y: this.position.y },
            down: { x: this.position.x, y: this.position.y+offset },
            left: { x: this.position.x-offset, y: this.position.y },
            upRight: { x: this.position.x+offset, y: this.position.y-offset },
            downRight: { x: this.position.x+offset, y: this.position.y+offset },
            downLeft: { x: this.position.x-offset, y: this.position.y+offset },
            upLeft: { x: this.position.x-offset, y: this.position.y-offset }
        }

        const imgData = this.game.ctx.getImageData(
            positionReader[this.bearing].x,
            positionReader[this.bearing].y,
            1, 1);

        const pixelData = imgData.data;
        const pixelColor = `${pixelData[0]},${pixelData[1]},${pixelData[2]}`;

        if (pixelColor !== "0,0,0") {
            console.log("Game Over for player" + this.name)
            this.game.end_game(this.name);
        }

    }

    is_within_limits(){
        const x = this.position.x;
        const y = this.position.y;
        const maxX = this.game.config.canvasWidth;
        const maxY = this.game.config.canvasHeight;

        if (x > maxX || x < 0 || y > maxY || y < 0) {
            console.log("Game Over for player" + this.name)
            this.game.end_game(this.name);
        }
    }

    move_motorbike(){

        const speed = game.config.speed;

        if (this.bearing === "up") {                this.position.y-=speed;
        } else if (this.bearing === "upRight") {    this.position.x+=speed; this.position.y-=speed;
        } else if (this.bearing === "right") {      this.position.x+=speed;
        } else if (this.bearing === "downRight") {  this.position.x+=speed; this.position.y+=speed;
        } else if (this.bearing === "down") {       this.position.y+=speed;
        } else if (this.bearing === "downLeft") {   this.position.x-=speed; this.position.y+=speed;
        } else if (this.bearing === "left") {       this.position.x-=speed;
        } else if (this.bearing === "upLeft") {     this.position.x-=speed; this.position.y-=speed;
        }
    }
}


window.onload = () => {
    game = new Game;
}