'use strict';

var express = require('express');
var controller = require('./events.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.broadcastEvent);

module.exports = router;