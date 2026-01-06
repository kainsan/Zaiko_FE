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
    expectedArrivalDateFrom?: string;
    expectedArrivalDateTo?: string;
    actualArrivalDateFrom?: string;
    actualArrivalDateTo?: string;
    slipNumberFrom?: string;
    slipNumberTo?: string;
    customerSlipNumberFrom?: string;
    customerSlipNumberTo?: string;
    deliveryCodeFrom?: string;
    deliveryCodeTo?: string;
    deliveryName?: string;
    supplierCodeFrom?: string;
    supplierCodeTo?: string;
    supplierName?: string;
    ownerCodeFrom?: string;
    ownerCodeTo?: string;
    ownerName?: string;
    productCodeFrom?: string;
    productCodeTo?: string;
    productName?: string;
    warehouseFrom?: string;
    warehouseTo?: string;
    arrivalType?: string;
    arrivalStatus?: string;
    closeDivision?: string;
    page?: number;
    pageSize?: number;
}
