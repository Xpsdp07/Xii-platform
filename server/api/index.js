/**
 * 'api/project': API server initialization and general GET/POST
 */

const fs = require('fs');
var express = require('express');
const path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
const authJwt = require('./jwt-helper');  // Keep for backward compatibility
const rateLimit = require("express-rate-limit");

// Platform Core Services
const platform = require('../platform');

// SCADA-specific APIs
var prjApi = require('./projects');
var alarmsApi = require('./alarms');
var pluginsApi = require('./plugins');
var diagnoseApi = require('./diagnose');
var scriptsApi = require('./scripts');
var resourcesApi = require('./resources');
var widgetsCatalogApi = require('./widgets-catalog');

var daqApi = require('./daq');
var commandApi = require('./command');
const reports = require('../dist/reports.service');
const reportsApi = new reports.ReportsApiService();

var apiApp;
var server;
var runtime;

function init(_server, _runtime) {
    server = _server;
    runtime = _runtime;
    return new Promise(function (resolve, reject) {
        if (runtime.settings.disableServer !== false) {

            apiApp = express();

            // ✅✅✅ FIX #1: SERVE WIDGETS-CATALOG STATIC FILES FIRST
            const widgetsCatalogPath = path.join(__dirname, '..', 'widgets-catalog');
            console.log(
                'SERVING WIDGETS CATALOG FROM:',
                widgetsCatalogPath,
                fs.existsSync(widgetsCatalogPath)
            );

            apiApp.use(
                '/widgets-catalog',
                express.static(widgetsCatalogPath)
            );

            // -------------------------------------------------

            apiApp.use(
                morgan(
                    ['combined', 'common', 'dev', 'short', 'tiny']
                        .includes(runtime.settings.logApiLevel)
                        ? runtime.settings.logApiLevel
                        : 'combined'
                )
            );

            var maxApiRequestSize = runtime.settings.apiMaxLength || '100mb';
            apiApp.use(bodyParser.json({ limit: maxApiRequestSize }));
            apiApp.use(bodyParser.urlencoded({ limit: maxApiRequestSize, extended: true }));

            // Initialize Platform services
            platform.auth.jwt.init(
                runtime.settings.secureEnabled,
                runtime.settings.secretCode,
                runtime.settings.tokenExpiresIn
            );

            // Use platform auth controller
            platform.auth.controller.init(runtime, platform.auth.jwt.secretCode, platform.auth.jwt.tokenExpiresIn);
            apiApp.use(platform.auth.controller.app());

            // Use platform users controller
            platform.users.controller.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(platform.users.controller.app());

            // Use platform RBAC controller
            platform.rbac.controller.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(platform.rbac.controller.app());

            // SCADA-specific APIs (unchanged)
            prjApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(prjApi.app());

            alarmsApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(alarmsApi.app());

            pluginsApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(pluginsApi.app());

            diagnoseApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(diagnoseApi.app());

            daqApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(daqApi.app());

            scriptsApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(scriptsApi.app());

            resourcesApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(resourcesApi.app());

            widgetsCatalogApi.init(runtime);
            apiApp.use(widgetsCatalogApi.app());

            commandApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(commandApi.app());

            reportsApi.init(runtime, platform.auth.middleware.verifyToken, verifyGroups);
            apiApp.use(reportsApi.app());

            const limiter = rateLimit({
                windowMs: 5 * 60 * 1000,
                max: 100
            });
            apiApp.use(limiter);

            apiApp.use((err, req, res, next) => {
                if (err?.type === 'entity.too.large') {
                    return res.status(413).json({
                        message: `The submitted content exceeds the maximum allowed size (${maxApiRequestSize})`
                    });
                }
                next(err);
            });

            /**
             * GET Server setting data
             */
            apiApp.get('/api/settings', function (req, res) {
                if (runtime.settings) {
                    let tosend = JSON.parse(JSON.stringify(runtime.settings));
                    delete tosend.secretCode;
                    if (tosend.smtp) {
                        delete tosend.smtp.password;
                    }
                    res.json(tosend);
                } else {
                    res.status(404).end();
                    runtime.logger.error('api get settings: Value Not Found!');
                }
            });

            /**
             * POST Server user settings
             */
            apiApp.post("/api/settings", authJwt.verifyToken, function (req, res, next) {
                const permission = verifyGroups(req);
                if (res.statusCode === 403) {
                    runtime.logger.error("api post settings: Token Expired");
                } else if (!authJwt.haveAdminPermission(permission)) {
                    res.status(401).json({ error: "unauthorized_error", message: "Unauthorized!" });
                    runtime.logger.error("api post settings: Unauthorized");
                } else {
                    try {
                        if (
                            req.body.smtp &&
                            !req.body.smtp.password &&
                            runtime.settings.smtp &&
                            runtime.settings.smtp.password
                        ) {
                            req.body.smtp.password = runtime.settings.smtp.password;
                        }
                        fs.writeFileSync(
                            runtime.settings.userSettingsFile,
                            JSON.stringify(req.body, null, 4)
                        );
                        mergeUserSettings(req.body);
                        runtime.restart(true).then(function () {
                            res.end();
                        });
                    } catch (err) {
                        res.status(400).json({ error: "unexpected_error", message: err });
                        runtime.logger.error("api post settings: " + err);
                    }
                }
            });

            /**
             * POST Heartbeat to check token
             */
            apiApp.post('/api/heartbeat', platform.auth.middleware.verifyToken, function (req, res) {
                if (!runtime.settings.secureEnabled) {
                    res.end();
                } else if (res.statusCode === 403) {
                    runtime.logger.error("api post heartbeat: Token Expired");
                } else if (req.body.params) {
                    const token = platform.auth.jwt.getNewToken(req.headers);
                    if (token) {
                        res.status(200).json({
                            message: 'tokenRefresh',
                            token: token
                        });
                    } else {
                        res.end();
                    }
                } else if (req.userId === 'guest') {
                    res.status(200).json({
                        message: 'guest',
                        token: platform.auth.jwt.getGuestToken()
                    });
                } else {
                    res.end();
                }
            });

            runtime.logger.info('api: init successful!', true);
        }
        resolve();
    });
}

function mergeUserSettings(settings) {
    if (settings.language) runtime.settings.language = settings.language;
    runtime.settings.broadcastAll = settings.broadcastAll;
    runtime.settings.secureEnabled = settings.secureEnabled;
    runtime.settings.logFull = settings.logFull;
    runtime.settings.userRole = settings.userRole;
    if (settings.secureEnabled) runtime.settings.tokenExpiresIn = settings.tokenExpiresIn;
    if (settings.smtp) runtime.settings.smtp = settings.smtp;
    if (settings.daqstore) runtime.settings.daqstore = settings.daqstore;
    if (settings.alarms) runtime.settings.alarms = settings.alarms;
}

function verifyGroups(req) {
    if (runtime.settings && runtime.settings.secureEnabled) {
        if (req.tokenExpired) {
            return runtime.settings.userRole ? null : 0;
        }
        const userInfo = runtime.users.getUserCache(req.userId);
        // return runtime.settings.userRole && req.userId !== 'admin'
        //     ? userInfo
        //     : userInfo
        //     ? userInfo.groups
        //     : req.userGroups;
        // temporary fix since no proper flow will be fixed once proper flow 

        return req.userGroups;

    } else {
        console.log("checkgroupfnc sending from else ")
        return authJwt.adminGroups[0];
    }
}

function start() { }
function stop() { }

module.exports = {
    init,
    start,
    stop,
    get apiApp() { return apiApp; },
    get server() { return server; },
    get authJwt() { return platform.auth.jwt; },  // Export platform JWT for backward compatibility
    get platform() { return platform; }  // Export platform for SCADA to use
};
