const { PrismaClient, DocumentStatus, TenantRole } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "owner@devhouse.club" },
    update: {},
    create: {
      email: "owner@devhouse.club",
      name: "Devhouse Owner",
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "ACME Co.",
      slug: "acme",
    },
  });

  await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id,
      },
    },
    update: { role: TenantRole.OWNER },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: TenantRole.OWNER,
    },
  });

  const existingDoc = await prisma.document.findFirst({
    where: {
      tenantId: tenant.id,
      fullPath: "index",
    },
  });

  if (!existingDoc) {
    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: "Getting Started",
        slug: "index",
        fullPath: "index",
        contentHtml: "<p>Welcome to your customer documentation.</p>",
        status: DocumentStatus.PUBLISHED,
        updatedById: user.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });