module.exports = (app) => {
  return function* (next) {
    yield* next;
    const { socket, packet } = this;
    socket.user = [];
    console.log(packet[1])
    if (packet) {
      if (packet[1].token) {
        try {
         /// const { _uid } = app.jwt.verify(packet[1].token, app.config.jwt.secret);

          const _uid=3333;
          if (_uid) {
            socket.uid = _uid;
            socket.user[_uid] = socket.id;
            const mobile = yield this.service.user.mobile(_uid);

            socket.on('join', () => socket.broadcast.emit('join', `${mobile} 上线`));
            // console.log(socket.user[_uid])

            if (packet[0] === 'join') { socket.broadcast.emit('join', `${mobile} 上线`); }
            yield* next;

          } else {
            socket.emit('join', '用户无效');
          }
        } catch (err) {
          console.log(err);
          socket.emit('join', 'token无效');
        }
      } else {
        socket.emit('join', '无权操作');
      }
    } else {
      socket.emit('join', '数据无效');
    }
  };
};