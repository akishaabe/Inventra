import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Product = {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  expiry?: string; // YYYY-MM-DD
  supplier?: string;
};

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory {
  /* UI state */
  sidebarOpen = false;
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  /* search + sort */
  searchQuery: string = '';
  sortColumn: keyof Product | null = 'id';
  sortDir: 1 | -1 = 1; // 1 = asc, -1 = desc

  /* data (in-memory; backend later) */
  products: Product[] = [
    { id: 'P001', name: 'Aspirin', category: 'Pain Relief', quantity: 100, unit: 'pcs', expiry: '2026-02-10', supplier: 'DairyBest' },
    { id: 'P002', name: 'Amoxicillin', category: 'Antibiotic', quantity: 60, unit: 'pcs', expiry: '2025-09-12', supplier: 'BioPharm' },
    { id: 'P003', name: 'Cetirizine', category: 'Allergy', quantity: 40, unit: 'pcs', expiry: '2025-03-22', supplier: 'WellCare' }
  ];

  /* selection */
  selectedProducts: Product[] = [];

  /* currently edited / new item */
  currentItem: Product = { id: '', name: '' };

  /* -------- computed: visibleProducts = filtered + sorted -------- */
  get visibleProducts(): Product[] {
    const q = this.searchQuery?.trim().toLowerCase();
    let list = this.products.filter(p => {
      if (!q) return true;
      // search across all fields (join values)
      const vals = Object.values(p).filter(Boolean).map(v => String(v).toLowerCase()).join(' ');
      return vals.includes(q);
    });

    if (this.sortColumn) {
      const col = this.sortColumn;
      list = list.slice().sort((a, b) => {
        const aRaw = (a[col] ?? '') as any;
        const bRaw = (b[col] ?? '') as any;

        // numeric compare if both parse to numbers
        const aNum = parseFloat(String(aRaw));
        const bNum = parseFloat(String(bRaw));
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return (aNum - bNum) * this.sortDir;
        }

        // fallback string compare
        const as = String(aRaw).toLowerCase();
        const bs = String(bRaw).toLowerCase();
        return as.localeCompare(bs) * this.sortDir;
      });
    }

    return list;
  }

  /* toggle selecting a single row (row click or checkbox) */
  toggleSelect(item: Product) {
    const idx = this.selectedProducts.indexOf(item);
    if (idx === -1) this.selectedProducts.push(item);
    else this.selectedProducts.splice(idx, 1);
  }

  /* select/deselect only visible rows */
  toggleSelectAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) {
      // select visible items
      this.selectedProducts = this.visibleProducts.slice();
    } else {
      // deselect all
      this.selectedProducts = [];
    }
  }

  isAllSelected(): boolean {
    return this.visibleProducts.length > 0 && this.selectedProducts.length === this.visibleProducts.length;
  }

  /* sorting: clicking header toggles direction */
  sortBy(column: keyof Product | null) {
    if (!column) return;
    if (this.sortColumn === column) {
      this.sortDir = (this.sortDir === 1 ? -1 : 1) as 1 | -1;
    } else {
      this.sortColumn = column;
      this.sortDir = 1;
    }
  }

  sortIndicator(column: keyof Product) {
    if (this.sortColumn !== column) return '⇅';
    return this.sortDir === 1 ? '▲' : '▼';
  }

  /* -------- Modals & CRUD -------- */
  openAddModal() {
    this.isEditing = false;
    this.currentItem = { id: '', name: '', category: '', quantity: 0, unit: '', expiry: '', supplier: '' };
    this.showModal = true;
  }

  openEditModal() {
    if (this.selectedProducts.length !== 1) return;
    this.isEditing = true;
    // clone selected item to avoid mutating table row until saved
    this.currentItem = { ...this.selectedProducts[0] };
    this.showModal = true;
  }

  openDeleteModal() {
    if (this.selectedProducts.length === 0) return;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  /* Save (add or update). itemForm is passed from template to rely on validation */
  saveItem(itemForm: any) {
    // template enforces required but double-check here too
    if (!this.currentItem.id || !this.currentItem.name) {
      // let template show errors; do not proceed
      return;
    }

    if (this.isEditing) {
      const idx = this.products.findIndex(p => p.id === this.currentItem.id);
      if (idx > -1) {
        // update in place
        this.products[idx] = { ...this.currentItem };
        // keep selection synced to updated reference
        this.selectedProducts = [this.products[idx]];
      } else {
        // if ID changed and not found, add as new
        this.products.push({ ...this.currentItem });
        this.selectedProducts = [];
      }
    } else {
      // Add new — user must supply Product ID (no auto-generation)
      // prevent duplicate IDs
      const exists = this.products.some(p => p.id === this.currentItem.id);
      if (exists) {
        // you may replace this with a nicer UI message; for now prevent add
        alert('Product ID already exists. Choose a different ID.');
        return;
      }
      this.products.push({ ...this.currentItem });
      this.selectedProducts = [];
    }

    this.showModal = false;
  }

  confirmDelete() {
    const toDelete = new Set(this.selectedProducts.map(p => p.id));
    this.products = this.products.filter(p => !toDelete.has(p.id));
    this.selectedProducts = [];
    this.showDeleteModal = false;
  }
}
