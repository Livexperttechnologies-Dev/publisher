import { CustomersItem, CustomersQueryFilters } from './customers.types';

export class CustomersService {
  async getAll(filters?: CustomersQueryFilters): Promise<{ items: CustomersItem[]; total: number }> {
    return {
      items: [
        {
          id: 'customers_sample_01',
          name: 'Bookstores, Schools & Institutional Buyers (Master Record)',
          code: 'CUSTOMERS-001',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  }

  async getById(id: string): Promise<CustomersItem | null> {
    return {
      id,
      name: 'Bookstores, Schools & Institutional Buyers #' + id,
      code: 'CUSTOMERS-' + id,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async create(data: any): Promise<CustomersItem> {
    return {
      id: 'customers_' + Date.now(),
      ...data,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const customersService = new CustomersService();
