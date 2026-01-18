import { ForbiddenException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { envs } from 'src/config/envs';

@Injectable()
export class EmployeesService {
  
  private readonly logger = new Logger('EmployeeService');

  constructor(private prisma: PrismaService) { }

  async create(createEmployeeDto: CreateEmployeeDto) {
    return await this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        fechaNacimiento: new Date(createEmployeeDto.fechaNacimiento)
      }
    });
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit, page } = paginationDto;

    const totalPages = await this.prisma.employee.count();
    const lastPage = Math.ceil(totalPages/limit!);

    const employees = await this.prisma.employee.findMany({
      take: limit,
      skip: ( page! - 1 ) * limit!
    });

    return {
      data: employees,
      meta: {
        page,
        totalPages,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const employee =  await this.prisma.employee.findUnique({
      where: {
        id
      }
    });

    if(!employee) throw new NotFoundException({
      message: `Employee with id: [${id}] not found`,
      status: HttpStatus.NOT_FOUND
    });

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    
    const { id: __, ...dto } = updateEmployeeDto;

    await this.findOne(id);

    if(Object.values(updateEmployeeDto).length === 0) {
      return {
        message: 'nothing for update',
      }
    }

    return await this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: new Date(dto.fechaNacimiento!)
      }
    });

  }

  async remove(id: number) {

    await this.findOne(id);

    return await this.prisma.employee.delete({
      where: {
        id
      }
    })
  }

  async insertAll(createEmployeeDto: CreateEmployeeDto[]) {
    if(envs.nodeEnv === "prod"){
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
    if(envs.nodeEnv === "prod"){
      throw new ForbiddenException(`Seed disabled in production`);
    }
    await this.prisma.employee.deleteMany();
  }
}
