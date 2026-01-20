'use strict';

/**
 * Platform Core - JWT Middleware
 * Middleware for verifying JWT tokens in API requests
 * Extracted from SCADA jwt-helper.js
 */

const jwt = require('jsonwebtoken');
const jwtService = require('./jwt.service');

/**
 * Verify WebAPI token (from request header)
 * Middleware that verifies JWT and attaches user info to request
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
function verifyToken(req, res, next) {
    let token = req.headers['x-access-token'];

    if (!token) {
        token = jwtService.getGuestToken();
    }

    if (token) {
        jwt.verify(token, jwtService.secretCode, (err, decoded) => {
            if (err) {
                console.log("JWT verification failed, assigning guest. Error:", err.message);
                req.userId = "guest";
                req.userGroups = ["guest"];
                req.userPermissions = [];
            } else {
                console.log("JWT verified successfully");
                req.userId = decoded.id;
                req.userGroups = decoded.groups;
                req.userPermissions = decoded.permissions || [];

                // Validate against x-auth-user header if present
                if (req.headers['x-auth-user']) {
                    try {
                        let user = JSON.parse(req.headers['x-auth-user']);
                        if (user && user.groups != req.userGroups) {
                            return res.status(403).json({
                                error: "unauthorized_error",
                                message: "User Profile Corrupted!"
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing x-auth-user header:", e);
                    }
                }
            }
            next();
        });
    } else {
        // No token provided
        req.userId = null;
        req.userGroups = null;
        req.userPermissions = [];
        next();
    }
}

/**
 * Middleware to require authentication
 * Use this to protect routes that need authentication
 */
function requireAuth(req, res, next) {
    if (!req.userId || req.userId === "guest") {
        return res.status(401).json({
            error: "unauthorized_error",
            message: "Authentication required"
        });
    }
    next();
}

/**
 * Middleware to require admin permission
 * Use this to protect admin-only routes
 */
function requireAdmin(req, res, next) {
    if (!jwtService.haveAdminPermission(req.userGroups)) {
        return res.status(403).json({
            error: "forbidden_error",
            message: "Admin permission required"
        });
    }
    next();
}

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Required permission string
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.userPermissions || !req.userPermissions.includes(permission)) {
            return res.status(403).json({
                error: "forbidden_error",
                message: `Permission '${permission}' required`
            });
        }
        next();
    };
}

module.exports = {
    verifyToken,
    requireAuth,
    requireAdmin,
    requirePermission
};
