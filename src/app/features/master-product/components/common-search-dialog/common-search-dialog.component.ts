import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../model/product.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-common-search-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, FormsModule],
    templateUrl: './common-search-dialog.component.html',
    styleUrls: ['./common-search-dialog.component.scss']
})
export class CommonSearchDialogComponent implements OnInit {
    products: Product[] = [];
    filteredProducts: Product[] = [];
    searchQuery: string = '';

    constructor(
        public dialogRef: MatDialogRef<CommonSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        if (this.data && this.data.products) {
            this.products = this.data.products;
            this.filteredProducts = [...this.products];
        }
    }

    search(): void {
        if (!this.searchQuery) {
            this.filteredProducts = this.products;
            return;
        }
        const query = this.searchQuery.toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.productCode?.toLowerCase().includes(query) ||
            p.name1?.toLowerCase().includes(query)
        );
    }

    selectProduct(product: Product): void {
        this.dialogRef.close(product);
    }

    close(): void {
        this.dialogRef.close();
    }
}
