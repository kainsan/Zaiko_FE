import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../../services/product.service';

@Component({
    selector: 'product-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-detail-modal.component.html',
    styleUrls: ['./product-detail-modal.component.scss']
})
export class ProductDetailModalComponent implements OnInit, OnChanges {
    @Input() product!: Product;
    @Output() close = new EventEmitter<void>();
    activeTab: string = 'general'; // Default tab
    productForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product'] && changes['product'].currentValue) {
            this.product = changes['product'].currentValue;
        }
    }

    initForm() {
        this.productForm = this.fb.group({
            // isSet: [this.data.isSet],
        });
    }

    selectTab(tab: string): void {
        this.activeTab = tab;
    }

    onClose(): void {
        this.close.emit();
    }
}
