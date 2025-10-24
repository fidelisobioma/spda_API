const { PrismaClient } = require("@prisma/client");
// const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

module.exports = prisma;
