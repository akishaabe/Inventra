import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {

  constructor(private router: Router) {}

    logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToSettings() {
  this.router.navigate(['/settings']);
}

  /* ========== State ========== */
  products: Product[] = [];
  selectedProducts: Product[] = [];
  currentItem: Product = { id: '', name: '' };

  sidebarOpen = false;
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  searchQuery = '';
  sortColumn: keyof Product = 'id';
  sortDir: 1 | -1 = 1; // 1 = ascending, -1 = descending

  /* ========== Lifecycle ========== */
  ngOnInit() {
    this.loadProducts();
  }

  /* ========== Sidebar Logic ========== */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      document.body.classList.add('sidebar-active');
    } else {
      document.body.classList.remove('sidebar-active');
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.menu-toggle');

    if (
      this.sidebarOpen &&
      sidebar &&
      !sidebar.contains(event.target as Node) &&
      toggleBtn &&
      !toggleBtn.contains(event.target as Node)
    ) {
      this.sidebarOpen = false;
      document.body.classList.remove('sidebar-active');
    }
  }

  /* ========== CRUD Methods ========== */
  async loadProducts() {
    try {
      const res = await fetch('http://localhost:4000/api/inventory');
      this.products = await res.json();
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  }

  async saveItem(form: any) {
    if (!this.currentItem.id || !this.currentItem.name) return;

    try {
      const url = this.isEditing
        ? `http://localhost:4000/api/inventory/${this.currentItem.id}`
        : 'http://localhost:4000/api/inventory';

      const method = this.isEditing ? 'PUT' : 'POST';
      const body = JSON.stringify(this.currentItem);

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      this.showModal = false;
      await this.loadProducts();
    } catch (err) {
      console.error('Error saving item:', err);
    }
  }

  async confirmDelete() {
    const ids = this.selectedProducts.map(p => p.id);
    try {
      await fetch('http://localhost:4000/api/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      this.showDeleteModal = false;
      this.selectedProducts = [];
      await this.loadProducts();
    } catch (err) {
      console.error('Error deleting products:', err);
    }
  }

  /* ========== Selection Logic ========== */
  toggleSelect(item: Product) {
    const idx = this.selectedProducts.indexOf(item);
    if (idx === -1) this.selectedProducts.push(item);
    else this.selectedProducts.splice(idx, 1);
  }

  toggleSelectAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.selectedProducts = checked ? this.visibleProducts.slice() : [];
  }

  isAllSelected() {
    return (
      this.visibleProducts.length > 0 &&
      this.selectedProducts.length === this.visibleProducts.length
    );
  }

  /* ========== Filtering + Sorting ========== */
  get visibleProducts(): Product[] {
    const query = this.searchQuery.trim().toLowerCase();

    // Filter
    let list = this.products.filter(p => {
      if (!query) return true;
      const allValues = Object.values(p)
        .filter(Boolean)
        .map(v => String(v).toLowerCase())
        .join(' ');
      return allValues.includes(query);
    });

    // Sort
    if (this.sortColumn) {
      const col = this.sortColumn;
      list = list.slice().sort((a, b) => {
        const aVal = a[col] ?? '';
        const bVal = b[col] ?? '';

        const aNum = parseFloat(String(aVal));
        const bNum = parseFloat(String(bVal));

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return (aNum - bNum) * this.sortDir;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return aStr.localeCompare(bStr) * this.sortDir;
      });
    }

    return list;
  }

  sortBy(column: keyof Product) {
    if (this.sortColumn === column) {
      this.sortDir = this.sortDir === 1 ? -1 : 1;
    } else {
      this.sortColumn = column;
      this.sortDir = 1;
    }
  }

  sortIndicator(column: keyof Product) {
    if (this.sortColumn !== column) return '⇅';
    return this.sortDir === 1 ? '▲' : '▼';
  }

  /* ========== Modals ========== */
  openAddModal() {
    this.isEditing = false;
    this.currentItem = {
      id: '',
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      expiry: '',
      supplier: ''
    };
    this.showModal = true;
  }

  openEditModal() {
    if (this.selectedProducts.length === 1) {
      this.isEditing = true;
      this.currentItem = { ...this.selectedProducts[0] };
      this.showModal = true;
    }
  }

  openDeleteModal() {
    if (this.selectedProducts.length > 0) this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }
}
