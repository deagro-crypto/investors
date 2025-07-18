// JavaScript for DeAgro Investor Landing Page

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing DeAgro components...');
  
  // Initialize all components
  initMultiStepForm();
  initFaqAccordion();
  initHeaderScroll();
  initAnimations();
  initMobileMenu();
  configureExternalLinks();
  
  console.log('All components initialized successfully');
});

// Multi-step form functionality
function initMultiStepForm() {
  const form = document.getElementById('multi-step-form');
  if (!form) return;
  
  const steps = form.querySelectorAll('.form-step');
  const progressSteps = form.querySelectorAll('.progress-step');
  const nextButtons = form.querySelectorAll('.next-step');
  const prevButtons = form.querySelectorAll('.prev-step');
  
  let currentStep = 0;
  
  // Next button click handler
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        steps[currentStep].classList.remove('active');
        currentStep++;
        steps[currentStep].classList.add('active');
        updateProgress();
      }
    });
  });
  
  // Previous button click handler
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      steps[currentStep].classList.remove('active');
      currentStep--;
      steps[currentStep].classList.add('active');
      updateProgress();
    });
  });
  
  // Form submission handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      const submitButton = form.querySelector('.submit-form');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      
      const existingError = form.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      
      const formData = new FormData(form);
      
      const interests = [];
      const checkboxes = form.querySelectorAll('input[name="interests"]:checked');
      checkboxes.forEach(checkbox => {
        interests.push(checkbox.value);
      });
      
      formData.delete('interests');
      if (interests.length > 0) {
        formData.append('interests', interests.join(', '));
      }
      
      formData.append('_subject', 'New DeAgro Investor Registration');
      formData.append('_replyto', formData.get('email'));
      
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log('Response status:', response.status);
        
        if (response.ok) {
          return response.json().catch(() => ({}));
        } else {
          return response.text().then(text => {
            console.error('Error response:', text);
            throw new Error(`HTTP ${response.status}: ${text || 'Form submission failed'}`);
          });
        }
      })
      .then(data => {
        console.log('Success response:', data);
        form.innerHTML = `
          <div class="form-success">
            <div class="success-icon">✓</div>
            <h3>Thank You for Your Interest!</h3>
            <p>Your registration has been successfully submitted. One of our investment advisors will contact you within 24 hours to discuss the next steps.</p>
            <p class="success-reference">Your reference number: <strong>DEA-${generateReferenceNumber()}</strong></p>
          </div>
        `;
      })
      .catch(error => {
        console.error('Detailed error:', error);
        
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.cssText = 'color: #dc3545; text-align: center; margin-top: 1rem; padding: 0.5rem; background: rgba(220, 53, 69, 0.1); border-radius: 4px; border: 1px solid rgba(220, 53, 69, 0.3);';
        
        let errorText = 'There was an error submitting your form.';
        if (error.message.includes('CORS')) {
          errorText = 'Network error: Please check your internet connection.';
        } else if (error.message.includes('404')) {
          errorText = 'Form endpoint not found. Please contact support.';
        } else if (error.message.includes('403')) {
          errorText = 'Form submission not allowed. Please contact support.';
        }
        
        errorMessage.innerHTML = `
          <strong>Submission Error:</strong><br>
          ${errorText}<br>
          <small>Please contact us directly at <a href="mailto:deagro@deagro.io">deagro@deagro.io</a></small><br>
          <small style="color: #666;">Error details: ${error.message}</small>
        `;
        
        const formButtons = form.querySelector('.form-buttons');
        if (formButtons) {
          formButtons.parentNode.insertBefore(errorMessage, formButtons);
        } else {
          form.appendChild(errorMessage);
        }
      });
    }
  });
  
  // Update progress indicator
  function updateProgress() {
    progressSteps.forEach((step, index) => {
      if (index <= currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
  
  // Validate current step
  function validateStep(step) {
    const currentStepElement = steps[step];
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('invalid');
        isValid = false;
        addInvalidListener(field);
      } else {
        field.classList.remove('invalid');
      }
    });
    
    return isValid;
  }
  
  function addInvalidListener(field) {
    field.addEventListener('input', function() {
      if (field.value.trim()) {
        removeInvalidHighlight(field);
      }
    }, { once: true });
  }
  
  function removeInvalidHighlight(field) {
    field.classList.remove('invalid');
  }
  
  function generateReferenceNumber() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// FAQ accordion functionality - VERSÃO CORRIGIDA
function initFaqAccordion() {
  console.log('Initializing FAQ accordion...');
  
  // Aguardar um pouco para garantir que o DOM está completamente carregado
  setTimeout(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('FAQ: Found', faqItems.length, 'items');
    
    if (faqItems.length === 0) {
      console.warn('FAQ: No FAQ items found!');
      return;
    }
    
    faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq-question');
      
      if (question) {
        console.log('FAQ: Adding listener to item', index);
        
        // Remover listeners existentes
        question.replaceWith(question.cloneNode(true));
        const newQuestion = item.querySelector('.faq-question');
        
        // Adicionar event listeners para desktop e mobile
        ['click', 'touchend'].forEach(eventType => {
          newQuestion.addEventListener(eventType, function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('FAQ: Toggling item', index);
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
              if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
              }
            });
          });
        });
      } else {
        console.warn('FAQ: No question element found in item', index);
      }
    });
  }, 500);
}

// Header scroll effect
function initHeaderScroll() {
  const header = document.querySelector('.header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

// Animation on scroll
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!mobileMenuToggle || !mobileNav) return;
  
  mobileMenuToggle.addEventListener('click', function() {
    mobileMenuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    
    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  document.addEventListener('click', function(e) {
    if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Configure external links
function configureExternalLinks() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    if (href && (href.startsWith('http://' ) || href.startsWith('https://' )) && !href.includes(window.location.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
    
    if (href && href.startsWith('mailto:')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
  });
}
