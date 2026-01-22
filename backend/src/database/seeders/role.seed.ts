import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';

export async function seedRoles() {
  const repo = AppDataSource.getRepository(Role);
  const roles = [
    {
      name: 'ADMIN',
      description: 'System Administrator',
    },
    {
      name: 'MANAGER',
      description: 'Store / Inventory Manager',
    },
    {
      name: 'STAFF',
      description: 'Sales / Inventory Staff',
    },
  ];

  for (const role of roles) {
    const exists = await repo.findOne({
      where: {
        name: role.name,
      },
    });
    if (exists) {
      continue;
    }

    const newRole = repo.create(role);
    await repo.save(newRole);
  }
}
