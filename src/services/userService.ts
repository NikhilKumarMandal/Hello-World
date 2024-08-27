import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
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
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (error) {
      console.error("Database error:", error);
      const err = createHttpError(500, "Failed to store the data in database");
      throw err;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: IUser) {
    return await this.userRepository.update(id, data);
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }

  async getAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        })
      );
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();
    return result;
  }
}
