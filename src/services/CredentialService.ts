import bcrypt from "bcryptjs";
export class CredentialService {
  // comapre password
  async comparePassword(password: string, hasedPassword: string) {
    return await bcrypt.compare(password, hasedPassword);
  }
}
