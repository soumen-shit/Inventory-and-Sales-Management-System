// import { AppDataSource } from '../data-source';
// import { PaymentMaythod } from '../entities/payment-method.entity';
// import { Role } from '../entities/role.entity';

// export async function seedRoles() {
//   const repo = AppDataSource.getRepository(Role);
//   const methods = [
//     {
//       name: 'ONLINE',
//     },
//     {
//       name: 'OFFLINE',
//     },
//   ];

//   for (const method of methods) {
//     const exists = await repo.findOne({
//       where: {
//         name: method.name,
//       },
//     });
//     if (exists) {
//       continue;
//     }

//     const newMethod = repo.create(method);
//     // await PaymentMaythod.save(method);
//   }
// }
