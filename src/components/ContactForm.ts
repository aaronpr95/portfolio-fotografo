interface FormData {
  name: string;
  email: string;
  message: string;
}

export class ContactForm {
  private form: HTMLFormElement | null = null;
  private submitBtn: HTMLElement | null = null;

  public init(): void {
    this.form = document.getElementById('contactForm') as HTMLFormElement;
    this.submitBtn = document.querySelector('.submit-btn');

    if (!this.form) return;

    this.setupFormValidation();
    this.setupFormSubmission();
  }

  private setupFormValidation(): void {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLTextAreaElement;
      
      // Real-time validation
      element.addEventListener('blur', () => {
        this.validateField(element);
      });

      // Clear errors when typing
      element.addEventListener('input', () => {
        this.clearFieldError(element);
      });
    });
  }

  private validateField(field: HTMLInputElement | HTMLTextAreaElement): boolean {
    const value = field.value.trim();
    const isValid = this.isFieldValid(field, value);
    
    if (!isValid) {
      this.showFieldError(field, this.getErrorMessage(field, value));
    } else {
      this.clearFieldError(field);
    }
    
    return isValid;
  }

  private isFieldValid(field: HTMLInputElement | HTMLTextAreaElement, value: string): boolean {
    if (field.hasAttribute('required') && !value) {
      return false;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }

    if (field.name === 'name' && value) {
      return value.length >= 2;
    }

    if (field.name === 'message' && value) {
      return value.length >= 10;
    }

    return true;
  }

  private getErrorMessage(field: HTMLInputElement | HTMLTextAreaElement, value: string): string {
    if (field.hasAttribute('required') && !value) {
      return 'Este campo es obligatorio';
    }

    if (field.type === 'email' && value) {
      return 'Por favor ingresa un email válido';
    }

    if (field.name === 'name' && value) {
      return 'El nombre debe tener al menos 2 caracteres';
    }

    if (field.name === 'message' && value) {
      return 'El mensaje debe tener al menos 10 caracteres';
    }

    return 'Campo inválido';
  }

  private showFieldError(field: HTMLInputElement | HTMLTextAreaElement, message: string): void {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remover error anterior
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Agregar clase de error
    field.classList.add('error');

    // Crear y agregar mensaje de error
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  }

  private clearFieldError(field: HTMLInputElement | HTMLTextAreaElement): void {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    field.classList.remove('error');
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  private setupFormSubmission(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission();
    });
  }

  private async handleFormSubmission(): Promise<void> {
    if (!this.form || !this.submitBtn) return;

    // Validar todos los campos
    const inputs = this.form.querySelectorAll('input, textarea');
    let isFormValid = true;

    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLTextAreaElement;
      if (!this.validateField(element)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showNotification('Por favor corrige los errores antes de enviar', 'error');
      return;
    }

    // Obtener datos del formulario
    const formData = this.getFormData();
    
    // Mostrar estado de carga
    this.setLoadingState(true);

    try {
      // Enviar email real con EmailJS
      await this.sendEmailWithSMTP(formData);
      
      this.showNotification('¡Mensaje enviado exitosamente! Te contactaré pronto.', 'success');
      this.resetForm();
      
    } catch {
      // Error handling through user notification
      this.showNotification('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  private getFormData(): FormData {
    if (!this.form) throw new Error('Form not found');

    const nameInput = this.form.querySelector('#name') as HTMLInputElement;
    const emailInput = this.form.querySelector('#email') as HTMLInputElement;
    const messageInput = this.form.querySelector('#message') as HTMLTextAreaElement;

    return {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };
  }

  private async sendEmailWithSMTP(data: FormData): Promise<void> {
    // Detect if we're in development or production
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/send-email'
      : '/api/send-email';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error enviando email');
    }
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.submitBtn) return;

    if (isLoading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.textContent = 'Enviando...';
      (this.submitBtn as HTMLButtonElement).disabled = true;
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.textContent = 'Enviar Mensaje';
      (this.submitBtn as HTMLButtonElement).disabled = false;
    }
  }

  private resetForm(): void {
    if (!this.form) return;
    
    this.form.reset();
    
    // Limpiar errores
    const errorFields = this.form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    const errorMessages = this.form.querySelectorAll('.field-error');
    errorMessages.forEach(message => message.remove());
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}