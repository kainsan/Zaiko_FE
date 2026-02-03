import { Component, computed, EventEmitter, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryOutputListItem } from '../../models/inventory-output.model';

@Component({
    selector: 'list-inventory-output',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './list-inventory-output.component.html',
    styleUrls: ['./list-inventory-output.component.scss'],
})
export class ListInventoryOutputComponent implements OnInit {
    inventoryOutputs = input<InventoryOutputListItem[]>([]);
    totalPages = input<number>(0);
    currentPage = input<number>(0);

    @Output() openDetail = new EventEmitter<any>();
    @Output() openPlan = new EventEmitter<any>();
    @Output() openActual = new EventEmitter<any>();
    @Output() openCorrection = new EventEmitter<any>();
    @Output() loadMore = new EventEmitter<void>();

    displayItems = computed(() => {
        return this.inventoryOutputs();
    });

    constructor() {
    }

    ngOnInit(): void { }

    onOpenDetail(item: any): void {
        this.openDetail.emit(item);
    }

    onOpenPlan(item: InventoryOutputListItem): void {
        this.openPlan.emit(item);
    }

    onOpenActual(item: InventoryOutputListItem): void {
        this.openActual.emit(item);
    }

    onOpenCorrection(item: InventoryOutputListItem): void {
        this.openCorrection.emit(item);
    }

    onDownloadCsv(): void {
        console.log('Downloading CSV...');
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case '0': return '未出';
            case '1': return '残';
            case '2': return '済';
            default: return '未出';
        }
    }

    // isPlanDisabled(item: InventoryOutputDTO): boolean {
    //     if (!item.inventoryOutputEntity.outputPlanDate) {
    //         return true;
    //     } else
    //         return false;
    // }

    // isActualDisabled(item: InventoryOutputDTO): boolean {
    //     if (!item.inventoryOutputEntity.outputActualDate && item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "0") {
    //         ;
    //         return false;
    //     }
    //     else if (!item.inventoryOutputEntity.outputActualDate && item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "1") {
    //         return true;
    //     }
    //     else if (item.inventoryOutputEntity.outputActualDate && item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "0") {
    //         return false;
    //     }
    //     else if (item.inventoryOutputEntity.outputActualDate && item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "1") {
    //         return true;
    //     }
    //     else if (item.inventoryOutputEntity.outputActualDate && !item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "0") {
    //         return true;
    //     }
    //     else if (item.inventoryOutputEntity.outputActualDate && !item.inventoryOutputEntity.outputPlanDate && item.inventoryOutputEntity.isClosed == "1") {
    //         return true;
    //     }
    //     return false;
    // }

    // isCorrectionDisabled(item: InventoryOutputDTO): boolean {
    //     return !item.inventoryOutputEntity.outputActualDate;
    // }
}
