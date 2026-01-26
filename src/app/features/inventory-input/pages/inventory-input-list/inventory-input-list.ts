import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, Params } from '@angular/router';

import { SearchInventoryInputComponent } from '../../components/search-inventory-input/search-inventory-input.component';
import { ListInventoryInputComponent } from '../../components/list-inventory-input/list-inventory-input.component';
import { InventoryInputPlanComponent } from '../../components/input-plan/inventory-input-plan/inventory-input-plan.component';
import { InventoryInputActualComponent } from '../../components/input-actual/inventory-input-actual/inventory-input-actual.component';
import { InventoryInputCorrectionComponent } from '../../components/input-correction/inventory-input-correction/inventory-input-correction.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputDTO, InventoryInputSearchParams } from '../../models/inventory-input.model';
import { PageResponse } from '../../../master-product/response/PageResponse';

@Component({
    selector: 'app-inventory-input-list',
    imports: [RouterModule, CommonModule, SearchInventoryInputComponent, ListInventoryInputComponent, InventoryInputPlanComponent, InventoryInputActualComponent, InventoryInputCorrectionComponent],
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

    viewMode = signal<'list' | 'plan' | 'actual' | 'correction'>('list');
    selectedId = signal<number | null>(null);

    constructor(
        private inventoryInputService: InventoryInputService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // this.loadInventoryInputs();
        this.refreshInventInput();

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

    handleOpenPlan(item: InventoryInputDTO): void {
        this.selectedId.set(item.inventoryInputEntity.inventoryInputId);
        this.viewMode.set('plan');
    }

    handleOpenActual(item: InventoryInputDTO): void {
        this.selectedId.set(item.inventoryInputEntity.inventoryInputId);
        this.viewMode.set('actual');
    }

    handleOpenCorrection(item: InventoryInputDTO): void {
        this.selectedId.set(item.inventoryInputEntity.inventoryInputId);
        this.viewMode.set('correction');
    }

    handleBackToList(): void {
        this.viewMode.set('list');
        this.selectedId.set(null);
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
