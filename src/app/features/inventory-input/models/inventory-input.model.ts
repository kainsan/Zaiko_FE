export interface InventoryInputEntity {
    inventoryInputId: number;
    companyId: number;
    inputPlanDate: string;
    inputActualDate: string;
    createSlipType: string;
    slipNo: string;
    planSupplierSlipNo: string | null;
    actualSupplierSlipNo: string | null;
    planSlipNote: string | null;
    actualSlipNote: string | null;
    planSupplierDeliveryDestinationId: number;
    actualSupplierDeliveryDestinationId: number;
    planSupplierId: number;
    actualSupplierId: number;
    productOwnerId: number;
    planRepositoryId: number;
    actualRepositoryId: number;
    inputStatus: string;
    sumPlanQuantity: number;
    sumActualQuantity: number;
    isClosed: string;
    freeItem1: string | null;
    freeItem2: string | null;
    freeItem3: string | null;
    contactStatus: string;
}

export interface InventoryInputDTO {
    inventoryInputEntity: InventoryInputEntity;
    supplierCode: string;
    supplierName: string;
    repositoryCode: string;
    repositoryName: string;
    destinationCode: string;
    destinationName: string | null;
    customerCode: string;
    customerName: string;
}

export interface InventoryInputSearchParams {
    inputPlanDateFrom?: string;
    inputPlanDateTo?: string;
    inputActualDateFrom?: string;
    inputActualDateTo?: string;
    slipNoFrom?: string;
    slipNoTo?: string;
    customerSlipNumberFrom?: string;
    customerSlipNumberTo?: string;
    deliveryCodeFrom?: string;
    deliveryCodeTo?: string;
    deliveryName?: string;
    supplierCodeFrom?: string;
    supplierCodeTo?: string;
    supplierName?: string;
    customerCodeFrom?: string;
    customerCodeTo?: string;
    customerName?: string;
    productCodeFrom?: string;
    productCodeTo?: string;
    productName?: string;
    planRepositoryId?: string;
    actualRepositoryId?: string;
    receiptType?: string;
    receiptStatus?: string;
    isClosed?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}
export interface InventoryPlanInputDetailEntity {
    datetimeMng: string | null;
    planDetailId: number;
    inventoryInputId: number;
    companyId: number;
    productId: number;
    repositoryId: number;
    locationId: number | null;
    dateTimeMng: string | null;
    numberMng: string | null;
    csPlanQuantity: number | null;
    blPlanQuantity: number | null;
    psPlanQuantity: number | null;
    totalPlanQuantity: number;
    inventoryProductType: string;
    detailNote: string | null;
    // Add other fields as needed based on BE
}

export interface InventoryInputPlanDTO {
    inventoryInputEntity: InventoryInputEntity;
    destinationCode: string;
    departmentName: string;
    supplierCode: string;
    supplierName: string;
    customerCode: string;
    customerName: string;
    repositoryCode: string;
    repositoryName: string;

    detailEntity: InventoryPlanInputDetailEntity;
    productCode: string;
    productName: string;
    detailRepositoryCode: string;
    locationCode: string;
    packCsUnitName: string;
    packBlUnitName: string;
    pieceUnitName: string;
}
