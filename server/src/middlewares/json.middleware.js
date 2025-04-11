const express = require("express");

const applyJsonMiddleware = (app) => {
    app.use(express.json());
};

module.exports = applyJsonMiddleware;