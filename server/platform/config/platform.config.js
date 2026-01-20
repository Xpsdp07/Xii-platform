/**
 * Platform Configuration
 * Core configuration for the platform layer (identity, auth, RBAC)
 */

const path = require('path');

module.exports = {
    // Database configuration
    databasePath: path.join(__dirname, '../database/platform.db'),

    // JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_123',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || 60 * 60, // 1 hour in seconds

    // Admin groups (for backward compatibility)
    adminGroups: [-1, 255],

    // Platform-level permissions (domain-agnostic)
    // These are just strings to the platform - domains interpret them
    platformPermissions: [
        // User management
        'USER_CREATE',
        'USER_READ',
        'USER_UPDATE',
        'USER_DELETE',

        // Role/Group management
        'ROLE_CREATE',
        'ROLE_UPDATE',
        'ROLE_DELETE',
        'GROUP_MANAGE',

        // Organization management
        'ORG_ADMIN',
        'ORG_CREATE',

        // SCADA permissions (defined by SCADA)
        'PROJECT_CREATE',
        'PROJECT_DELETE',
        'DEVICE_CREATE',
        'DEVICE_DELETE',
        'SCADA_CONTROL',
        'SCADA_NETWORK_EDIT',
        'SCADA_ALARM_VIEW',

        // WAB permissions (for future use)
        'WAB_APP_EDIT',
        'WAB_DEPLOY'
    ]
};
