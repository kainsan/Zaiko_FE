import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'search-inventory-input',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
    templateUrl: './search-inventory-input.component.html',
    styleUrls: ['./search-inventory-input.component.scss'],
})
export class SearchInventoryInputComponent implements OnInit {
    @Output() search = new EventEmitter<any>();
    @Output() clear = new EventEmitter<void>();

    // Form fields based on the image
    expectedArrivalDateFrom = signal('');
    expectedArrivalDateTo = signal('');
    actualArrivalDateFrom = signal('');
    actualArrivalDateTo = signal('');
    slipNumberFrom = signal('');
    slipNumberTo = signal('');
    customerSlipNumberFrom = signal('');
    customerSlipNumberTo = signal('');

    deliveryCodeFrom = signal('');
    deliveryCodeTo = signal('');
    deliveryName = signal('');
    supplierCodeFrom = signal('');
    supplierCodeTo = signal('');
    supplierName = signal('');

    ownerCodeFrom = signal('');
    ownerCodeTo = signal('');
    ownerName = signal('');
    productCodeFrom = signal('');
    productCodeTo = signal('');
    productName = signal('');

    warehouseFrom = signal('');
    warehouseTo = signal('');

    arrivalType = signal('ALL'); // 全て, 予定あり, 実績のみ
    arrivalStatus = signal('ALL'); // 全て, 未入庫, 入庫残, 入庫済
    closeDivision = signal('ALL'); // 全て, 未クローズ, クローズ済

    constructor(private dialog: MatDialog) { }

    ngOnInit(): void { }

    onSearch(): void {
        const params = {
            expectedArrivalDateFrom: this.expectedArrivalDateFrom(),
            expectedArrivalDateTo: this.expectedArrivalDateTo(),
            actualArrivalDateFrom: this.actualArrivalDateFrom(),
            actualArrivalDateTo: this.actualArrivalDateTo(),
            slipNumberFrom: this.slipNumberFrom(),
            slipNumberTo: this.slipNumberTo(),
            customerSlipNumberFrom: this.customerSlipNumberFrom(),
            customerSlipNumberTo: this.customerSlipNumberTo(),
            deliveryCodeFrom: this.deliveryCodeFrom(),
            deliveryCodeTo: this.deliveryCodeTo(),
            deliveryName: this.deliveryName(),
            supplierCodeFrom: this.supplierCodeFrom(),
            supplierCodeTo: this.supplierCodeTo(),
            supplierName: this.supplierName(),
            ownerCodeFrom: this.ownerCodeFrom(),
            ownerCodeTo: this.ownerCodeTo(),
            ownerName: this.ownerName(),
            productCodeFrom: this.productCodeFrom(),
            productCodeTo: this.productCodeTo(),
            productName: this.productName(),
            warehouseFrom: this.warehouseFrom(),
            warehouseTo: this.warehouseTo(),
            arrivalType: this.arrivalType(),
            arrivalStatus: this.arrivalStatus(),
            closeDivision: this.closeDivision(),
        };
        this.search.emit(params);
    }

    onClear(): void {
        // Reset all signals
        this.clear.emit();
    }

    openSearchDialog(type: string): void {
        // Placeholder for dialog logic
        console.log('Opening search dialog for:', type);
    }
}
