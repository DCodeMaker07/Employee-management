import { Injectable } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { employeesSeed } from './data/employee-seed';

@Injectable()
export class SeedService {
  
  constructor(
    private readonly employeesService: EmployeesService,
  ) { }

  async runSeed() {

    await this.deleteEmployeeRegisters();

    await this.insertEmployees();

    return 'Seed executed';

  }

  private async insertEmployees() {

    const seedEmployee = employeesSeed;

    await this.employeesService.insertAll(seedEmployee);

  }

  private async deleteEmployeeRegisters() {

    await this.employeesService.removeAll();
    
  }

}
