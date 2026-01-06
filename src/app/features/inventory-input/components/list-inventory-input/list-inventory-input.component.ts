import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryInputDTO } from '../../models/inventory-input.model';

@Component({
    selector: 'list-inventory-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './list-inventory-input.component.html',
    styleUrls: ['./list-inventory-input.component.scss'],
})
export class ListInventoryInputComponent implements OnInit {
    @Input() items: InventoryInputDTO[] = [];

    @Output() openDetail = new EventEmitter<any>();
    @Output() loadMore = new EventEmitter<void>();

    constructor() {
    }

    ngOnInit(): void { }

    onOpenDetail(item: any): void {
        this.openDetail.emit(item);
    }

    onDownloadCsv(): void {
        console.log('Downloading CSV...');
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case '0': return '未入';
            case '1': return '残';
            case '2': return '済';
            default: return '未入';
        }
    }
}
