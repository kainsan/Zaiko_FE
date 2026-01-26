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
export interface InventoryInputPlanHeader {
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
    destinationCode: string;
    departmentName: string | null;
    supplierCode: string;
    supplierName: string;
    customerCode: string;
    customerName: string;
    repositoryCode: string;
    repositoryName: string;
}

export interface InventoryInputPlanDetail {
    datetimeMng: string | null;
    planDetailId: number;
    inventoryInputId: number;
    companyId: number;
    productId: number;
    repositoryId: number;
    locationId: number | null;
    numberMng: string | null;
    csPlanQuantity: number | null;
    blPlanQuantity: number | null;
    psPlanQuantity: number | null;
    totalPlanQuantity: number;
    inventoryProductType: string;
    detailNote: string | null;
    freeItem1: string | null;
    freeItem2: string | null;
    freeItem3: string | null;
    productCode: string;
    productName: string;
    detailRepositoryCode: string;
    detailRepositoryName: string;
    locationCode: string | null;
    packCsUnitName: string;
    packBlUnitName: string;
    pieceUnitName: string;
    datetimeMngType: string | null;
    isDatetimeMng: string;
    isNumberMng: string;
    isPackCsInput: string;
    isPackBlInput: string;
    isPieceInput: string;
    totalQuantityInput: number;
    standardInfo: string | null;
    totalActualQuantity: number | null;
    packCsAmount?: number;
    packBlAmount?: number;
    delFlg: string;
}


export interface InventoryInputPlanResponse {
    inventoryInputPlanHeader: InventoryInputPlanHeader;
    inventoryInputPlanDetails: InventoryInputPlanDetail[];
}

export interface InventoryInputActualHeader {
    inventoryInputId: number;
    companyId: number;
    inputPlanDate: string;
    inputActualDate: string;
    createSlipType: string;
    slipNo: string;
    actualSupplierSlipNo: string | null;
    actualSlipNote: string | null;
    actualSupplierDeliveryDestinationId: number;
    actualSupplierId: number;
    productOwnerId: number;
    actualRepositoryId: number;
    inputStatus: string;
    sumPlanQuantity: number;
    sumActualQuantity: number;
    isClosed: string;
    freeItem1: string | null;
    freeItem2: string | null;
    freeItem3: string | null;
    contactStatus: string;
    destinationCode: string;
    departmentName: string | null;
    supplierCode: string;
    supplierName: string;
    customerCode: string;
    customerName: string;
    repositoryCode: string;
    repositoryName: string;
}

export interface InventoryInputActualDetail {
    datetimeMng: string | null;
    actualDetailId: number;
    inventoryInputId: number;
    companyId: number;
    productId: number;
    repositoryId: number;
    locationId: number | null;
    numberMng: string | null;
    csActualQuantity: number | null;
    blActualQuantity: number | null;
    psActualQuantity: number | null;
    totalActualQuantity: number;
    inventoryProductType: string;
    detailNote: string | null;
    productCode: string;
    productName: string;
    detailRepositoryCode: string;
    detailRepositoryName: string;
    locationCode: string | null;
    packCsUnitName: string;
    packBlUnitName: string;
    pieceUnitName: string;
    datetimeMngType: string | null;
    isDatetimeMng: string;
    isNumberMng: string;
    isPackCsInput: string;
    isPackBlInput: string;
    isPieceInput: string;
    totalQuantityInput: number;
    standardInfo: string | null;
    packCsAmount?: number;
    packBlAmount?: number;
    inputActualDate: string | null;
    delFlg: string;
}

export interface InventoryInputActualResponse {
    inventoryInputActualHeader: InventoryInputActualHeader;
    inventoryInputActualDetails: InventoryInputActualDetail[];
}

export interface InventoryInputCorrectionHeader extends InventoryInputActualHeader { }
export interface InventoryInputCorrectionDetail extends InventoryInputActualDetail { }

export interface InventoryInputCorrectionResponse {
    inventoryInputCorrectionHeader: InventoryInputCorrectionHeader;
    inventoryInputCorrectionDetails: InventoryInputCorrectionDetail[];
}
