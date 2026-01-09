import { Component, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputPlanDTO } from '../../models/inventory-input.model';

@Component({
    selector: 'app-inventory-input-plan-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule
    ],
    templateUrl: './inventory-input-plan-list.component.html',
    styleUrls: ['./inventory-input-plan-list.component.scss']
})
export class InventoryInputPlanListComponent implements OnChanges {
    @Input() inventoryInputId: number | null = null;

    data = signal<InventoryInputPlanDTO[]>([]);

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
             this.data.set(data ?? []);
          console.log('List loaded data:', this.data);
        });
    }

    addItem() {
        // Logic to add item
    }

    removeItem(index: number) {
        // Logic to remove item
    }
}
