'use strict';

/**
 * Platform Core - JWT Service
 * Handles JWT token creation, verification, and validation
 * Extracted from SCADA to platform layer
 */

const jwt = require('jsonwebtoken');
const platformConfig = require('../../config/platform.config');

var secureEnabled = false;
var secretCode = platformConfig.jwtSecret;
var tokenExpiresIn = platformConfig.jwtExpiresIn;

/**
 * Initialize JWT service
 * @param {boolean} _secureEnabled - Enable secure mode
 * @param {string} _secretCode - JWT secret
 * @param {number} _tokenExpires - Token expiration in seconds
 */
function init(_secureEnabled, _secretCode, _tokenExpires) {
    secureEnabled = _secureEnabled;
    if (_secretCode) {
        secretCode = _secretCode;
    }
    if (_tokenExpires) {
        tokenExpiresIn = _tokenExpires;
    }
}

/**
 * Verify token
 * @param {string} token - JWT token to verify
 * @returns {Promise<boolean>} - Promise that resolves to true if valid
 */
function verify(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretCode, (err, decoded) => {
            if (err) {
                console.error(`verify token error: ${err}`);
                reject(false);
            } else {
                resolve(decoded);
            }
        });
    });
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {object} - Decoded token payload
 */
function decode(token) {
    return jwt.decode(token);
}

/**
 * Generate new token from headers
 * @param {object} headers - Request headers
 * @returns {string|null} - JWT token or null
 */
function getNewToken(headers) {
    const authUser = (headers['x-auth-user']) ? JSON.parse(headers['x-auth-user']) : null;
    if (authUser) {
        return jwt.sign({
            id: authUser.user,
            groups: authUser.groups,
            permissions: authUser.permissions || []
        },
            secretCode, {
            expiresIn: tokenExpiresIn
        });
    }
    return null;
}

/**
 * Generate guest token
 * @returns {string} - Guest JWT token
 */
function getGuestToken() {
    const token = jwt.sign({
        id: "guest",
        groups: ["guest"],
        permissions: []
    },
        secretCode, {
        expiresIn: tokenExpiresIn
    });
    return token;
}

/**
 * Create JWT token for authenticated user
 * @param {object} userData - User data { id, username, groups, permissions }
 * @returns {string} - JWT token
 */
function createToken(userData) {
    return jwt.sign({
        id: userData.username || userData.id,
        groups: userData.groups || [],
        permissions: userData.permissions || []
    },
        secretCode, {
        expiresIn: tokenExpiresIn
    });
}

/**
 * Check if user has admin permission
 * @param {number|array} permission - Permission value or groups array
 * @returns {boolean}
 */
function haveAdminPermission(permission) {
    if (permission === null || permission === undefined) {
        return false;
    }
    if (platformConfig.adminGroups.indexOf(permission) !== -1) {
        return true;
    }
    return false;
}

/**
 * Get token expiration time
 * @returns {number} - Token expiration in seconds
 */
function getTokenExpiresIn() {
    return tokenExpiresIn;
}

module.exports = {
    init,
    verify,
    decode,
    getNewToken,
    getGuestToken,
    createToken,
    haveAdminPermission,
    getTokenExpiresIn,
    get secretCode() { return secretCode },
    get tokenExpiresIn() { return tokenExpiresIn },
    adminGroups: platformConfig.adminGroups
};
