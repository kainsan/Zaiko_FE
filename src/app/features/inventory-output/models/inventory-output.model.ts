export interface InventoryOutputListItem {
    inventoryOutputId: number;
    companyId: number;
    orderDate: string;
    slipNo: string;
    slipNote: string | null;
    batchStatus: string;
    sumPlanQuantity: number;
    sumActualQuantity: number;
    outputStatus: string;
    isClosed: string;
    checked: string;
    planOutputDate: string;
    planWorkingDate: string;
    planDeliverDate: string;
    planSupplierSlipNo: string | null;
    actualOutputDate: string | null;
    actualDeliverDate: string | null;
    actualSupplierSlipNo: string | null;
    planCustomerDeliveryDestinationId: number;
    planDestinationCode: string;
    planDestinationName: string | null;
    actualCustomerDeliveryDestinationId: number;
    actualDestinationCode: string;
    actualDestinationName: string | null;
    planCustomerId: number;
    planCustomerCode: string;
    planCustomerName: string;
    actualCustomerId: number;
    actualCustomerCode: string;
    actualCustomerName: string;
    planRepositoryId: number;
    planRepositoryCode: string;
    planRepositoryName: string;
    actualRepositoryId: number;
    actualRepositoryCode: string;
    actualRepositoryName: string;
    supplierCode: string;
    supplierName: string;
    ownerCode: string;
    ownerName: string;
    createSlipType: string;
    routeCode: string;
    courseCode: string;
    deliverDestinationName: string;
    phoneNumber: string | null;
    faxNumber: string | null;
    postCode: string | null;
    newDestinationName: string | null;
}

export interface InventoryOutputSearchParams {
    orderDateFrom?: string;
    orderDateTo?: string;
    planOutputDateFrom?: string;
    planOutputDateTo?: string;
    planOutputWorkingDateFrom?: string;
    planOutputWorkingDateTo?: string;
    planOutputDeliveryDateFrom?: string;
    planOutputDeliveryDateTo?: string;
    supplierSlipNoFrom?: string;
    supplierSlipNoTo?: string;
    slipNoFrom?: string;
    slipNoTo?: string;
    customerIdFrom?: string;
    customerIdTo?: string;
    customerName?: string;
    deliveryDestinationIdFrom?: string;
    deliveryDestinationIdTo?: string;
    deliveryDestinationName?: string;
    supplierIdFrom?: string;
    supplierIdTo?: string;
    supplierName?: string;
    ownerIdFrom?: string;
    ownerIdTo?: string;
    ownerName?: string;
    productIdFrom?: string;
    productIdTo?: string;
    productName?: string;
    planRepositoryIdFrom?: string;
    planRepositoryIdTo?: string;
    batchNumber?: number;
    deliveryType?: string;
    deliveryStatus?: string;
    isClosed?: string;
    actualOutputDateFrom?: string;
    actualOutputDateTo?: string;
    actualDeliveryDateFrom?: string;
    actualDeliveryDateTo?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}
export interface InventoryOutputPlanHeader {
    inventoryOutputId: number;
    companyId: number;
    outputPlanDate: string;
    outputActualDate: string;
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
    outputStatus: string;
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

export interface InventoryOutputPlanDetail {
    datetimeMng: string | null;
    planDetailId: number;
    inventoryOutputId: number;
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


export interface InventoryOutputPlanResponse {
    inventoryOutputPlanHeader: InventoryOutputPlanHeader;
    inventoryOutputPlanDetails: InventoryOutputPlanDetail[];
}

export interface InventoryOutputActualHeader {
    inventoryOutputId: number;
    companyId: number;
    outputPlanDate: string;
    outputActualDate: string;
    createSlipType: string;
    slipNo: string;
    actualSupplierSlipNo: string | null;
    actualSlipNote: string | null;
    actualSupplierDeliveryDestinationId: number;
    actualSupplierId: number;
    productOwnerId: number;
    actualRepositoryId: number;
    outputStatus: string;
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

export interface InventoryOutputActualDetail {
    datetimeMng: string | null;
    actualDetailId: number;
    inventoryOutputId: number;
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
    outputActualDate: string | null;
    delFlg: string;
}

export interface InventoryOutputActualResponse {
    inventoryOutputActualHeader: InventoryOutputActualHeader;
    inventoryOutputActualDetails: InventoryOutputActualDetail[];
}

export interface InventoryOutputCorrectionHeader {
    inventoryOutputId: number;
    companyId: number;
    outputPlanDate: string;
    outputActualDate: string;
    createSlipType: string;
    slipNo: string;
    actualSupplierSlipNo: string | null;
    actualSlipNote: string | null;
    actualSupplierDeliveryDestinationId: number;
    actualSupplierId: number;
    productOwnerId: number;
    actualRepositoryId: number;
    outputStatus: string;
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

export interface InventoryOutputCorrectionDetail {
    datetimeMng: string | null;
    actualDetailId: number;
    inventoryOutputId: number;
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
    outputActualDate: string | null;
    correctionReason: string | null;
    delFlg: string;
}

export interface InventoryOutputCorrectionResponse {
    inventoryOutputCorrectionHeader: InventoryOutputCorrectionHeader;
    inventoryOutputCorrectionDetails: InventoryOutputCorrectionDetail[];
}
