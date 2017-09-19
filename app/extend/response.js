'use strict';

module.exports = {
  get isSuccess() {
    return this.status === 200;
  },
    set ct(value) {
        this.set('Content-Type', value);
    },
};
