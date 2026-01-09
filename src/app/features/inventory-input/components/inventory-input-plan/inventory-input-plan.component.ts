import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryInputPlanHeaderComponent } from '../inventory-input-plan-header/inventory-input-plan-header.component';
import { InventoryInputPlanListComponent } from '../inventory-input-plan-list/inventory-input-plan-list.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputPlanDTO } from '../../models/inventory-input.model';

@Component({
    selector: 'app-inventory-input-plan',
    standalone: true,
    imports: [
        CommonModule,
        InventoryInputPlanHeaderComponent,
        InventoryInputPlanListComponent
    ],
    templateUrl: './inventory-input-plan.component.html',
    styleUrls: ['./inventory-input-plan.component.scss']
})
export class InventoryInputPlanComponent implements OnInit {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();

    inventoryInputData: InventoryInputPlanDTO[] | null = null;

    constructor(private inventoryInputService: InventoryInputService) { }

    ngOnInit(): void {
        // console.log('Inventory Input ID from Input:', this.inventoryInputId);
        // if (this.inventoryInputId) {
        //     this.loadData(this.inventoryInputId);
        // }
    }

    // loadData(id: number): void {
    //     this.inventoryInputService.getInventoryInputById(id).subscribe(data => {
    //         this.inventoryInputData = data;
    //         console.log('Loaded Inventory Input Data:', this.inventoryInputData);
    //     });
    // }

    onBack(): void {
        this.back.emit();
    }
}
