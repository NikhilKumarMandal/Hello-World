import bcrypt from "bcrypt";
export class CredentialService {
  // comapre password
  async comparePassword(password: string, hasedPassword: string) {
    return await bcrypt.compare(password, hasedPassword);
  }
}
