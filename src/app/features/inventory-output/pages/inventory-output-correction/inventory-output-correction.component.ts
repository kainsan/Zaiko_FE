import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inventory-output-correction',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inventory-output-correction.component.html',
    styleUrls: ['./inventory-output-correction.component.scss']
})
export class InventoryOutputCorrectionComponent {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();

    onBack(): void {
        this.back.emit();
    }
}
