export class Navigation {
  private hamburger: HTMLElement | null = null;
  private navMenu: HTMLElement | null = null;
  private isMenuOpen: boolean = false;

  public init(): void {
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');

    if (!this.hamburger || !this.navMenu) return;

    this.setupMobileMenu();
    this.setupScrollEffect();
  }

  private setupMobileMenu(): void {
    if (!this.hamburger || !this.navMenu) return;

    this.hamburger.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Close menu when clicking on a link (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (this.isMenuOpen && 
          !this.navMenu?.contains(target) && 
          !this.hamburger?.contains(target)) {
        this.toggleMobileMenu();
      }
    });
  }

  private toggleMobileMenu(): void {
    if (!this.hamburger || !this.navMenu) return;

    this.isMenuOpen = !this.isMenuOpen;
    
    this.hamburger.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Prevent scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  private setupScrollEffect(): void {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add/remove class to change header style
      if (scrollTop > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Hide/show header on mobile
      if (window.innerWidth <= 768) {
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
          // Scrolling down
          header.classList.add('hidden');
        } else {
          // Scrolling up
          header.classList.remove('hidden');
        }
      }
      
      lastScrollTop = scrollTop;
    });
  }
}