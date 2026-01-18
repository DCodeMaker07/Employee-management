import { ForbiddenException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { envs } from 'src/config/envs';
import type { Cache } from 'cache-manager';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class EmployeesService {

  private readonly logger = new Logger('EmployeeService');

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto) {

    const employee = await this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        fechaNacimiento: new Date(createEmployeeDto.fechaNacimiento)
      }
    });

    await this.bumpEmployeesCacheVersion();

    return employee;
  }

  async findAll({ limit, page }: PaginationDto) {

    const version = await this.getEmployeesCacheVersion();

    const key = `employees:v${version}:page=${page}:limit=${limit}`;

    const cached = await this.cacheManager.get(key);

    if (cached) return cached;

    const totalPages = await this.prisma.employee.count();
    const lastPage = Math.ceil(totalPages / limit!);

    const employees = await this.prisma.employee.findMany({
      take: limit,
      skip: (page! - 1) * limit!
    });

    const response = {
      data: employees,
      meta: {
        page,
        totalPages,
        lastPage
      }
    }

    await this.cacheManager.set(key, response, 10_000);

    return response;
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id
      }
    });

    if (!employee) throw new NotFoundException({
      message: `Employee with id: [${id}] not found`,
      status: HttpStatus.NOT_FOUND
    });

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {

    const { id: __, ...dto } = updateEmployeeDto;

    await this.findOne(id);

    if (Object.values(updateEmployeeDto).length === 0) {
      return {
        message: 'nothing for update',
      }
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: new Date(dto.fechaNacimiento!)
      }
    });

    await this.bumpEmployeesCacheVersion();

    return employee;

  }

  async remove(id: number) {

    await this.findOne(id);

    await this.bumpEmployeesCacheVersion();

    return await this.prisma.employee.delete({
      where: {
        id
      }
    })
  }

  private async getEmployeesCacheVersion(): Promise<number> { // Get version for in-memory cache
    return (await this.cacheManager.get('employees:version')) || 1;
  }

  private async bumpEmployeesCacheVersion() { // Increment version for in-memory cache
    const version = (await this.getEmployeesCacheVersion()) + 1;
    await this.cacheManager.set('employees:version', version);
  }

  async insertAll(createEmployeeDto: CreateEmployeeDto[]) {
    if (envs.nodeEnv === "prod") {
      throw new ForbiddenException(`Seed disabled in production`);
    }
    await this.prisma.employee.createMany({
      data: createEmployeeDto.map((item) => ({
        ...item,
        fechaNacimiento: new Date(item.fechaNacimiento)
      }))
    })
  }

  async removeAll() {
    if (envs.nodeEnv === "prod") {
      throw new ForbiddenException(`Seed disabled in production`);
    }
    await this.prisma.employee.deleteMany();
  }
}
