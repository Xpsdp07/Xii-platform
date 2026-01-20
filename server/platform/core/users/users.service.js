/*
* Users manager: read, write, add, remove, ... and save 
*/

'use strict';

const usrstorage = require('./usrstorage');
const rbacManager = require('../rbac/rbac.service');
const bcrypt = require('bcryptjs');

const version = '1.00';
var settings;                   // Application settings
var logger;                     // Application logger
var usersMap;                   // User map for permission

/**
 * Init Users resource
 * @param {*} _settings 
 * @param {*} log 
 */
function init(_settings, log) {
    settings = _settings;
    logger = log;
    usersMap = new Map();

    // Init Users database
    return new Promise(function (resolve, reject) {
        usrstorage.init(settings, logger).then(result => {
            logger.info('users.usrstorage-init successful!', true);
            if (result) {
                resolve();
                _loadUsers();
            } else {
                usrstorage.setDefault().then(result => {
                    logger.info('users.usrstorage-set-default successful!', true);
                    resolve();
                    _loadUsers();
                }).catch(function (err) {
                    logger.error(`users.usrstorage.set-default failed! ${err}`);
                    resolve();
                });
            }
        }).catch(function (err) {
            logger.error(`users.usrstorage-init failed ${err}`);
            reject(err);
        });
    });
}

/**
 * Get the users list
 */
function getUsers(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await rbacManager.usersService.findAll();

            // Format to match old Fuxa expectations
            const result = users.map(u => {
                // Calculate legacy bitmask from group UNs
                const groupMask = u.groups.reduce((mask, ug) => {
                    return mask | (ug.group.un || 0);
                }, 0);

                return {
                    username: u.username,
                    fullname: u.fullName,
                    password: u.password,
                    groups: groupMask,
                    info: u.info
                };
            });

            if (query && query.username) {
                const filtered = result.filter(u => u.username === query.username);
                return resolve(filtered.length > 0 ? filtered : null);
            }

            resolve(result.length > 0 ? result : null);
        } catch (err) {
            logger.error(`users.rbac-get-users failed! ${err}`);
            reject(err);
        }
    });
}

/**
 * Set the user
 */
/**
 * Set the user (Create or Update)
 */
function setUsers(query) {
    return new Promise(async (resolve, reject) => {
        if (!query.username) {
            return reject(new Error("Username is required"));
        }

        try {
            // Check if user exists
            const existingUser = await rbacManager.usersService.findOne(query.username);

            let user;
            const userData = {
                username: query.username,
                fullName: query.fullname || query.fullName,
                info: query.info || ""
            };

            if (query.password) {
                userData.password = bcrypt.hashSync(query.password, 10);
            }

            if (existingUser) {
                // UPDATE
                user = await rbacManager.prismaService.user.update({
                    where: { username: query.username },
                    data: userData
                });

                // Update groups if provided
                if (query.groups !== undefined) {
                    const allGroups = await rbacManager.groupsService.getAllGroups();
                    let matchedGroups;
                    if (Array.isArray(query.groups)) {
                        matchedGroups = allGroups.filter(g => query.groups.includes(g.id));
                    } else {
                        const bitmask = parseInt(query.groups);
                        matchedGroups = allGroups.filter(g => (g.un & bitmask) || (g.name.toLowerCase() === 'admin' && bitmask === -1));
                    }

                    // Reset and set new groups
                    await rbacManager.prismaService.userGroup.deleteMany({ where: { userId: user.id } });
                    await rbacManager.prismaService.userGroup.createMany({
                        data: matchedGroups.map(g => ({ userId: user.id, groupId: g.id }))
                    });
                }
            } else {
                // CREATE
                const allGroups = await rbacManager.groupsService.getAllGroups();
                let matchedGroups;
                if (Array.isArray(query.groups)) {
                    // New RBAC IDs
                    matchedGroups = allGroups.filter(g => query.groups.includes(g.id));
                } else if (query.groups !== undefined) {
                    // Legacy bitmask
                    const bitmask = parseInt(query.groups);
                    matchedGroups = allGroups.filter(g => (g.un & bitmask) || (g.name.toLowerCase() === 'admin' && bitmask === -1));
                } else {
                    matchedGroups = [];
                }

                user = await rbacManager.prismaService.user.create({
                    data: {
                        ...userData,
                        password: userData.password || bcrypt.hashSync('123456', 10),
                        groups: {
                            create: matchedGroups.map(g => ({ groupId: g.id }))
                        }
                    }
                });
            }

            // Calculate legacy bitmask for cache
            const allMatchedGroups = await rbacManager.prismaService.userGroup.findMany({
                where: { userId: user.id },
                include: { group: true }
            });
            const legacyGroups = allMatchedGroups.map(ug => ug.group.un || 0);
            const bitmask = legacyGroups.reduce((acc, current) => acc | current, 0);

            // Sync cache
            usersMap.set(user.username, {
                info: user.info,
                groups: bitmask
            });

            resolve(user);
        } catch (err) {
            logger.error(`users.rbac-set-users failed! ${err}`);
            reject(err);
        }
    });
}

/**
 * Remove the user
 */
function removeUsers(username) {
    return new Promise(function (resolve, reject) {
        if (username) {
            usrstorage.removeUser(username).then(() => {
                resolve();
            }).catch(function (err) {
                logger.error(`users.usrstorage-remove-users failed! ${err}`);
                reject(err);
            });
        } else {
            reject();
        }
    });
}

/**
 * Get the roles list
 */
function getRoles() {
    return new Promise(function (resolve, reject) {
        usrstorage.getRoles().then(drows => {
            var roles = [];
            for (var id = 0; id < drows.length; id++) {
                roles.push(JSON.parse(drows[id].value));
            }
            resolve(roles);
        }).catch(function (err) {
            logger.error(`users.usrstorage-get-roles-list failed! ${err}`);
            reject(err);
        });
    });
}

/**
 * Set the role
 */
function setRoles(query) {
    return new Promise(function (resolve, reject) {
        if (query && query.length) {
            usrstorage.setRoles(query).then(() => {
                resolve();
            }).catch(function (err) {
                logger.error(`users.usrstorage-set-role failed! ${err}`);
                reject(err);
            });
        } else {
            reject();
        }
    });
}

/**
 * Remove the role
 */
function removeRoles(roles) {
    return new Promise(function (resolve, reject) {
        if (roles && roles.length) {
            usrstorage.removeRoles(roles).then(() => {
                resolve();
            }).catch(function (err) {
                logger.error(`users.usrstorage-remove-role failed! ${err}`);
                reject(err);
            });
        } else {
            reject();
        }
    });
}

/**
 * Find the user
 */
function findOne(user) {
    return new Promise(function (resolve, reject) {
        usrstorage.getUsers(user).then(drows => {
            if (drows.length > 0) {
                resolve(drows);
            } else {
                resolve();
            }
        }).catch(function (err) {
            logger.error(`users.usrstorage-find-user failed! ${err}`);
            reject(err);
        });
    });
}

/**
 * Return user info with permission { roles, groups }
 * @param {*} username 
 * @returns 
 */
function getUserCache(username) {
    return usersMap.get(username);
}

function _loadUsers() {
    getUsers().then(users => {
        for (var id = 0; id < users.length; id++) {
            try {
                const info = JSON.parse(users[id].info);
                usersMap.set(users[id].username, { info: info, groups: users[id].groups });
            } catch (e) {
                logger.error(`users.usrstorage-loadUsers failed! ${e}`);
            }
        }
    }).catch(function (err) {
        logger.error(`users.usrstorage-loadUsers failed! ${err}`);
    });
}

module.exports = {
    init: init,
    getUsers: getUsers,
    setUsers: setUsers,
    removeUsers: removeUsers,
    getRoles: getRoles,
    setRoles: setRoles,
    removeRoles: removeRoles,
    findOne: findOne,
    getUserCache: getUserCache
};