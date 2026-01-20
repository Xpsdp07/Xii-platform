const rbacManager = require('./api/rbac/rbac-manager');

async function initData() {
    try {
        console.log('--- Initializing RBAC Bitmasks ---');

        const groups = await rbacManager.prismaService.group.findMany();
        for (let i = 0; i < groups.length; i++) {
            const g = groups[i];
            let un = 2 ** i;
            let super_un = null;

            if (g.name.toLowerCase() === 'admin') {
                un = -1; // Special case for Admin
            }

            console.log(`Updating Group ${g.name}: un=${un}`);
            await rbacManager.prismaService.group.update({
                where: { id: g.id },
                data: { un, super_un }
            });
        }

        const modules = await rbacManager.prismaService.module.findMany();
        for (let i = 0; i < modules.length; i++) {
            const m = modules[i];
            let un = 2 ** i;

            console.log(`Updating Module ${m.name}: un=${un}`);
            await rbacManager.prismaService.module.update({
                where: { id: m.id },
                data: { un }
            });
        }

        console.log('\nSuccess! Bitmasks initialized.');

    } catch (e) {
        console.error('Initialization failed:', e);
    } finally {
        await rbacManager.prismaService.$disconnect();
    }
}

initData();
