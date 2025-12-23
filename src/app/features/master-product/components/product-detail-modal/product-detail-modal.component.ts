import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterProductDTO, Product, Repository, Location } from '../../model/product.model';
import { CommonSearchDialogComponent } from '../common-search-dialog/common-search-dialog.component';
import { ProductService } from '../../services/product.service';

@Component({
    selector: 'product-detail-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    templateUrl: './product-detail-modal.component.html',
    styleUrls: ['./product-detail-modal.component.scss']
})
export class ProductDetailModalComponent implements OnInit, OnChanges {
    @Input() product!: MasterProductDTO;
    @Output() close = new EventEmitter<void>();
    activeTab: string = 'general'; // Default tab
    productForm!: FormGroup;

    repositories = signal<Repository[]>([]);
    locations = signal<Location[]>([]);

    constructor(
        private fb: FormBuilder,
        private dialog: MatDialog,
        private productService: ProductService
    ) { }

    openSupplierSearch(): void {
        this.dialog.open(CommonSearchDialogComponent, {
            width: '800px',
            height: '600px',
            panelClass: 'custom-dialog-container',
            autoFocus: false
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.loadRepositories();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product'] && changes['product'].currentValue) {
            this.product = changes['product'].currentValue;
            if (this.product.productEntity.repositoryId) {
                this.loadLocations(this.product.productEntity.repositoryId);
            }
        }
    }

    loadRepositories(): void {
        this.productService.getRepositories().subscribe(repos => {
            this.repositories.set(repos);
        });
    }

    loadLocations(repositoryId: number): void {
        this.productService.getLocationsByRepository(repositoryId).subscribe(locs => {
            this.locations.set(locs);
            console.log(locs)
        });
    }

    onWarehouseChange(event: any): void {
        const repositoryId = event.target.value;
        if (repositoryId) {
            this.loadLocations(Number(repositoryId));
        } else {
            this.locations.set([]);
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
