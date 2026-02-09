import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inventory-output-actual',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inventory-output-actual.component.html',
    styleUrls: ['./inventory-output-actual.component.scss']
})
export class InventoryOutputActualComponent {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();
    @Output() navigateToCorrection = new EventEmitter<number>();

    onBack(): void {
        this.back.emit();
    }
}
