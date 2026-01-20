const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const rbacBase = path.join(__dirname, '../../../node_modules/@xplbs/rbac/dist');

const { PrismaService } = require(path.join(rbacBase, 'prisma/prisma.service'));
const { UsersService } = require(path.join(rbacBase, 'users/users.service'));
const { GroupsService } = require(path.join(rbacBase, 'auth/groups.service'));

// Instantiate PrismaService
const prismaService = new PrismaService();

// Instantiate RBAC Services with shared PrismaService
const usersService = new UsersService(prismaService);
const groupsService = new GroupsService(prismaService);

module.exports = {
    prismaService,
    usersService,
    groupsService
};
