export interface CustomersItem {
  id: string;
  name?: string;
  code?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
