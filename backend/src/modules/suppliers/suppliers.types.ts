export interface SuppliersItem {
  id: string;
  name?: string;
  code?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
