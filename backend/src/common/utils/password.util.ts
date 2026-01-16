import * as bcrypt from 'bcrypt';
export async function hashPassword(password: string): Promise<string> {
  console.log('🔐 Hashing password');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  console.log('🔍 Comparing password');
  return bcrypt.compare(password, hash);
}
