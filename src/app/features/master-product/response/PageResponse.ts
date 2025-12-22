import { MasterProductDTO } from '../model/product.model';

export interface PageResponse<T = MasterProductDTO> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number; // current page
  };
}
