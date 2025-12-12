import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Product } from '../list-product-component/list-product.component';

@Component({
    selector: 'app-product-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-detail-modal.component.html',
    styleUrls: ['./product-detail-modal.component.scss']
})
export class ProductDetailModalComponent {
    activeTab: string = 'general'; // Default tab

    constructor(
        public dialogRef: MatDialogRef<ProductDetailModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product
    ) { }

    selectTab(tab: string): void {
        this.activeTab = tab;
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        // Implement save logic here
        this.dialogRef.close(this.data);
    }

    onDelete(): void {
        // Implement delete logic here
        this.dialogRef.close('delete');
    }
}
