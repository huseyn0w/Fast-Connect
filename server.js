const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))



app.get('/', (req, res) => {
    res.send('hello world');
})


io.on('connection', (socket) => {

    

    socket.on("disconnect", () => {

    });

});




if(process.env.NODE_ENV === 'production'){
   app.use(express.static('client/build'));
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
   })
}


server.listen(port);