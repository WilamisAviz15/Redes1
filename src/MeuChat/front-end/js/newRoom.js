const createForm = document.getElementById('create-form');
const socket = io();
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log('ok')
    var username = document.querySelector("#username");;
    var nameRoom = document.querySelector("#room");
    socket.emit('newRooms', nameRoom.value)
    window.location.href=`/chat.html?username=${username.value}&room=${nameRoom.value}`
});