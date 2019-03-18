'use strict';

var express = require('express');

module.exports = function () {

    this.use(express.static(FRONTEND, {
        maxAge: 860000
    }));
};
//# sourceMappingURL=production.js.map