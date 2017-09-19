module.exports = () => {
    let allsocket = [];
    return function* (next) {
        const { socket } = this;
        //connection
        allsocket.push(socket.id);
        socket.broadcast.emit('connections', allsocket.length);
        yield* next;
        //disconnect
        // console.log("dfasdf23423")
        //
        // console.log(socket.user[socket.uid])
        allsocket.splice(allsocket.indexOf(socket.id), 1);
        //abort connection
        if (socket.user[socket.uid]) {
            socket.user.splice(socket.user[socket.uid].indexOf(socket.id), 1);
        }
        ///console.log(`客户端：${socket.id}失去连接`);
    };
};