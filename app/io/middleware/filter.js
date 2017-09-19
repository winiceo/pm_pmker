'use strict';

module.exports = () => {
  return function* (next) {
    console.log(this.packet);
      const message = JSON.parse(this.packet);
    console.log(message.url)
      const say = yield this.service.user.say();
    //
      // this.socket.emit('fuck', 'packet!' + say);
    yield* next;
    console.log('packet response!');
  };
};
