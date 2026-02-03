import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, Params } from '@angular/router';

import { SearchInventoryOutputComponent } from '../../components/search-inventory-output/search-inventory-output.component';
import { ListInventoryOutputComponent } from '../../components/list-inventory-output/list-inventory-output.component';
import { InventoryOutputService } from '../../services/inventory-output.service';
import { InventoryOutputListItem, InventoryOutputSearchParams } from '../../models/inventory-output.model';
import { PageResponse } from '../../../master-product/response/PageResponse';

@Component({
    selector: 'app-inventory-output-list',
    imports: [RouterModule, CommonModule, SearchInventoryOutputComponent, ListInventoryOutputComponent],
    standalone: true,
    templateUrl: './inventory-output-list.html',
    styleUrls: ['./inventory-output-list.scss'],
})
export class InventoryOutputList implements OnInit {
    currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '/');

    isSearchVisible = signal<boolean>(true);
    inventoryOutputs = signal<InventoryOutputListItem[]>([]);
    totalPages = signal(0);
    currentPage = signal(0);
    pageSize = 50;
    currentSearchParams = signal<InventoryOutputSearchParams>({});

    viewMode = signal<'list' | 'plan' | 'actual' | 'correction'>('list');
    selectedId = signal<number | null>(null);

    constructor(
        private inventoryOutputService: InventoryOutputService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.refreshInventOutput();

        this.route.queryParams.subscribe((params: Params) => {
            if (params['mode'] === 'create') {
                this.viewMode.set('plan');
                this.selectedId.set(null);
            } else if (params['mode'] === 'create-actual') {
                this.viewMode.set('actual');
                this.selectedId.set(null);
            }
        });
    }

    handleOpenPlan(item: InventoryOutputListItem): void {
        this.selectedId.set(item.inventoryOutputId);
        this.viewMode.set('plan');
    }

    handleOpenActual(item: InventoryOutputListItem): void {
        this.selectedId.set(item.inventoryOutputId);
        this.viewMode.set('actual');
    }

    handleOpenCorrection(item: InventoryOutputListItem): void {
        this.selectedId.set(item.inventoryOutputId);
        this.viewMode.set('correction');
    }

    handleBackToList(): void {
        this.viewMode.set('list');
        this.selectedId.set(null);

    }

    loadInventoryOutputs(): void {
        this.inventoryOutputService.getInventoryOutputs(this.currentPage(), this.pageSize).subscribe(response => {
            this.inventoryOutputs.set(response.content || []);
            this.totalPages.set(response.page?.totalPages ?? 0);
        });
    }

    handleSearchResults(response: PageResponse<InventoryOutputListItem>): void {
        this.inventoryOutputs.set(response.content || []);
        this.totalPages.set(response.page?.totalPages ?? 0);
        this.currentPage.set(0);
    }

    handleSearchParams(params: InventoryOutputSearchParams): void {
        this.currentSearchParams.set(params);
    }

    toggleSearch(): void {
        this.isSearchVisible.set(!this.isSearchVisible());
    }

    refreshInventOutput(): void {
        const params = {
            ...this.currentSearchParams(),
            page: 0,
            pageSize: (this.currentPage() + 1) * this.pageSize
        };

        this.inventoryOutputService.searchInventoryOutputs(params).subscribe(response => {
            this.inventoryOutputs.set(response.content || []);
        });
    }

    handleLoadMore(): void {
        const nextPage = this.currentPage() + 1;
        this.currentPage.set(nextPage);
        const params = { ...this.currentSearchParams(), page: nextPage, pageSize: this.pageSize };

        this.inventoryOutputService.searchInventoryOutputs(params).subscribe(response => {
            this.inventoryOutputs.update(items => [...items, ...(response.content || [])]);
            this.totalPages.set(response.page?.totalPages ?? 0);
        });
    }

    handleClear(): void {
        this.currentSearchParams.set({});
        this.currentPage.set(0);
    }
}
