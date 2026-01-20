/**
 * Platform Core - Authentication Controller
 * Handles user sign-in, authentication, and JWT issuance
 * Extracted from SCADA api/auth
 */

var express = require('express');
const bcrypt = require('bcryptjs');
const jwtService = require('./jwt.service');

// RBAC imports - Platform uses Prisma directly
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

var secretCode;
var tokenExpiresIn;

module.exports = {
    init: function (_runtime, _secretCode, _tokenExpires) {
        // Initialize from SCADA runtime (for backward compatibility)
        // In future, platform won't need runtime
        secretCode = _secretCode;
        tokenExpiresIn = _tokenExpires;

        // Initialize JWT service with same config
        jwtService.init(false, _secretCode, _tokenExpires);
    },

    app: function () {
        var authApp = express();

        /**
         * POST /api/signin
         * Validate user, fetch permissions, and issue JWT
         */
        authApp.post('/api/signin', async function (req, res) {
            try {
                const { username, password } = req.body;

                // 1) Find user
                const user = await prisma.user.findUnique({
                    where: { username },
                    include: { groups: true }
                });

                if (!user) {
                    return res
                        .status(401)
                        .json({ status: 'error', message: 'Invalid username/password' });
                }

                // 2) Validate password
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res
                        .status(401)
                        .json({ status: 'error', message: 'Invalid username/password' });
                }

                // 3) Load full RBAC structure
                const fullUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        groups: {
                            include: {
                                group: {
                                    include: {
                                        GroupPermissions: {
                                            include: { GroupPermission: true }
                                        },
                                        modulePermissions: {
                                            include: {
                                                module: true,
                                                permission: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        modules: {
                            include: {
                                module: {
                                    include: {
                                        permissions: {
                                            include: { permission: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                /**
                 * EXTRACT GROUP PERMISSIONS (Global)
                 */
                const groupPermissions =
                    fullUser.groups.flatMap(g =>
                        (g.group?.GroupPermissions || []).map(j => j.GroupPermission?.name).filter(Boolean)
                    );
                console.log("Global group permissions:", groupPermissions);

                /**
                 * EXTRACT MODULE PERMISSIONS (from Groups)
                 */
                const groupModulePermissions =
                    fullUser.groups.flatMap(g =>
                        (g.group?.modulePermissions || []).map(mp => (mp.module && mp.permission) ? `${mp.module.name}.${mp.permission.name}` : null).filter(Boolean)
                    );
                console.log("Module permissions from groups:", groupModulePermissions);

                /**
                 * EXTRACT DIRECT MODULE PERMISSIONS (User Overrides - Prototype)
                 */
                const directModulePermissions =
                    fullUser.modules.flatMap(m =>
                        (m.module?.permissions || []).map(j => (m.module && j.permission) ? `${m.module.name}.${j.permission.name}` : null).filter(Boolean)
                    );
                console.log("Direct module permissions:", directModulePermissions);

                /**
                 * FINAL PERMISSIONS (deduplicated)
                 */
                const permissions = [...new Set([
                    ...groupPermissions,
                    ...groupModulePermissions,
                    ...directModulePermissions
                ])];

                console.log("Final effective permissions for user:", username, permissions);

                /**
                 * FUXA Legacy Group Value (FOR OLD FLOW)
                 * This is SCADA-specific but kept for backward compatibility
                 * Will be removed when SCADA fully migrates to permission-based auth
                 */
                const fuxaUN = fullUser.groups.reduce((s, g) => s + (g.group.un || 0), 0);
                const fuxaSuperUN = fullUser.groups.reduce((s, g) => s + (g.group.super_un || 0), 0);
                const fuxaGroupsValue = fuxaUN + fuxaSuperUN;

                console.log("fuxaGroupsValue:", fuxaGroupsValue);

                const userData = {
                    username: fullUser.username,
                    fullname: fullUser.fullName,
                    groups: -1, // legacy for compatibility
                    info: fullUser.info,
                    permissions // Platform RBAC permissions
                };

                // 4) Issue JWT using platform JWT service
                const token = jwtService.createToken({
                    username: userData.username,
                    groups: userData.groups,
                    permissions: permissions
                });

                // 5) Send response
                return res.json({
                    status: 'success',
                    message: 'user authenticated',
                    data: {
                        ...userData,
                        token
                    }
                });

            } catch (err) {
                console.error("SIGNIN ERROR:", err);
                return res.status(400).json({
                    status: 'error',
                    message: err.toString()
                });
            }
        });

        return authApp;
    }
};
