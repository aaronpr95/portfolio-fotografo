import type { ImageData } from '../main';

export class Lightbox {
  private images: ImageData[];
  private currentImageIndex: number = 0;
  private isOpen: boolean = false;
  private lightboxElement: HTMLElement | null = null;
  private lightboxImage: HTMLImageElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;

  constructor(images: ImageData[]) {
    this.images = images;
  }

  public init(): void {
    this.lightboxElement = document.getElementById('lightbox');
    this.lightboxImage = document.querySelector('.lightbox-image');
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.closeBtn = document.querySelector('.close-btn');

    if (!this.lightboxElement) return;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Custom event to open lightbox from gallery
    document.addEventListener('openLightbox', ((e: CustomEvent) => {
      const imageId = e.detail.imageId;
      this.openLightbox(imageId);
    }) as EventListener);

    // Close button
    this.closeBtn?.addEventListener('click', () => {
      this.closeLightbox();
    });

    // Close when clicking on background
    this.lightboxElement?.addEventListener('click', (e) => {
      if (e.target === this.lightboxElement) {
        this.closeLightbox();
      }
    });

    // Navigation with buttons
    this.prevBtn?.addEventListener('click', () => {
      this.showPreviousImage();
    });

    this.nextBtn?.addEventListener('click', () => {
      this.showNextImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.showPreviousImage();
          break;
        case 'ArrowRight':
          this.showNextImage();
          break;
      }
    });

    // Prevenir scroll cuando el lightbox está abierto
    document.addEventListener('wheel', (e) => {
      if (this.isOpen) {
        e.preventDefault();
      }
    }, { passive: false });

    // Touch events para móvil
    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    if (!this.lightboxElement) return;

    let startX = 0;
    let endX = 0;

    this.lightboxElement.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    this.lightboxElement.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = startX - endX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe left - next image
          this.showNextImage();
        } else {
          // Swipe right - previous image
          this.showPreviousImage();
        }
      }
    };

    this.handleSwipe = handleSwipe;
  }

  private handleSwipe = () => {};

  private openLightbox(imageId: number): void {
    const imageIndex = this.images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    this.currentImageIndex = imageIndex;
    this.isOpen = true;
    
    this.updateLightboxImage();
    this.showLightbox();
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  }

  private closeLightbox(): void {
    this.isOpen = false;
    this.hideLightbox();
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  private showLightbox(): void {
    if (!this.lightboxElement) return;
    
    this.lightboxElement.classList.add('active');
    
    // Animación de entrada
    setTimeout(() => {
      this.lightboxElement?.classList.add('show');
    }, 10);
  }

  private hideLightbox(): void {
    if (!this.lightboxElement) return;
    
    this.lightboxElement.classList.remove('show');
    
    setTimeout(() => {
      this.lightboxElement?.classList.remove('active');
    }, 300);
  }

  private updateLightboxImage(): void {
    if (!this.lightboxImage) return;

    const currentImage = this.images[this.currentImageIndex];
    if (!currentImage) return;

    // Mostrar loading state
    this.lightboxImage.style.opacity = '0.5';
    
    // Precargar imagen
    const img = new Image();
    img.onload = () => {
      if (this.lightboxImage) {
        this.lightboxImage.src = currentImage.src;
        this.lightboxImage.alt = currentImage.alt;
        this.lightboxImage.style.opacity = '1';
      }
    };
    
    img.onerror = () => {
      // Image loading error handled silently
      if (this.lightboxImage) {
        this.lightboxImage.style.opacity = '1';
        // Mostrar imagen placeholder o error
        this.lightboxImage.src = '/placeholder-error.jpg';
        this.lightboxImage.alt = 'Error al cargar la imagen';
      }
    };
    
    img.src = currentImage.src;

    // Actualizar navegación
    this.updateNavigation();
  }

  private updateNavigation(): void {
    if (!this.prevBtn || !this.nextBtn) return;

    // Mostrar/ocultar botones según la posición
    this.prevBtn.style.display = this.currentImageIndex > 0 ? 'block' : 'none';
    this.nextBtn.style.display = this.currentImageIndex < this.images.length - 1 ? 'block' : 'none';
  }

  private showPreviousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateLightboxImage();
    }
  }

  private showNextImage(): void {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
      this.updateLightboxImage();
    }
  }

  // Public method to update images (useful when gallery is filtered)
  public updateImages(images: ImageData[]): void {
    this.images = images;
    if (this.isOpen) {
      // If lightbox is open, adjust index if necessary
      if (this.currentImageIndex >= images.length) {
        this.currentImageIndex = Math.max(0, images.length - 1);
        this.updateLightboxImage();
      }
    }
  }
}