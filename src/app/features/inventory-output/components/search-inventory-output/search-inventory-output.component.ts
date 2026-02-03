import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryOutputSearchDialogComponent } from '../inventory-output-search-dialog/inventory-output-search-dialog.component';
import { InventoryOutputService } from '../../services/inventory-output.service';
import { InventoryOutputListItem, InventoryOutputSearchParams } from '../../models/inventory-output.model';
import { PageResponse } from '../../../master-product/response/PageResponse';
import { Product, Repository } from '../../../master-product/model/product.model';

@Component({
    selector: 'search-inventory-output',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
    templateUrl: './search-inventory-output.component.html',
    styleUrls: ['./search-inventory-output.component.scss'],
})
export class SearchInventoryOutputComponent implements OnInit {
    @Output() searchInventoryOutputs = new EventEmitter<PageResponse<InventoryOutputListItem>>();
    @Output() onSearchParams = new EventEmitter<InventoryOutputSearchParams>();
    @Output() clear = new EventEmitter<void>();

    repositories = signal<Repository[]>([]);
    repositoryId: number = 0;

    orderDateFrom = signal('');
    orderDateTo = signal('');
    planOutputDateFrom = signal('');
    planOutputDateTo = signal('');
    planOutputWorkingDateFrom = signal('');
    planOutputWorkingDateTo = signal('');
    planOutputDeliveryDateFrom = signal('');
    planOutputDeliveryDateTo = signal('');

    supplierSlipNoFrom = signal('');
    supplierSlipNoTo = signal('');

    slipNoFrom = signal('');
    slipNoTo = signal('');

    customerIdFrom = signal('');
    customerIdTo = signal('');
    customerName = signal('');

    deliveryDestinationIdFrom = signal('');
    deliveryDestinationIdTo = signal('');
    deliveryDestinationName = signal('');

    supplierIdFrom = signal('');
    supplierIdTo = signal('');
    supplierName = signal('');

    ownerIdFrom = signal('');
    ownerIdTo = signal('');
    ownerName = signal('');

    productIdFrom = signal('');
    productIdTo = signal('');
    productName = signal('');

    planRepositoryIdFrom = signal('');
    planRepositoryIdTo = signal('');

    batchNumber = signal<number>(0);
    deliveryType = signal('ALL');
    deliveryStatus = signal('ALL');
    isClosed = signal('ALL');

    actualOutputDateFrom = signal('');
    actualOutputDateTo = signal('');
    actualDeliveryDateFrom = signal('');
    actualDeliveryDateTo = signal('');

    constructor(
        private dialog: MatDialog,
        private inventoryOutputService: InventoryOutputService
    ) { }

    ngOnInit(): void {
        this.loadRepositories();
    }

    loadRepositories(): void {
        this.inventoryOutputService.getRepositories().subscribe(repos => {
            this.repositories.set(repos);
        });
    }

    onSearch(): void {
        const params: InventoryOutputSearchParams = {
            orderDateFrom: this.orderDateFrom(),
            orderDateTo: this.orderDateTo(),
            planOutputDateFrom: this.planOutputDateFrom(),
            planOutputDateTo: this.planOutputDateTo(),
            planOutputWorkingDateFrom: this.planOutputWorkingDateFrom(),
            planOutputWorkingDateTo: this.planOutputWorkingDateTo(),
            planOutputDeliveryDateFrom: this.planOutputDeliveryDateFrom(),
            planOutputDeliveryDateTo: this.planOutputDeliveryDateTo(),
            supplierSlipNoFrom: this.supplierSlipNoFrom(),
            supplierSlipNoTo: this.supplierSlipNoTo(),
            slipNoFrom: this.slipNoFrom(),
            slipNoTo: this.slipNoTo(),
            customerIdFrom: this.customerIdFrom(),
            customerIdTo: this.customerIdTo(),
            customerName: this.customerName(),
            deliveryDestinationIdFrom: this.deliveryDestinationIdFrom(),
            deliveryDestinationIdTo: this.deliveryDestinationIdTo(),
            deliveryDestinationName: this.deliveryDestinationName(),
            supplierIdFrom: this.supplierIdFrom(),
            supplierIdTo: this.supplierIdTo(),
            supplierName: this.supplierName(),
            ownerIdFrom: this.ownerIdFrom(),
            ownerIdTo: this.ownerIdTo(),
            ownerName: this.ownerName(),
            productIdFrom: this.productIdFrom(),
            productIdTo: this.productIdTo(),
            productName: this.productName(),
            planRepositoryIdFrom: this.planRepositoryIdFrom(),
            planRepositoryIdTo: this.planRepositoryIdTo(),
            batchNumber: this.batchNumber(),
            deliveryStatus: this.deliveryStatus(),
            deliveryType: this.deliveryType(),
            isClosed: this.isClosed(),
            actualOutputDateFrom: this.actualOutputDateFrom(),
            actualOutputDateTo: this.actualOutputDateTo(),
            actualDeliveryDateFrom: this.actualDeliveryDateFrom(),
            actualDeliveryDateTo: this.actualDeliveryDateTo(),
        };
        console.log('Search Params:', JSON.stringify(params, null, 2)); 
        this.onSearchParams.emit(params);
        this.inventoryOutputService.searchInventoryOutputs(params).subscribe(response => {
            this.searchInventoryOutputs.emit(response);
        });
    }

    onClear(): void {
        this.orderDateFrom.set('');
        this.orderDateTo.set('');
        this.planOutputDateFrom.set('');
        this.planOutputDateTo.set('');
        this.planOutputWorkingDateFrom.set('');
        this.planOutputWorkingDateTo.set('');
        this.planOutputDeliveryDateFrom.set('');
        this.planOutputDeliveryDateTo.set('');
        this.supplierSlipNoFrom.set('');
        this.supplierSlipNoTo.set('');
        this.slipNoFrom.set('');
        this.slipNoTo.set('');
        this.customerIdFrom.set('');
        this.customerIdTo.set('');
        this.customerName.set('');
        this.deliveryDestinationIdFrom.set('');
        this.deliveryDestinationIdTo.set('');
        this.deliveryDestinationName.set('');
        this.supplierIdFrom.set('');
        this.supplierIdTo.set('');
        this.supplierName.set('');
        this.ownerIdFrom.set('');
        this.ownerIdTo.set('');
        this.ownerName.set('');
        this.productIdFrom.set('');
        this.productIdTo.set('');
        this.productName.set('');
        this.planRepositoryIdFrom.set('');
        this.planRepositoryIdTo.set('');
        this.batchNumber.set(0);
        this.deliveryType.set('ALL');
        this.deliveryStatus.set('ALL');
        this.isClosed.set('ALL');
        this.actualOutputDateFrom.set('');
        this.actualOutputDateTo.set('');
        this.actualDeliveryDateFrom.set('');
        this.actualDeliveryDateTo.set('');

        this.clear.emit();
    }

    openSearchDialog(type: string): void {
        let searchObservable;
        let searchType: 'product' | 'supplier' | 'delivery' | 'customer' | 'owner' = 'product';

        switch (type) {
            case 'deliveryFrom':
            case 'deliveryTo':
                searchType = 'delivery';
                searchObservable = this.inventoryOutputService.getDeliveryDestinations();
                break;
            case 'supplierFrom':
            case 'supplierTo':
                searchType = 'supplier';
                searchObservable = this.inventoryOutputService.getSuppliers();
                break;
            case 'ownerFrom':
            case 'ownerTo':
                searchType = 'owner';
                searchObservable = this.inventoryOutputService.getCustomers();
                break;
            case 'productFrom':
            case 'productTo':
                searchType = 'product';
                searchObservable = this.inventoryOutputService.getProducts();
                break;
            case 'customerFrom':
            case 'customerTo':
                searchType = 'customer';
                searchObservable = this.inventoryOutputService.getSuppliers();
                break;
            default:
                return;
        }

        searchObservable.subscribe((response: any) => {
            let items = response.content || (Array.isArray(response) ? response : []);

            if (searchType === 'product' && items.length > 0 && items[0].productEntity) {
                items = items.map((item: any) => item.productEntity);
            }

            const dialogRef = this.dialog.open(InventoryOutputSearchDialogComponent, {
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
        console.log(result)
        switch (type) {
            case 'deliveryFrom':
                this.deliveryDestinationIdFrom.set(result.destinationCode || '');
                break;
            case 'deliveryTo':
                this.deliveryDestinationIdTo.set(result.destinationCode || '');
                break;
            case 'supplierFrom':
                this.supplierIdFrom.set(result.supplierCode || '');
                break;
            case 'supplierTo':
                this.supplierIdTo.set(result.supplierCode || '');
                break;
            case 'customerFrom':
                this.customerIdFrom.set(result.supplierCode || '');
                break;
            case 'customerTo':
                this.customerIdTo.set(result.supplierCode || '');
                break;
            case 'productFrom':
                this.productIdFrom.set(result.productCode || '');
                break;
            case 'productTo':
                this.productIdTo.set(result.productCode || '');
                break;
            case 'ownerFrom':
                this.ownerIdFrom.set(result.customerCode || '');
                break;
            case 'ownerTo':
                this.ownerIdTo.set(result.customerCode || '');
                break;
        }
    }

    getRangeErrorMessage(from: any, to: any, label: string, type: 'from' | 'to'): string {
        if (!from || !to) return '';

        let fromVal = from;
        let toVal = to;

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
