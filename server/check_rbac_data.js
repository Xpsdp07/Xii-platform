require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const groups = await prisma.group.findMany();
        console.log('--- GROUPS ---');
        groups.forEach(g => {
            console.log(`ID: ${g.id}, Name: ${g.name}, UN: ${g.un}, SuperUN: ${g.super_un}`);
        });

        const users = await prisma.user.findMany({
            include: {
                groups: {
                    include: {
                        group: true
                    }
                }
            }
        });
        console.log('\n--- USERS ---');
        users.forEach(u => {
            const groupList = u.groups.map(g => g.group.name).join(', ');
            console.log(`User: ${u.username}, Groups: [${groupList}]`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
