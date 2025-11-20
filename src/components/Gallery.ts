import type { ImageData } from '../main';

export class Gallery {
  private images: ImageData[];
  private currentFilter: string = 'todos';
  private galleryGrid: HTMLElement | null = null;

  constructor(images: ImageData[]) {
    this.images = images;
  }

  public init(): void {
    this.galleryGrid = document.getElementById('galleryGrid');
    if (!this.galleryGrid) return;

    this.setupFilterButtons();
    this.renderImages(this.images);
  }

  private setupFilterButtons(): void {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get the filter
        const filter = button.getAttribute('data-filter') || 'todos';
        this.filterImages(filter);
      });
    });
  }

  private filterImages(filter: string): void {
    this.currentFilter = filter;
    
    let filteredImages: ImageData[];
    if (filter === 'todos') {
      filteredImages = this.images;
    } else {
      filteredImages = this.images.filter(image => image.category === filter);
    }
    
    this.renderImages(filteredImages);
  }

  private renderImages(images: ImageData[]): void {
    if (!this.galleryGrid) return;

    // Clear the gallery
    this.galleryGrid.innerHTML = '';

    // Create image elements
    images.forEach((image, index) => {
      const imageElement = this.createImageElement(image, index);
      if (this.galleryGrid) {
        this.galleryGrid.appendChild(imageElement);
      }
    });

    // Add entrance animation
    this.animateGalleryItems();
  }

  private createImageElement(image: ImageData, index: number): HTMLElement {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', image.category);
    galleryItem.setAttribute('data-index', index.toString());

    galleryItem.innerHTML = `
      <img src="${image.src}" alt="${image.alt}" class="gallery-image" loading="lazy">
      <div class="gallery-overlay">
        <h3 class="gallery-title">${image.title}</h3>
        <p class="gallery-category">${this.capitalize(image.category)}</p>
      </div>
    `;

    // Add event listener to open lightbox
    galleryItem.addEventListener('click', () => {
      this.openLightbox(image.id);
    });

    return galleryItem;
  }

  private animateGalleryItems(): void {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      (item as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      item.classList.add('fade-in');
    });
  }

  private openLightbox(imageId: number): void {
    // Emit custom event for lightbox to handle
    const event = new CustomEvent('openLightbox', { 
      detail: { imageId } 
    });
    document.dispatchEvent(event);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Método público para obtener imágenes filtradas (útil para el lightbox)
  public getFilteredImages(): ImageData[] {
    if (this.currentFilter === 'todos') {
      return this.images;
    }
    return this.images.filter(image => image.category === this.currentFilter);
  }
}