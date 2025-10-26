import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventoryService } from './inventory.service';


type Product = {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  expiry?: string;
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

  constructor(private router: Router, private inventoryService: InventoryService) {}

  products: Product[] = [];
  selectedProducts: Product[] = [];
  currentItem: Product = { id: '', name: '' };
  categories = ['Beverage', 'Flavoring', 'Ingredient', 'Packaging', 'Raw Material', 'Supply'];

  sidebarOpen = false;
  showModal = false;
  showDeleteModal = false;
  isEditing = false;

  searchQuery = '';
  sortColumn: keyof Product = 'id';
  sortDir: 1 | -1 = 1;

  ngOnInit() {
    this.loadProducts();
  }

    getNextProductId() {
    this.inventoryService.getNextProductId().subscribe({
      next: (res) => this.currentItem.id = res.nextId,
      error: (err) => console.error('Error fetching next product ID:', err)
    });
  }


  showLogoutModal = false;

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    localStorage.clear();
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.body.classList.toggle('sidebar-active', this.sidebarOpen);
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

  async loadProducts() {
    this.inventoryService.getInventory().subscribe({
      next: (res) => this.products = res,
      error: (err) => console.error('Error loading inventory:', err)
    });
  }

  async saveItem() {
    if (!this.currentItem.name?.trim()) {
      console.warn('Missing name');
      return;
    }

    const payload = {
      name: this.currentItem.name,
      category: this.currentItem.category,
      quantity: this.currentItem.quantity,
      unit: this.currentItem.unit,
      supplier_id: this.currentItem.supplier,
      expiry: this.currentItem.expiry
    };

    const request = this.isEditing
      ? this.inventoryService.updateProduct(this.currentItem.id, payload)
      : this.inventoryService.addProduct(payload);

    request.subscribe({
      next: async () => {
        this.showModal = false;
        await this.loadProducts();
      },
      error: (err) => console.error('Error saving item:', err)
    });
  }

  async confirmDelete() {
    const ids = this.selectedProducts.map(p => p.id);
    this.inventoryService.deleteProducts(ids).subscribe({
      next: async () => {
        this.showDeleteModal = false;
        this.selectedProducts = [];
        await this.loadProducts();
      },
      error: (err) => console.error('Error deleting products:', err)
    });
  }

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
    return this.visibleProducts.length > 0 &&
      this.selectedProducts.length === this.visibleProducts.length;
  }

  get visibleProducts(): Product[] {
    const query = this.searchQuery.trim().toLowerCase();
    let list = this.products.filter(p => {
      if (!query) return true;
      const allValues = Object.values(p)
        .filter(Boolean)
        .map(v => String(v).toLowerCase())
        .join(' ');
      return allValues.includes(query);
    });

    if (this.sortColumn) {
      const col = this.sortColumn;
      list = list.slice().sort((a, b) => {
        const aVal = a[col] ?? '';
        const bVal = b[col] ?? '';
        const aNum = parseFloat(String(aVal));
        const bNum = parseFloat(String(bVal));
        if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * this.sortDir;
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return aStr.localeCompare(bStr) * this.sortDir;
      });
    }
    return list;
  }

  sortBy(column: keyof Product) {
    if (this.sortColumn === column) this.sortDir = this.sortDir === 1 ? -1 : 1;
    else {
      this.sortColumn = column;
      this.sortDir = 1;
    }
  }

  sortIndicator(column: keyof Product) {
    if (this.sortColumn !== column) return '⇅';
    return this.sortDir === 1 ? '▲' : '▼';
  }

  openAddModal() {
    this.isEditing = false;
    this.currentItem = { id: '', name: '', category: '', quantity: 0, unit: '', expiry: '', supplier: '' };
    this.showModal = true;
    this.getNextProductId(); // 🔹 Fetch auto-incremented product ID
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
