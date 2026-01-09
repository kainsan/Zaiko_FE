import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SearchInventoryInputComponent } from '../../components/search-inventory-input/search-inventory-input.component';
import { ListInventoryInputComponent } from '../../components/list-inventory-input/list-inventory-input.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputDTO, InventoryInputSearchParams } from '../../models/inventory-input.model';
import { PageResponse } from '../../../master-product/response/PageResponse';

@Component({
    selector: 'app-inventory-input-list',
    imports: [RouterModule, CommonModule, SearchInventoryInputComponent, ListInventoryInputComponent],
    standalone: true,
    templateUrl: './inventory-input-list.html',
    styleUrls: ['./inventory-input-list.scss'],
})
export class InventoryInputList implements OnInit {
    currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '/');

    isSearchVisible = signal<boolean>(true);
    inventoryInputs = signal<InventoryInputDTO[]>([]);
    totalPages = signal(0);
    currentPage = signal(0);
    pageSize = 50;
    currentSearchParams = signal<InventoryInputSearchParams>({});

    constructor(private inventoryInputService: InventoryInputService) { }

    ngOnInit(): void {
       this.loadInventoryInputs();
        this.refreshInventInput();
    }

    loadInventoryInputs(): void {
        this.inventoryInputService.getInventoryInputs(this.currentPage(), this.pageSize).subscribe(response => {
            this.inventoryInputs.set(response.content || []);
            this.totalPages.set(response.page?.totalPages ?? 0);
        });
    }

    handleSearchResults(response: PageResponse<InventoryInputDTO>): void {
        this.inventoryInputs.set(response.content || []);
        this.totalPages.set(response.page?.totalPages ?? 0);
        this.currentPage.set(0);
    }

    handleSearchParams(params: InventoryInputSearchParams): void {
        this.currentSearchParams.set(params);
    }

    toggleSearch(): void {
        this.isSearchVisible.set(!this.isSearchVisible());
    }

    refreshInventInput(): void {
        const params = {
            ...this.currentSearchParams(),
            page: 0,
            pageSize: (this.currentPage() + 1) * this.pageSize
        };

        this.inventoryInputService.searchInventoryInputs(params).subscribe(response => {
            this.inventoryInputs.set(response.content || []);
        });
    }



    handleLoadMore(): void {
        const nextPage = this.currentPage() + 1;
        this.currentPage.set(nextPage);
        const params = { ...this.currentSearchParams(), page: nextPage, pageSize: this.pageSize };

        this.inventoryInputService.searchInventoryInputs(params).subscribe(response => {
            this.inventoryInputs.update(items => [...items, ...(response.content || [])]);
            this.totalPages.set(response.page?.totalPages ?? 0);
        });
    }

    handleClear(): void {
        this.currentSearchParams.set({});
        this.currentPage.set(0);
        this.loadInventoryInputs();
    }
}
