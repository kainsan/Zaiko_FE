export interface Product {
  productId?: number;
  productCode?: string;
  name1?: string;
  isSet?: string;
  upcCd1?: string | null;
  upcCd2?: string | null;
  name2?: string | null;
  name3?: string | null;
  name4?: string | null;
  name5?: string | null;
  standardInfo?: string | null;
  categoryCode1?: string | null;
  categoryCode2?: string | null;
  categoryCode3?: string | null;
  categoryCode4?: string | null;
  categoryCode5?: string | null;
  notes?: string | null;
  fifoType?: string | null;
  isDateTimeMng?: string | null;
  dateTimeMngType?: string;
  isNumberMng?: string | null;
  cartonWeight?: number;
  cartonWeightName?: string;
  cartonVolume?: number;
  cartonVolumeName?: string;
  cartonVertical?: number;
  cartonHorizontal?: number;
  cartonHigh?: number;
  pieceWeight?: number;
  pieceWeightName?: string | null;
  pieceVolume?: number;
  pieceVolumeName?: string | null;
  pieceVertical?: number;
  pieceHorizontal?: number;
  pieceHigh?: number;
  isPackCsInput?: string | null;
  isPackCsOutput?: string | null;
  packCsUnitCode?: string;
  packCsAmount?: number;
  isPackBlInput?: string | null;
  isPackBlOutput?: string | null;
  packBlUnitCode?: string;
  packBlAmount?: number;
  isPieceInput?: string | null;
  isPieceOutput?: string | null;
  pieceUnitCode?: string;
  repositoryId?: number | null;
  locationId?: number | null;
  isReplenishMng?: string;
  minInventoryQuantity?: number | null;
  minInputQuantity?: number | null;
  isVarious?: string;
  supplierId?: number | null;
  leadTime?: number;
  tax?: string;
  companyId?: number;
  freeItem1?: string | null;
  freeItem2?: string | null;
  freeItem3?: string | null;
  freeItem4?: string | null;
  freeItem5?: string | null;
}

export interface Supplier {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  notes: string;
}

export interface Repository {
  repositoryId: number;
  repositoryCode: string;
  repositoryName: string;
}

export interface Location {
  locationId: number;
  repositoryId: number;
  locationCode: string;
  locationName: string;
}

export interface CategoryEntity {
  companyId: number;
  categoryCode: string;
  categoryName: string;
  sortIdx: number | null;
}

export interface packCsUnitName {
  companyId: number;
  unitCode: string;
  unitName: string;
  notes: string;
}

export interface packBlUnitName {
  companyId: number;
  unitCode: string;
  unitName: string;
  notes: string;
}
export interface pieceUnitName {
  companyId: number;
  unitCode: string;
  unitName: string;
  notes: string;
}

export interface UnitName {
  companyId: number;
  unitCode: string;
  unitName: string;
  notes: string;
}

export interface MasterProductDTO {
  productEntity: Product;
  category1Entity: CategoryEntity | null;
  category2Entity: CategoryEntity | null;
  category3Entity: CategoryEntity | null;
  category4Entity: CategoryEntity | null;
  category5Entity: CategoryEntity | null;
  repositoryEntity: Repository | null;
  locationEntity: Location | null;
  packCsUnitName: packCsUnitName | null;
  packBlUnitName: packBlUnitName | null;
  pieceUnitName: pieceUnitName | null;
  supplierEntity: Supplier | null;
}
