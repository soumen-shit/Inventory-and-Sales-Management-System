import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/database/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    // Check if email exists
    const existingEmail = await this.customerRepo.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Check if phone exists
    const existingPhone = await this.customerRepo.findOne({
      where: { phone: createCustomerDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Customer with this phone already exists');
    }

    const customer = this.customerRepo.create(createCustomerDto);
    return this.customerRepo.save(customer);
  }

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepo.createQueryBuilder('customer');

    if (query?.search) {
      queryBuilder.where(
        '(customer.name ILIKE :search OR customer.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('customer.created_at', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ['salesOrders'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepo.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingEmail = await this.customerRepo.findOne({
        where: { email: updateCustomerDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateCustomerDto.phone && updateCustomerDto.phone !== customer.phone) {
      const existingPhone = await this.customerRepo.findOne({
        where: { phone: updateCustomerDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone already exists');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return this.customerRepo.save(customer);
  }

  async changeStatus(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.is_active = !customer.is_active;
    return this.customerRepo.save(customer);
  }
}
