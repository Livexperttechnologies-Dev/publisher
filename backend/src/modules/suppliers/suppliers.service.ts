import { SuppliersItem, SuppliersQueryFilters } from './suppliers.types';

export class SuppliersService {
  async getAll(filters?: SuppliersQueryFilters): Promise<{ items: SuppliersItem[]; total: number }> {
    return {
      items: [
        {
          id: 'suppliers_sample_01',
          name: 'Paper Mills, Binders & Printing Presses (Master Record)',
          code: 'SUPPLIERS-001',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  }

  async getById(id: string): Promise<SuppliersItem | null> {
    return {
      id,
      name: 'Paper Mills, Binders & Printing Presses #' + id,
      code: 'SUPPLIERS-' + id,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async create(data: any): Promise<SuppliersItem> {
    return {
      id: 'suppliers_' + Date.now(),
      ...data,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const suppliersService = new SuppliersService();
