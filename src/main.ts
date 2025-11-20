import './style.css'
import { Gallery } from './components/Gallery'
import { Navigation } from './components/Navigation'
import { ContactForm } from './components/ContactForm'
import { Lightbox } from './components/Lightbox'

// Interface for image data
export interface ImageData {
  id: number;
  src: string;
  alt: string;
  category: 'retratos' | 'eventos' | 'paisajes';
  title: string;
}

// Sample data for gallery (replace with your own photos)
const sampleImages: ImageData[] = [
  // Portraits
  { id: 1, src: '/images/retrato1.jpg', alt: 'Retrato profesional', category: 'retratos', title: 'Retratos' },
  { id: 4, src: '/images/retrato2.jpg', alt: 'Retrato familiar', category: 'retratos', title: 'Retratos' },
  { id: 7, src: '/images/retrato3.jpg', alt: 'Sesión de moda', category: 'retratos', title: 'Retratos' },
  
  // Events
  { id: 2, src: '/images/evento1.jpg', alt: 'Boda romántica', category: 'eventos', title: 'Eventos' },
  { id: 5, src: '/images/evento2.jpg', alt: 'Evento corporativo', category: 'eventos', title: 'Eventos' },
  { id: 8, src: '/images/evento3.jpg', alt: 'Graduación', category: 'eventos', title: 'Eventos' },

  // Landscapes
  { id: 3, src: '/images/paisaje1.jpg', alt: 'Paisaje montañoso', category: 'paisajes', title: 'Paisajes' },
  { id: 6, src: '/images/paisaje2.jpg', alt: 'Atardecer en la playa', category: 'paisajes', title: 'Paisajes' },
  { id: 9, src: '/images/paisaje3.jpg', alt: 'Amanecer', category: 'paisajes', title: 'Paisajes' },
];

// Main application class
class PortfolioApp {
  private gallery: Gallery;
  private navigation: Navigation;
  private contactForm: ContactForm;
  private lightbox: Lightbox;

  constructor() {
    this.gallery = new Gallery(sampleImages);
    this.navigation = new Navigation();
    this.contactForm = new ContactForm();
    this.lightbox = new Lightbox(sampleImages);
    
    this.init();
  }

  private init(): void {
    // Initialize all components
    this.gallery.init();
    this.navigation.init();
    this.contactForm.init();
    this.lightbox.init();

    // Setup smooth scroll for navigation links
    this.setupSmoothScroll();
    
    // Setup hero CTA button
    this.setupHeroCTA();
  }

  private setupSmoothScroll(): void {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  private setupHeroCTA(): void {
    const ctaArrow = document.querySelector('.cta-arrow');
    if (ctaArrow) {
      ctaArrow.addEventListener('click', () => {
        const gallerySection = document.getElementById('galeria');
        if (gallerySection) {
          gallerySection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
      
      // Add keyboard support (accessibility)
      ctaArrow.addEventListener('keydown', (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          const gallerySection = document.getElementById('galeria');
          if (gallerySection) {
            gallerySection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Also export for use in other modules if needed
export { PortfolioApp };
