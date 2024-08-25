import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async update(id: number, data: ITenant) {
    return await this.tenantRepository.update(id, data);
  }
}
