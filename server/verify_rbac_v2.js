const rbacManager = require('./api/rbac/rbac-manager');

async function verify() {
    try {
        console.log('--- Checking Groups (Legacy Bitmasks) ---');
        const groups = await rbacManager.groupsService.getAllGroups();
        groups.forEach(g => {
            console.log(`Group: ${g.name}, UN: ${g.un}, SuperUN: ${g.super_un}`);
        });

        console.log('\n--- Checking Users (Calculated Bitmasks) ---');
        const users = await rbacManager.usersService.findAll();
        users.forEach(u => {
            const groupMask = u.groups.reduce((mask, ug) => {
                return mask | (ug.group.un || 0);
            }, 0);
            console.log(`User: ${u.username}, Legacy Groups Value: ${groupMask}`);
        });

        console.log('\n--- Checking Permissions Helper ---');
        if (users.length > 0) {
            const perms = await rbacManager.usersService.resolveEffectiveUserPermissions(users[0].id);
            console.log(`Permissions for ${users[0].username}:`, JSON.stringify(perms, null, 2));
        }

    } catch (e) {
        console.error('Verification failed:', e);
    } finally {
        await rbacManager.prismaService.$disconnect();
    }
}

verify();
