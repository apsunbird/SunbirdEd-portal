/**
 * @file
 * @description - Learner routes handler
 * @version 1.0
 */

 const proxyUtils        = require('../proxy/proxyUtils.js')
 const envHelper         = require('../helpers/environmentVariablesHelper.js')
 const learnerURL        = envHelper.LEARNER_URL
 const telemetryHelper   = require('../helpers/telemetryHelper.js')
 const proxy             = require('express-http-proxy')
 const bodyParser        = require('body-parser')
 const healthService     = require('../helpers/healthCheckService.js')
 const { decrypt }       = require('../helpers/crypto');
 const isAPIWhitelisted  = require('../helpers/apiWhiteList');
 const googleService     = require('../helpers/googleService')
 const reqDataLimitOfContentUpload = '50mb'
 const { logger } = require('@project-sunbird/logger');
 const {parseJson, isDateExpired, decodeNChkTime} = require('../helpers/utilityService');
 const _ = require('lodash');
  const CircularJSON =     require('circular-json')
 
 module.exports = function (app) {
   require('./accountRecoveryRoute.js')(app) // account recovery route
 
   // Helper route to enable enable admin to update user fields
   app.patch('/learner/portal/user/v1/update',
     proxyUtils.verifyToken(),
     proxy(envHelper.learner_Service_Local_BaseUrl, {
       proxyReqOptDecorator: proxyUtils.decorateRequestHeaders(envHelper.learner_Service_Local_BaseUrl),
       proxyReqPathResolver: (req) => {
         return '/private/user/v1/update';
       },
       userResDecorator: (proxyRes, proxyResData, req, res) => {
         logger.info({ msg: '/learner/portal/user/v1/update called /private/user/v1/update' });
         try {
           const data = JSON.parse(proxyResData.toString('utf8'));
           if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
           else return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res, data);
         } catch (err) {
           logger.error({ msg: 'learner route : userResDecorator json parse error:', proxyResData });
           logger.error({ msg: 'learner route : error for /learner/portal/user/v1/update', err });
           return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res, null);
         }
       }
     })
   )
 
 
 
  function getHRMSdATA(req, res) {
     
       console.log("cha================================");
      // let data = JSON.parse(req.toString('utf8'));
 
      const str = CircularJSON.stringify(req);
     var unserialized = CircularJSON.parse(str);
     const obj = JSON.parse(str);
 
    // console.log(obj.originalUrl);
     console.log(unserialized.originalUrl);
     console.log(unserialized.query.HRMS_ID);
    // return false; 
     const axios = require('axios');
     var dataToPost = {
        HRMS_ID: unserialized.query.HRMS_ID,
     // HRMS_ID:  '1176123',
      Key: 'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'
     };
    
     let axiosConfiguration = {
       headers: {
           'Content-Type': 'application/json;charset=UTF-8',
           "Access-Control-Allow-Origin": "*",
           "Key": 'F5FC9F4A7EEDF37C93FFBDCFB34C5D1829984C5B3A6FDB3B95457CD324'
       }
     };
     var rtxt={};
     axios.post('https://gramawardsachivalayam.ap.gov.in/GSWSAPI/api/thirdparty/GSWSHRMSDATA', dataToPost, axiosConfiguration)
     .then((res1) => {
      // console.log("Response: ", res1);
      // console.log("dsdddddddddddddddddddddd====");
       //console.log("status==============: ", res1.data.status);
       //console.log("Response  New : ", res1.data.result);
       //console.log("Response  New : ", res1.data.result.length);
        rtxt.responseCode = 200;
        rtxt.result =  res1.data.result;
        rtxt.response='SUCCESS';
        rtxt.status =res1.data.Status;
        res.json(rtxt);
     })
     .catch((err) => {
       console.log("error: ", err);
     })  
   }
 
 
 
 
 
   app.post('/learner/user/v1/gethrmsData',getHRMSdATA);
   //app.post('/learner/user/v1/gethrmsData',createFile());
   app.get('/learner/user/v1/managed/*', proxyManagedUserRequest());
 
   // Route to check user email id exists (or) already registered
   app.get('/learner/user/v1/exists/email/:emailId', googleService.validateRecaptcha);
 
   // Route to check user phone number exists (or) already registered
   app.get('/learner/user/v1/exists/phone/:phoneNumber', googleService.validateRecaptcha);
 
   app.post('/learner/anonymous/otp/v1/generate', googleService.validateRecaptcha);
 
   // Route to check user email exists - SSO update contact workflow
   app.all('/learner/user/v1/get/email/*', googleService.validateRecaptcha, proxyObj());
   
   // Route to check user phone exists - SSO update contact workflow
   app.all('/learner/user/v1/get/phone/*', googleService.validateRecaptcha, proxyObj());
 
   app.get('/learner/isUserExists/user/v1/get/phone/*', proxyObj());
 
   app.get('/learner/isUserExists/user/v1/get/email/*', proxyObj());
   app.post('/learner/user/v2/bulk/upload', proxyObj());
   // Route to handle user registration
   app.all('/learner/user/v1/signup',
     healthService.checkDependantServiceHealth(['LEARNER', 'CASSANDRA']),
     checkForValidUser()
   );
 
   app.all('/learner/*',
     bodyParser.json(),
     isAPIWhitelisted.isAllowed(),
     healthService.checkDependantServiceHealth(['LEARNER', 'CASSANDRA']),
     telemetryHelper.generateTelemetryForLearnerService,
     telemetryHelper.generateTelemetryForProxy,
     proxy(learnerURL, {
       limit: reqDataLimitOfContentUpload,
       proxyReqOptDecorator: proxyUtils.decorateRequestHeaders(learnerURL),
       proxyReqPathResolver: function (req) {
         let urlParam = req.params['0']
         let query = require('url').parse(req.url).query
         if (urlParam.indexOf('anonymous') > -1) urlParam = urlParam.replace('anonymous/', '');
         if (req.url.indexOf('/otp/') > 0) {
           proxyUtils.addReqLog(req);
         }
         if (req.originalUrl === '/learner/data/v1/role/read') {
           urlParam = req.originalUrl.replace('/learner/', '')
         }
         logger.info({ msg: '/learner/* called - ' + req.method + ' - ' + req.url });
         if (query) {
           return require('url').parse(learnerURL + urlParam + '?' + query).path
         } else {
           return require('url').parse(learnerURL + urlParam).path
         }
       },
       userResDecorator: (proxyRes, proxyResData, req, res) => {
         try {
           const data = JSON.parse(proxyResData.toString('utf8'));
           if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
           else return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res, data);
         } catch (err) {
           logger.error({ msg: 'learner route : userResDecorator json parse error:', proxyResData, error: JSON.stringify(err) })
           return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
         }
       }
     })
   )
 }
 
 function proxyManagedUserRequest() {
   return proxy(learnerURL, {
     limit: reqDataLimitOfContentUpload,
     proxyReqOptDecorator: proxyUtils.decorateRequestHeaders(learnerURL),
     proxyReqPathResolver: function (req) {
       let urlParam = req.originalUrl.replace('/learner/', '');
       let query = require('url').parse(req.url).query;
       if (query) {
         return require('url').parse(learnerURL + urlParam + '?' + query).path
       } else {
         return require('url').parse(learnerURL + urlParam).path
       }
     },
     userResDecorator: function (proxyRes, proxyResData, req, res) {
       try {
         let data = JSON.parse(proxyResData.toString('utf8'));
         _.forEach(_.get(data.result.response, 'content'), (managedUser, index) => {
           if (managedUser.managedToken) {
             delete data.result.response.content[index].managedToken
           }
         });
         if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
         else return proxyUtils.handleSessionExpiry(proxyRes, data, req, res, data);
       } catch (err) {
         logger.error({ msg: 'learner route : userResDecorator json parse error:', proxyResData })
         return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
       }
     }
   });
 }
 
 function checkForValidUser() {
   return proxy(learnerURL, {
     limit: reqDataLimitOfContentUpload,
     proxyReqOptDecorator: proxyUtils.decorateRequestHeaders(learnerURL),
     proxyReqBodyDecorator: function (bodyContent, srcReq) {
       var data = JSON.parse(bodyContent.toString('utf8'));
       var reqEmail = data.request['email'];
       var reqPhone = data.request['phone'];
       var reqValidator = data.request['reqData'];
       var decodedValidator = decodeNChkTime(reqValidator);
       if ((decodedValidator['key']) && (reqEmail === decodedValidator['key'] || reqPhone === decodedValidator['key'])) {
         data = _.omit(data, 'request.reqData');
         return data;
       } else {
         throw new Error('USER_CANNOT_BE_CREATED');
       }
     },
     proxyReqPathResolver: function (req) {
       return require('url').parse(envHelper.LEARNER_URL + req.originalUrl.replace('/learner/', '')).path
     },
     userResDecorator: function (proxyRes, proxyResData, req, res) {
       try {
         logger.info({ msg: 'proxyObj' });
         let data = JSON.parse(proxyResData.toString('utf8'));
         let response = data.result.response;
         data.result.response = { id: '', rootOrgId: '', isUserExists: '' };
         if (data.responseCode === 'OK') {
           data.result.response.id = response.id;
           data.result.response.rootOrgId = response.rootOrgId;
           data.result.response.isUserExists = true;
         }
         if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
         else return proxyUtils.handleSessionExpiry(proxyRes, data, req, res, data);
       } catch (err) {
         logger.error({ msg: 'learner route : userResDecorator json parse error:', proxyResData })
         return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
       }
     }
   });
 }
 
 function proxyObj (){
   return proxy(learnerURL, {
     limit: reqDataLimitOfContentUpload,
     proxyReqOptDecorator: proxyUtils.decorateRequestHeaders(learnerURL),
     proxyReqPathResolver: function (req) {
       let urlParam = req.originalUrl.replace('/learner/', '')
       let query = require('url').parse(req.url).query
       if (urlParam.indexOf('isUserExists') > -1) urlParam = urlParam.replace('isUserExists/', '');
       if (query) {
         return require('url').parse(learnerURL + urlParam + '?' + query).path
       } else {
         return require('url').parse(learnerURL + urlParam).path
       }
     },
     userResDecorator: function (proxyRes, proxyResData,  req, res) {
       try {
         logger.info({msg: 'proxyObj'});
         let data = JSON.parse(proxyResData.toString('utf8'));
         let response = data.result.response;
         data.result.response = {id: '', rootOrgId: '',isUserExists:''};
         if (data.responseCode === 'OK') {
           data.result.response.id = response.id;
           data.result.response.rootOrgId = response.rootOrgId;
           data.result.response.isUserExists = true;
         }
         if(req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
         else return proxyUtils.handleSessionExpiry(proxyRes, data, req, res, data);
       } catch (err) {
         logger.error({msg:'learner route : userResDecorator json parse error:', proxyResData})
         return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
       }
     }
   });
 }
 