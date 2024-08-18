import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constant";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    // check user is already exists or not

    const user = await this.userRepository.findOne({ where: { email: email } });

    if (user) {
      const err = createHttpError(400, "Email is already is exits!");
      throw err;
    }

    // Hash Password
    const saltRound = 10;
    const hasdPassword = await bcrypt.hash(password, saltRound);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hasdPassword,
        role: Roles.CUSTOMER,
      });
    } catch (error) {
      console.error("Database error:", error);
      const err = createHttpError(500, "Failed to store the data in database");
      throw err;
    }
  }
}
