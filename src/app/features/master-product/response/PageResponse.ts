import { Product } from "../services/product.service";

export interface PageResponse<T> {
  content: Product[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number; // current page
  };
}
