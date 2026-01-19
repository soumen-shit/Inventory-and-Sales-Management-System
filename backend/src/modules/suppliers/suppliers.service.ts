import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from 'src/database/entities/supplier.entity';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
  ) {}

  async createSupplier(createSupplierDto: CreateSupplierDto) {
    const existsSupplier = await this.supplierRepo.findOne({
      where: [
        { email: createSupplierDto.email },
        { phone: createSupplierDto.phone },
        { gst_number: createSupplierDto.gst_number },
      ],
    });

    if (existsSupplier) {
      throw new ConflictException('Supplier already exists');
    }

    const supplier = this.supplierRepo.create(createSupplierDto);
    return await this.supplierRepo.save(supplier);
  }

  async findAllSupplier() {
    const suppliers = await this.supplierRepo.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    if (!suppliers) {
      throw new NotFoundException('Supplier not found');
    }

    return suppliers;
  }

  async findSupplierById(id: string) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async updateSupplier(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (updateSupplierDto.name) {
      supplier.name = updateSupplierDto.name;
    }
    if (updateSupplierDto.email) {
      const isEmailExits = await this.supplierRepo.findOne({
        where: { email: updateSupplierDto.email },
      });

      if (isEmailExits) {
        throw new ConflictException('Supplier email already exists');
      } else {
        supplier.email = updateSupplierDto.email;
      }
    }

    if (updateSupplierDto.phone) {
      const isPhoneExsits = await this.supplierRepo.findOne({
        where: { phone: updateSupplierDto.phone },
      });

      if (isPhoneExsits) {
        throw new ConflictException('Supplier phone number already exists');
      } else {
        supplier.phone = updateSupplierDto.phone;
      }
    }

    if (updateSupplierDto.address) {
      supplier.address = updateSupplierDto.address;
    }

    if (updateSupplierDto.gst_number) {
      const isGstExits = await this.supplierRepo.findOne({
        where: { gst_number: updateSupplierDto.gst_number },
      });

      if (isGstExits) {
        throw new ConflictException('Supplier Gst number already exists');
      } else {
        supplier.gst_number = updateSupplierDto.gst_number;
      }
    }

    return await this.supplierRepo.save(supplier);
  }

  async changeStatus(id: string, isActive: boolean) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (typeof isActive === 'boolean') {
      supplier.is_active = isActive;
    }

    return await this.supplierRepo.save(supplier);
  }
}
