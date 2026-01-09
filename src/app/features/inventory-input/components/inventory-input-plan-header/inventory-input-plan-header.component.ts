import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputPlanDTO } from '../../models/inventory-input.model';

@Component({
    selector: 'app-inventory-input-plan-header',
    standalone: true,
    imports: [
        CommonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule
    ],
    templateUrl: './inventory-input-plan-header.component.html',
    styleUrls: ['./inventory-input-plan-header.component.scss']
})
export class InventoryInputPlanHeaderComponent implements OnChanges {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();

    data = signal<InventoryInputPlanDTO[]>([]);

    currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '/');

    constructor(private inventoryInputService: InventoryInputService) { }

    ngOnChanges(changes: SimpleChanges): void {
         if (changes['inventoryInputId']?.currentValue) {
            this.loadData(changes['inventoryInputId'].currentValue);
            }
    }
    private loadData(id: number): void {
      this.inventoryInputService
        .getInventoryInputById(id)
        .subscribe(data => {
             this.data.set(data ?? [])
        });
    }

    onBack(): void {
        this.back.emit();
    }
}
