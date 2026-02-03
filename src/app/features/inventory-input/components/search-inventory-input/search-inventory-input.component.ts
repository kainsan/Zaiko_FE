import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventorySearchDialogComponent } from '../inventory-search-dialog/inventory-search-dialog.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputDTO, InventoryInputSearchParams } from '../../models/inventory-input.model';
import { PageResponse } from '../../../master-product/response/PageResponse';
import { Product, Repository } from '../../../master-product/model/product.model';

@Component({
    selector: 'search-inventory-input',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
    templateUrl: './search-inventory-input.component.html',
    styleUrls: ['./search-inventory-input.component.scss'],
})
export class SearchInventoryInputComponent implements OnInit {
    @Output() searchInventoryInputs = new EventEmitter<PageResponse<InventoryInputDTO>>();
    @Output() onSearchParams = new EventEmitter<InventoryInputSearchParams>();
    @Output() clear = new EventEmitter<void>();

    repositories = signal<Repository[]>([]);
    repositoryId: number = 0;

    // Form fields based on the image
    inputPlanDateFrom = signal('');
    inputPlanDateTo = signal('');
    inputActualDateFrom = signal('');
    inputActualDateTo = signal('');
    slipNoFrom = signal('');
    slipNoTo = signal('');
    customerSlipNumberFrom = signal('');
    customerSlipNumberTo = signal('');

    deliveryCodeFrom = signal('');
    deliveryCodeTo = signal('');
    deliveryName = signal('');
    supplierCodeFrom = signal('');
    supplierCodeTo = signal('');
    supplierName = signal('');

    customerCodeFrom = signal('');
    customerCodeTo = signal('');
    customerName = signal('');

    productCodeFrom = signal('');
    productCodeTo = signal('');
    productName = signal('');

    planRepositoryId = signal('');
    actualRepositoryId = signal('');

    receiptType = signal('ALL'); // 全て, 予定あり, 実績のみ
    receiptStatus = signal('ALL'); // 全て, 未入庫, 入庫残, 入庫済
    isClosed = signal('ALL'); // 全て, 未クローズ, クローズ済

    constructor(
        private dialog: MatDialog,
        private inventoryInputService: InventoryInputService
    ) { }

    ngOnInit(): void {
        this.loadRepositories();
    }

    loadRepositories(): void {
        this.inventoryInputService.getRepositories().subscribe(repos => {
            this.repositories.set(repos);
        });
    }

    onSearch(): void {
        const params: InventoryInputSearchParams = {
            inputPlanDateFrom: this.inputPlanDateFrom(),
            inputPlanDateTo: this.inputPlanDateTo(),
            inputActualDateFrom: this.inputActualDateFrom(),
            inputActualDateTo: this.inputActualDateTo(),
            slipNoFrom: this.slipNoFrom(),
            slipNoTo: this.slipNoTo(),
            customerSlipNumberFrom: this.customerSlipNumberFrom(),
            customerSlipNumberTo: this.customerSlipNumberTo(),
            deliveryCodeFrom: this.deliveryCodeFrom(),
            deliveryCodeTo: this.deliveryCodeTo(),
            deliveryName: this.deliveryName(),
            supplierCodeFrom: this.supplierCodeFrom(),
            supplierCodeTo: this.supplierCodeTo(),
            supplierName: this.supplierName(),
            customerCodeFrom: this.customerCodeFrom(),
            customerCodeTo: this.customerCodeTo(),
            customerName: this.customerName(),
            productCodeFrom: this.productCodeFrom(),
            productCodeTo: this.productCodeTo(),
            productName: this.productName(),
            planRepositoryId: this.planRepositoryId(),
            actualRepositoryId: this.actualRepositoryId(),
            receiptStatus: this.receiptStatus(),
            receiptType: this.receiptType(),
            isClosed: this.isClosed(),
        };
        this.onSearchParams.emit(params);
        this.inventoryInputService.searchInventoryInputs(params).subscribe(response => {
            this.searchInventoryInputs.emit(response);
        });
    }

    onClear(): void {
        this.inputPlanDateFrom.set('');
        this.inputPlanDateTo.set('');
        this.inputActualDateFrom.set('');
        this.inputActualDateTo.set('');
        this.slipNoFrom.set('');
        this.slipNoTo.set('');
        this.customerSlipNumberFrom.set('');
        this.customerSlipNumberTo.set('');
        this.deliveryCodeFrom.set('');
        this.deliveryCodeTo.set('');
        this.deliveryName.set('');
        this.supplierCodeFrom.set('');
        this.supplierCodeTo.set('');
        this.supplierName.set('');
        this.customerCodeFrom.set('');
        this.customerCodeTo.set('');
        this.customerName.set('');
        this.productCodeFrom.set('');
        this.productCodeTo.set('');
        this.productName.set('');
        this.planRepositoryId.set('');
        this.actualRepositoryId.set('');
        this.receiptType.set('ALL');
        this.receiptStatus.set('ALL');
        this.isClosed.set('ALL');

        this.clear.emit();
    }

    openSearchDialog(type: string): void {
        let searchObservable;
        let searchType: 'product' | 'supplier' | 'delivery' | 'customer' = 'product';

        switch (type) {
            case 'deliveryFrom':
            case 'deliveryTo':
                searchType = 'delivery';
                searchObservable = this.inventoryInputService.getDeliveryDestinations();
                break;
            case 'supplierFrom':
            case 'supplierTo':
                searchType = 'supplier';
                searchObservable = this.inventoryInputService.getSuppliers();
                break;
            case 'customerFrom':
            case 'customerTo':
                searchType = 'customer';
                searchObservable = this.inventoryInputService.getCustomers();
                break;
            case 'productFrom':
            case 'productTo':
                searchType = 'product';
                searchObservable = this.inventoryInputService.getProducts();
                break;
            default:
                return;
        }

        searchObservable.subscribe((response: any) => {
            let items = response.content || (Array.isArray(response) ? response : []);

            // Map MasterProductDTO to Product if searchType is product
            if (searchType === 'product' && items.length > 0 && items[0].productEntity) {
                items = items.map((item: any) => item.productEntity);
            }

            const dialogRef = this.dialog.open(InventorySearchDialogComponent, {
                width: '450px',
                height: '600px',
                panelClass: 'custom-dialog-container',
                data: {
                    searchType: searchType,
                    items: items
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.updateSignal(type, result);
                }
            });
        });
    }

    private updateSignal(type: string, result: any): void {
        if (!result) return;

        switch (type) {
            case 'deliveryFrom':
                this.deliveryCodeFrom.set(result.destinationCode || '');
                break;
            case 'deliveryTo':
                this.deliveryCodeTo.set(result.destinationCode || '');
                break;
            case 'supplierFrom':
                this.supplierCodeFrom.set(result.supplierCode || '');
                break;
            case 'supplierTo':
                this.supplierCodeTo.set(result.supplierCode || '');
                break;
            case 'customerFrom':
                this.customerCodeFrom.set(result.customerCode || '');
                break;
            case 'customerTo':
                this.customerCodeTo.set(result.customerCode || '');
                break;
            case 'productFrom':
                this.productCodeFrom.set(result.productCode || '');
                break;
            case 'productTo':
                this.productCodeTo.set(result.productCode || '');
                break;
        }
    }

    getRangeErrorMessage(from: any, to: any, label: string, type: 'from' | 'to'): string {
        if (!from || !to) return '';

        let fromVal = from;
        let toVal = to;

        // Convert Date objects to timestamps for comparison
        if (fromVal instanceof Date) fromVal = fromVal.getTime();
        if (toVal instanceof Date) toVal = toVal.getTime();

        if (fromVal > toVal) {
            if (type === 'from') {
                const toDisplay = to instanceof Date ? to.toLocaleDateString('ja-JP') : to;
                return `${label}は${toDisplay}以下の値を指定してください。`;
            } else {
                const fromDisplay = from instanceof Date ? from.toLocaleDateString('ja-JP') : from;
                return `${label}は${fromDisplay}以上の値を指定してください。`;
            }
        }
        return '';
    }
}
