/**
 * 'api/auth': Authentication API to Sign In/Out users
 */

var express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var runtime;
var secretCode;
var tokenExpiresIn;

// RBAC imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    init: function (_runtime, _secretCode, _tokenExpires) {
        runtime = _runtime;
        secretCode = _secretCode;
        tokenExpiresIn = _tokenExpires;
    },

    app: function () {
        var authApp = express();

        authApp.use(function (req, res, next) {
            if (!runtime.project) {
                res.status(404).end();
            } else {
                next();
            }
        });

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
                 */
                const fuxaUN = fullUser.groups.reduce((s, g) => s + (g.group.un || 0), 0);
                const fuxaSuperUN = fullUser.groups.reduce((s, g) => s + (g.group.super_un || 0), 0);
                const fuxaGroupsValue = fuxaUN + fuxaSuperUN;

                console.log("fuxaGroupsValue:", fuxaGroupsValue);

                const fuxaUser = {
                    username: fullUser.username,
                    fullname: fullUser.fullName,
                    groups: -1, // legacy for compatibility
                    info: fullUser.info,
                    permissions // 🔥 send permissions to frontend
                };

                // 4) Issue JWT
                const token = jwt.sign(
                    {
                        id: fuxaUser.username,
                        groups: fuxaUser.groups,
                        permissions: permissions  // optional: embed into token
                    },
                    secretCode,
                    { expiresIn: tokenExpiresIn }
                );

                // 5) Send response
                return res.json({
                    status: 'success',
                    message: 'user authenticated',
                    data: {
                        ...fuxaUser,
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
