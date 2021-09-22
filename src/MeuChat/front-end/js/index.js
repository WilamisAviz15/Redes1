const socket = io();

socket.on('messageR', (m) => {
    var array = m.split(',');
    generateSelect(array)
})
socket.emit('sendRooms')

function generateSelect(array) {
    if (!document.getElementById("room")) {
        var myParent = document.body;
        var selectList = document.createElement("select");
        selectList.id = "room";
        selectList.name = "room";
        myParent.appendChild(selectList);
        for (var i = 0; i < array.length; i++) {
            var option = document.createElement("option");
            option.value = array[i];
            option.text = array[i];
            selectList.appendChild(option);
        }
        document.querySelector('.t').appendChild(selectList);
    }
}