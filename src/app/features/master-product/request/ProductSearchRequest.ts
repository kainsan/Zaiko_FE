export interface ProductSearchParams {
  productCodeFrom?: string;
  productCodeTo?: string;

  name1?: string;
  upcCd1?: string;
  upcCd2?: string;

  categoryCode1?: string;
  categoryCode2?: string;
  categoryCode3?: string;
  categoryCode4?: string;
  categoryCode5?: string;

  repositoryId?: number;
  locationId?: number;
  isSet?: string;

  page?: number;
  pageSize?: number;
}
