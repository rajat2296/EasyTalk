'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var logger = require('../../components/logger');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var templateCreator = function(exres, neres) {
  var foo = JSON.stringify(exres).replace(/,/g,'<br>');
  var bar = JSON.stringify(neres).replace(/,/g,'<br>');
  return  '<br>Exitsing Resources:<br>' +foo+ '<br><br>Requested Resources:<br>' +bar;
}
var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({role:'user'}, 'name service_status', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.role = 'user';
  //newUser.is_activated = false;
  //newUser.service_status = false;
  newUser.save(function(err, user) {
    /*console.log(JSON.stringify(user));
    if (err) return validationError(res, err);
    var cipher = crypto.createCipher('aes192', "posist-api");
    var hash = cipher.update(user.email, 'binary', 'hex');
    hash += cipher.final('hex');
    var mailer = nodemailer.createTransport(sgTransport(config.APPMAILER));
    var email = {
      to: user.email,
      from: 'tech@posist.com',
      subject: 'Email Verification',
      html: '<b>Hi '+user.name+ '!</b> Verify your Posist Open API account by clicking <a href="'+config.hostname+'/api/users/activate/'+hash+'">here</a>'
    };
    mailer.sendMail(email, function(err, sent) {
      if(err)
        console.log('Verification email has failed for:'+user.email);
      else
        logger.user('info', {user_id: user._id, message: user.name+' registered.'});
      res.send();
    })*/
    res.status(200).send('ok');
  });
};

exports.activate = function(req, res){
  if(req.params.code){
    var decipher = crypto.createDecipher('aes192', "posist-api");
    var useremail = decipher.update(req.params.code, 'hex', 'binary');
    useremail += decipher.final('binary');
    User.findOneAndUpdate({email:useremail}, {is_activated:true}, function(err, user){
      if (err) {console.log(err); return validationError(res, err);}
      var SessionToken = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*24 });
      logger.user('info', {user_id: user._id, message: user.name+' activated link.'});
      res.redirect('/callback/'+SessionToken);
    });
  }else{
    res.status(403).send("Invalid activation link");
  }
};
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

//Find Requests
exports.findRequests = function(req, res){
  User.find({role:'user'}, 'name resources',function(err, users){
    if(err) res.send(500).send();
    else{
      if(!users)
        res.json([]);
      else{
        var u=[];
        users.forEach(function(user){
          if(user.resources){                 // this condition is required because resources are not present in new users
            for(var key in user.resources){
              if(!user.resources[key].request)
                delete user.resources[key];
              else{
                if(user.resources[key].apiKey!=undefined)delete user.resources[key].apiKey;
                if(user.resources[key].request!=undefined)delete user.resources[key].request;
              }
            }
            if(Object.keys(user.resources).length!=0)
              u.push(user);
          }
        });
        res.json(200, u);
      }
    }
  });
};

exports.accept = function(req, res){
  User.findById(req.body.id, function(err, user){
    if (err) { console.log(err); res.send(404); }
    if(!user) { return res.send(404); }
    else{
      user.resources[req.body.api].request = false;
      if(user.resources[req.body.api].apiKey != undefined)
        user.activated_apiKeys.push(user.resources[req.body.api].apiKey);
      User.findByIdAndUpdate(req.body.id, {resources: user.resources, activated_apiKeys: user.activated_apiKeys}, function(err, user){
        if (err) { console.log(err); res.send(404); }
        if(!user) { return res.send(404); }
        else{
          var perms = Object.keys(user.resources[req.body.api]).filter(function(key){if(['request','apiKey'].indexOf(key)==-1) return true;});
          var mailer = nodemailer.createTransport(sgTransport(config.APPMAILER));
          var email = {
            to: user.email,
            from: 'tech@posist.com',
            subject: 'Resource Permissions Accepted',
            html: '<b>Hi '+user.name+ '!</b> Your request for our API- '+req.body.api+' has been accepted for the following permissions: <br><i>'+perms.join(", ")+'</i>'
          };
          mailer.sendMail(email, function(err, sent) {
            if(err)
              console.log(err);
            else
              logger.user('info', {user_id:user._id, message:'Accepted resource permission request for '+req.body.api});
            res.send();
          });
        }
      });
    }
  });
};

exports.reject = function (req, res) {
  User.findById(req.body.id, function(err, user){
    if (err) { console.log(err); res.send(404); }
    if(!user) { return res.send(404); }
    else{
      if(user.resources[req.body.api].apiKey != undefined)
        user.activated_apiKeys.splice(user.activated_apiKeys.indexOf(user.resources[req.body.api].apiKey),1);
      delete user.resources[req.body.api];      
      User.findByIdAndUpdate(req.body.id, {resources: user.resources, activated_apiKeys: user.activated_apiKeys}, function(err, user){
        if (err) { console.log(err); res.send(404); }
        if(!user) { return res.send(404); }
        else{
          var mailer = nodemailer.createTransport(sgTransport(config.APPMAILER));
          var email = {
            to: user.email,
            from: 'tech@posist.com',
            subject: 'Resource Permissions Rejected',
            html: '<b>Hi '+user.name+ '!</b> Your request for our API- '+req.body.api+' has been rejected due to the following reason: <br><i>'+req.body.reason+'</i>'
          };
          mailer.sendMail(email, function(err, sent) {
            if(err)
              console.log(err);
            else
              logger.user('info', {user_id: user._id, message: 'Rejected resource permission request for '+req.body.api});
            res.send();
          });
        }
      });
    }
  });
};

//Update service
exports.updateService = function(req, res) {
  User.findByIdAndUpdate(req.params.id, {service_status: req.body.status}, function (err, user) {
    if (err) { console.log(err); res.send(404); }
    if(!user) { return res.send(404); }
    var change = req.body.status?'activated':'deactivated'; 
    logger.user('info', {user_id: user._id, message: 'Service status was '+change});
    return res.json(200, {service_status:user.service_status});
  });
};

exports.updateResources = function(req, res){
  if(req.query.generateKey){ 
    User.findById(req.params.id, function(err, user){
      if (err) { console.log(err); res.send(404); }
      else if (!user) { return res.send(404); }
      else{
        var index = user.activated_apiKeys.indexOf(user.resources[req.query.generateKey].apiKey);
        var cipher = crypto.createCipher('aes-128-cbc-hmac-sha1', config.secrets.key);
        user.resources[req.query.generateKey].apiKey =  cipher.update(crypto.randomBytes(8).toString('base64')+':'+req.query.generateKey, 'utf8', 'base64')+cipher.final('base64');
        
        if(index>-1){
          user.activated_apiKeys.splice(index,1);
          user.activated_apiKeys.push(user.resources[req.query.generateKey].apiKey);  
        }else{
          user.activated_apiKeys.push(user.resources[req.query.generateKey].apiKey);
        }
        
        User.findByIdAndUpdate(req.params.id, {resources: user.resources, activated_apiKeys: user.activated_apiKeys}, function(err, user){
          if (err) { console.log(err); res.send(404); }
          else{
            logger.user('info', {user_id: user._id, message: "Key generated for API "+ req.query.generateKey});
            res.json({resources:user.resources, activated_apiKeys:user.activated_apiKeys});
          }
        });
      }
    });
  }else if(req.query.api){ //cancel request
    User.findById(req.params.id, function(err, user){
      if (err) { console.log(err); res.send(404); }
      else if (!user) { return res.send(404); }
      else{
        delete user.resources[req.query.api];
        User.findByIdAndUpdate(req.params.id, {resources: user.resources}, function(err, user){
          if (err) { console.log(err); res.send(404); }
          else {
            logger.user('info', {user_id: user._id, message: "Client cancelled request for "+ req.query.api});
            res.json(user.resources);
          }
        });
      }
    });
  }else{ //request access
    User.findById(req.params.id, function(err, user){
      if (err) { console.log(err); res.send(404); }
      else if (!user) { return res.send(404); }
      else{
        if(user.resources == undefined)
          user.resources = {};
        var key = Object.keys(req.body)[0];
        if(user.resources[key] == undefined)
          user.resources[key]={};
          var template = templateCreator(user.resources[key], req.body[key]);
        user.resources[key]=_.merge(user.resources[key], req.body[key]);
        user.resources[key].request = true;
        var i = user.activated_apiKeys.indexOf(user.resources[key].apiKey);
        if(i!=-1)
          user.activated_apiKeys.splice(i,1);
      
        User.findByIdAndUpdate(req.params.id, {resources: user.resources, activated_apiKeys: user.activated_apiKeys}, function(err, user){
          if (err) { console.log(err); res.send(404); }
          else{
            logger.user('info', {user_id: user._id, message: "Requested resources from admin for: "+ key});
            var mailer = nodemailer.createTransport(sgTransport(config.APPMAILER));
            var email = {
              to: ['shubhank@posistmail.com','kaushik@posistmail.com'],
              from: 'tech@posist.com',
              subject: 'Resource Permissions',
              html: 'User Name:' +user.name+ '<br> Client Id:' +user.client_id+ '<br>' +template
            };
            mailer.sendMail(email, function(err, sent) {
              if(err)
                console.log(err);
              else
                console.log("Mail sent for requested permissions by "+user.name+" of module "+key);
            });
            res.json(user.resources);
          }
        });
      }
    });
  }
};

exports.updateResourcesByAdmin = function(req, res){
  User.findByIdAndUpdate(req.params.id, {resources: req.body.resources, activated_apiKeys: req.body.activated_apiKeys, user_group: req.body.user_group}, function(err, user){
    if (err) { console.log(err); res.send(404); }
    else{
      logger.user('info', {user_id: user._id, message: "Resource permissions updated by admin."});
      res.json({resources:user.resources, user_group: user.user_group});
    }
  });
};
/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err, user) {
        if (err) {console.log(err); return validationError(res, err);}
        logger.user('info', {user_id: user._id, message: 'Password changed.'});
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.forgotPassword = function(req, res){
  User.findOne({email: req.body.email}, function(err, user){
    if(err)
      res.status(500).send('Server Error. Please try again later.');
    else if(!user)
      res.status(400).send('No account with that email has been found');
    else{
      var password = shortid.generate();
      user.password = password;
      user.save(function(err, user){
        if (err) res.status(500).send('Server Error. Please try again later.');
        else{
          var mailer = nodemailer.createTransport(sgTransport(config.APPMAILER));
          var email = {
            to: user.email,
            from: 'admin@posist.com',
            subject: 'New password for Posist API',
            html: '<h3>Your new password for logging into POSIST API PLATFORM is: '+password+'</h3>'
          };
          mailer.sendMail(email, function(err, sent) {
            if(err){
              console.log('Forgot password failed for:'+user.email);
              res.status(500).send('Server Error. Please try again later.');
            }else{
              console.log('Forgot password:'+user.email);
              res.send('An email has been sent to ' + user.email + ' with further instructions.');
            }
          });
        }
      });
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  res.json(req.user);
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
