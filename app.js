const express = require("express");
const socket=require("socket.io")
const http=require("http")
const {Chess} =require("chess.js")
const path=require("path")

const app = express();
const server = http.createServer(app);
const io = socket(server);


const chess=new Chess()

let players={}
let currentPlayer="w";

io.on("connection",(uniquesocket)=>{
    console.log("Connected",uniquesocket)

    if(!players.white){
        players.white=uniquesocket.id
        uniquesocket.emit("playerRole","w")
    }
    else if(!players.black){
        players.black=uniquesocket.id
        uniquesocket.emit("playerRole","b")
    }
    else{
        uniquesocket.emit("spectatorRole")
    }

    uniquesocket.on("disconnect",()=>{
        if(players.white===uniquesocket.id){
            delete players.white
        }
        if(players.black===uniquesocket.id){
            delete players.black
        }
    })
    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn()==="w" && uniquesocket.id!=players.white) return
            if(chess.turn()==="b" && uniquesocket.id!=players.black) return
            const result=chess.move(move)
            if(result){
                currentPlayer=chess.turn()
                io.emit("move",move)
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("err")
                uniquesocket.emit("invalid move",move)
            }
        }catch(err){
            console.log(err)
            uniquesocket.emit("invalid move",move)
        }
    })
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req, res) => {
    res.render("index",{title :"Chess game"});
})

server.listen(3000,()=>{
    console.log("server running on port : 3000")
})




