'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/requests', auth.hasRole('admin'), controller.findRequests);
router.put('/requests/accept', auth.hasRole('admin'), controller.accept);
router.put('/requests/reject', auth.hasRole('admin'), controller.reject);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.put('/:id/service', auth.hasRole('admin'), controller.updateService);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/resources', auth.isAuthenticated(), controller.updateResources);
router.put('/:id/resourcesByAdmin', auth.hasRole('admin'), controller.updateResourcesByAdmin);
router.post('/', controller.create);
router.get('/activate/:code', controller.activate);
router.post('/password', controller.forgotPassword);

module.exports = router;
