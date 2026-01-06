import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SearchInventoryInputComponent } from '../../components/search-inventory-input/search-inventory-input.component';
import { ListInventoryInputComponent } from '../../components/list-inventory-input/list-inventory-input.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputDTO, InventoryInputSearchParams } from '../../models/inventory-input.model';

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
    totalItems = signal(0);
    currentPage = signal(0);
    pageSize = signal(50);
    currentSearchParams = signal<InventoryInputSearchParams>({});

    constructor(private inventoryInputService: InventoryInputService) { }

    ngOnInit(): void {
        this.loadInventoryInputs();
    }

    loadInventoryInputs(): void {
        this.inventoryInputService.getInventoryInputs(this.currentPage(), this.pageSize()).subscribe(response => {
            this.inventoryInputs.set(response.content || []);
            this.totalItems.set(response.page?.totalElements ?? (response as any).totalElements ?? 0);
        });
    }

    toggleSearch(): void {
        this.isSearchVisible.set(!this.isSearchVisible());
    }

    handleSearch(params: InventoryInputSearchParams): void {
        this.currentSearchParams.set(params);
        this.currentPage.set(0);
        this.inventoryInputService.searchInventoryInputs({ ...params, page: 0, pageSize: this.pageSize() }).subscribe(response => {
            this.inventoryInputs.set(response.content || []);
            this.totalItems.set(response.page?.totalElements ?? (response as any).totalElements ?? 0);
        });
    }

    handleLoadMore(): void {
        const nextPage = this.currentPage() + 1;
        this.currentPage.set(nextPage);
        const params = { ...this.currentSearchParams(), page: nextPage, pageSize: this.pageSize() };

        this.inventoryInputService.searchInventoryInputs(params).subscribe(response => {
            this.inventoryInputs.update(items => [...items, ...(response.content || [])]);
        });
    }

    handleClear(): void {
        this.currentSearchParams.set({});
        this.currentPage.set(0);
        this.loadInventoryInputs();
    }
}
