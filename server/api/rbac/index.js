/**
 * 'api/rbac': RBAC API using official @xplbs/rbac services
 */

const express = require("express");
const rbacManager = require("./rbac-manager");

var runtime;
var secureFnc;
var checkGroupsFnc;

module.exports = {
    init: function (_runtime, _secureFnc, _checkGroupsFnc) {
        runtime = _runtime;
        secureFnc = _secureFnc;
        checkGroupsFnc = _checkGroupsFnc;
    },
    app: function () {
        var rbacApp = express();

        /**
         * GET Groups
         */
        rbacApp.get("/api/groups", secureFnc, async (req, res) => {
            try {
                const groups = await rbacManager.groupsService.getAllGroups();
                res.json(groups);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * GET Modules
         */
        rbacApp.get("/api/modules", secureFnc, async (req, res) => {
            try {
                // We'll use a direct prisma call if service doesn't have it, 
                // but usually GroupsService might have it via prisma link
                const modules = await rbacManager.prismaService.module.findMany({
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                });

                // Format as expected by UserCreateComponent
                const formatted = modules.map(m => ({
                    id: m.id.toString(),
                    name: m.name,
                    available: m.permissions.map(p => p.permission.name.split('.').pop()) // Get 'Create' from 'Design.Create'
                }));

                res.json(formatted);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * GET Group Permissions
         */
        rbacApp.get("/api/groups/:id/permissions", secureFnc, async (req, res) => {
            try {
                const groupId = parseInt(req.params.id);
                const perms = await rbacManager.groupsService.getGroupModulePermissions(groupId);

                // Format for frontend: { [moduleId]: { 'Create': true... } }
                const result = {};
                perms.forEach(p => {
                    const modId = p.moduleId.toString();
                    if (!result[modId]) result[modId] = {};
                    const action = p.permissionName.split('.').pop();
                    result[modId][action] = true;
                });

                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * POST Resolve Group Permissions (Merge)
         * Body: { groupIds: [1, 2] }
         */
        rbacApp.post("/api/groups/resolve-permissions", secureFnc, async (req, res) => {
            try {
                const { groupIds } = req.body;
                if (!Array.isArray(groupIds)) {
                    return res.status(400).json({ error: "invalid_input", message: "groupIds must be an array" });
                }
                const perms = await rbacManager.groupsService.mergeGroupPermissions(groupIds);
                // Format: { [moduleId]: { 'Create': true, ... } }
                const result = {};
                perms.forEach(p => {
                    const modId = p.moduleId.toString();
                    if (!result[modId]) result[modId] = {};
                    p.permissions.forEach(permName => {
                        const action = permName.split('.').pop();
                        result[modId][action] = true;
                    });
                });
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * GET User Groups
         */
        rbacApp.get("/api/users/:id/groups", secureFnc, async (req, res) => {
            try {
                const userId = parseInt(req.params.id);
                // UsersService.getUserGroups returns { id, username, groups: string[] }
                // We might want full group objects, but service returns names. 
                // Let's use clean method from service
                const userGroups = await rbacManager.usersService.getUserGroups(userId);
                res.json(userGroups);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * GET User Effective Permissions
         */
        rbacApp.get("/api/users/:id/effective-permissions", secureFnc, async (req, res) => {
            try {
                const userId = parseInt(req.params.id);
                const perms = await rbacManager.usersService.resolveEffectiveUserPermissions(userId);
                // Format: { [moduleId]: { 'Create': true, ... } }
                const result = {};
                perms.forEach(p => {
                    const modId = p.moduleId.toString();
                    if (!result[modId]) result[modId] = {};
                    p.permissions.forEach(permName => {
                        const action = permName.split('.').pop();
                        result[modId][action] = true;
                    });
                });
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
        * POST Create Group
        */
        rbacApp.post("/api/groups", secureFnc, async (req, res) => {
            try {
                const { name } = req.body;
                if (!name) return res.status(400).json({ error: "missing_name" });
                const group = await rbacManager.groupsService.createGroup(name);
                res.json(group);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * GET Group Details
         */
        rbacApp.get("/api/groups/:id", secureFnc, async (req, res) => {
            try {
                const groupId = parseInt(req.params.id);
                const group = await rbacManager.groupsService.getGroupById(groupId);
                if (!group) return res.status(404).json({ error: "not_found" });
                res.json(group);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
         * POST Assign Module Permission to Group
         */
        rbacApp.post("/api/groups/:id/module-permissions", secureFnc, async (req, res) => {
            try {
                const groupId = parseInt(req.params.id);
                const { moduleId, permissionId } = req.body;

                await rbacManager.groupsService.validateGroupModulePermissions({ moduleId, permissionId });

                const result = await rbacManager.groupsService.assignModulePermissionToGroup(groupId, moduleId, permissionId);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        /**
        * DELETE Remove Module Permission from Group
        */
        rbacApp.delete("/api/groups/:id/module-permissions", secureFnc, async (req, res) => {
            try {
                const groupId = parseInt(req.params.id);
                const { moduleId, permissionId } = req.body; // usually DELETE body is not standard, used query?
                // If body is empty, check query
                const mId = moduleId || parseInt(req.query.moduleId);
                const pId = permissionId || parseInt(req.query.permissionId);

                const result = await rbacManager.groupsService.removeModulePermissionFromGroup(groupId, mId, pId);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: "db_error", message: err.message });
            }
        });

        return rbacApp;
    }
};
