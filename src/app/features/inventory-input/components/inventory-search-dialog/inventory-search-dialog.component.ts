import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-inventory-search-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, FormsModule],
    templateUrl: './inventory-search-dialog.component.html',
    styleUrls: ['./inventory-search-dialog.component.scss']
})
export class InventorySearchDialogComponent implements OnInit {
    items: any[] = [];
    filteredItems: any[] = [];
    searchQuery: string = '';
    searchType: 'product' | 'supplier' | 'delivery' | 'customer' = 'product';
    title: string = '';
    placeholder: string = '';

    constructor(
        public dialogRef: MatDialogRef<InventorySearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        if (this.data) {
            this.searchType = this.data.searchType || 'product';
            this.items = this.data.items || [];
            this.filteredItems = [...this.items];

            switch (this.searchType) {
                case 'product':
                    this.title = '商品検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'supplier':
                    this.title = '供給元検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'delivery':
                    this.title = '納品先検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
                case 'customer':
                    this.title = '得意先検索';
                    this.placeholder = 'コード、名称で検索';
                    break;
            }
        }
    }

    search(): void {
        if (!this.searchQuery) {
            this.filteredItems = this.items;
            return;
        }
        const query = this.searchQuery.toLowerCase();

        switch (this.searchType) {
            case 'product':
                this.filteredItems = this.items.filter((item: any) =>
                    item.productCode?.toLowerCase().includes(query) ||
                    item.name1?.toLowerCase().includes(query)
                );
                break;
            case 'supplier':
                this.filteredItems = this.items.filter((item: any) =>
                    item.supplierCode?.toLowerCase().includes(query) ||
                    item.supplierName?.toLowerCase().includes(query)
                );
                break;
            case 'delivery':
                this.filteredItems = this.items.filter((item: any) =>
                    item.destinationCode?.toLowerCase().includes(query) ||
                    item.destinationName?.toLowerCase().includes(query)
                );
                break;
            case 'customer':
                this.filteredItems = this.items.filter((item: any) =>
                    item.customerCode?.toLowerCase().includes(query) ||
                    item.customerName?.toLowerCase().includes(query)
                );
                break;
        }
    }

    selectItem(item: any): void {
        this.dialogRef.close(item);
    }

    close(): void {
        this.dialogRef.close();
    }
}
