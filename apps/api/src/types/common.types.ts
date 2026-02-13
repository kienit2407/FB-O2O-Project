export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'driver' | 'merchant_staff' | 'admin';
  avatar?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
