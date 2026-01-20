/**
 * Platform Core - Entry Point
 * Provides authentication, users, and RBAC services
 * This is the main API that SCADA and other products will consume
 */

// Authentication services
const authController = require('./core/auth/auth.controller');
const jwtService = require('./core/auth/jwt.service');
const jwtMiddleware = require('./core/auth/jwt.middleware');

// User services
const usersService = require('./core/users/users.service');
const usersController = require('./core/users/users.controller');
const usrstorage = require('./core/users/usrstorage');

// RBAC services
const rbacService = require('./core/rbac/rbac.service');
const rbacController = require('./core/rbac/rbac.controller');

// Platform configuration
const platformConfig = require('./config/platform.config');

/**
 * Platform Core API
 * Export services organized by domain
 */
module.exports = {
    // Authentication & JWT
    auth: {
        controller: authController,
        jwt: jwtService,
        middleware: jwtMiddleware
    },

    // User management
    users: {
        service: usersService,
        controller: usersController,
        storage: usrstorage
    },

    // RBAC (Groups, roles, permissions)
    rbac: {
        service: rbacService,
        controller: rbacController
    },

    // Platform configuration
    config: platformConfig,

    // Convenience exports for backward compatibility
    jwtHelper: jwtService,
    verifyToken: jwtMiddleware.verifyToken
};
