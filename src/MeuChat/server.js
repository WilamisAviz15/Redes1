const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const moment = require('moment');
const fs = require('fs');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const servidor = http.createServer(app);
const io = socketio(servidor);
var rooms = []

fs.readFile('arquivo.txt', 'utf-8', (err, irooms) => {
  if (err) throw err;
  var array = irooms.split(',');
  rooms = array
})

app.use(express.static(path.join(__dirname, 'front-end')));

io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  socket.on('UpdateMessage', (time) => {
    const user = getCurrentUser(socket.id);
    const obj = {
      index: user.username + moment().format('h:mm:ss a'),
      text: 'Mensagem Expirada',
      time: time
    }
    io.to(user.room).emit('messageE', obj);
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
  
  socket.on('newRooms', (nameRoom) => {
    rooms.push(nameRoom)
    fs.writeFile('arquivo.txt', rooms, (err) => {
      if (err) throw err;
      // console.log('O arquivo foi criado/atualizado!');
    });
  })

  socket.on('sendRooms', () => {
    fs.readFile('arquivo.txt', 'utf-8', (err, irooms) => {
      if (err) throw err;
      io.emit('messageR', irooms);
    });
  });
  socket.emit('sendRooms');
});

const PORT = process.env.PORT || 9000;

servidor.listen(PORT, () => console.log(`Servidor executando na porta ${PORT}`));