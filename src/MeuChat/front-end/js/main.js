const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
var i = 0
var aux = 0
var array = []
var timeU
const socket = io();
sendFiles();
socket.emit('joinRoom', { username, room });
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', (message) => {
  array.push(message)
  timeU = message.time
  outputMessage(array[i])
  i++

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.timeMessage.disabled = true;
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.id = message.username + message.time
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  if (typeof (message.text) === 'object') {
    obj = message.text
    para.innerHTML = ['<a id="', ++aux, '"href="#" onClick="zoom(this)"><img class="thumb" width="40%" height="40%" src="', obj.src,
      '" title="', escape(obj.title), '"/></a>'].join('');
  }
  else {
    para.innerText = message.text;
  }
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function zoom(element) {
  var newTab = window.open();
  setTimeout(function() {
      newTab.document.body.innerHTML = element.innerHTML;
  }, 100);
  return false;
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Deseja sair da sala?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

document.getElementById('timeMessage').addEventListener('click', () => {
  var time = prompt("Informe o tempo para a mensagem expirar em segundos (s)");
  if (time == null || time == "") {
    text = "Cancelado, pois nao foi informado o tempo";
  } else {
    socket.emit('UpdateMessage', time)
  }
});

socket.on('messageE', (message) => {
  setTimeout(function () {
    // console.log(`Executa uma vez após ${(message.time)} segundos`);
    // console.log(message.index)
    t = document.getElementById(message.index);
    t.innerText = message.text
  }, 1000 * message.time);
});

document.body.querySelector("#msg").addEventListener("input", function(){
    var botao_proximo = document.body.querySelector("#timeMessage")
    botao_proximo.disabled = this.value.length >= 1 ? false : true;
  });

function sendFiles() {
  const fileSelector = document.getElementById('input-file');
  fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    // console.log(fileList);

    for (var i = 0, f; f = fileList[i]; i++) {
      if (!f.type.match('image.*')) {
        continue;
      }
      var reader = new FileReader();
      var obj
      reader.onload = (function (theFile) {
        return function (e) {
          obj = {
            src: e.target.result,
            title: theFile.name
          }
          socket.emit('chatMessage', obj);
        };
      })(f);
      reader.readAsDataURL(f);
    }
  });
}