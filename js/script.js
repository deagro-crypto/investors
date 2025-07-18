// JavaScript for DeAgro Investor Landing Page

document.addEventListener('DOMContentLoaded', function() {
  // Initialize multi-step form
  initMultiStepForm();
  
  // Initialize FAQ accordion
  initFaqAccordion();
  
  // Initialize header scroll effect
  initHeaderScroll();
  
  // Initialize animations
  initAnimations();
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
      // Validate current step
      if (validateStep(currentStep)) {
        // Hide current step
        steps[currentStep].classList.remove('active');
        // Show next step
        currentStep++;
        steps[currentStep].classList.add('active');
        // Update progress indicator
        updateProgress();
      }
    });
  });
  
  // Previous button click handler
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Hide current step
      steps[currentStep].classList.remove('active');
      // Show previous step
      currentStep--;
      steps[currentStep].classList.add('active');
      // Update progress indicator
      updateProgress();
    });
  });
  
 // Form submission handler
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (validateStep(currentStep)) {
    // Show loading state
    const submitButton = form.querySelector('.submit-form');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Collect form data
    const formData = new FormData(form);
    
    // Handle checkbox values properly
    const interests = [];
    const checkboxes = form.querySelectorAll('input[name="interests"]:checked');
    checkboxes.forEach(checkbox => {
      interests.push(checkbox.value);
    });
    
    // Replace individual checkbox values with combined interests
    formData.delete('interests');
    if (interests.length > 0) {
      formData.append('interests', interests.join(', '));
    }
    
    // Add additional Formspree fields
    formData.append('_subject', 'New DeAgro Investor Registration');
    formData.append('_replyto', formData.get('email'));
    
    // Submit to Formspree with better error handling
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is ok
      if (response.ok) {
        return response.json().catch(() => ({})); // Handle non-JSON responses
      } else {
        // Try to get error details
        return response.text().then(text => {
          console.error('Error response:', text);
          throw new Error(`HTTP ${response.status}: ${text || 'Form submission failed'}`);
        });
      }
    })
    .then(data => {
      console.log('Success response:', data);
      // Show success message
      form.innerHTML = `
        <div class="form-success">
          <div class="success-icon">✓</div>
          <h3>Thank You for Your Interest!</h3>
          <p>Your registration has been successfully submitted. One of our investment advisors will contact you soon to discuss the next steps.</p>
          <p class="success-reference">Your reference number: <strong>DEA-${generateReferenceNumber()}</strong></p>
        </div>
      `;
    })
    .catch(error => {
      console.error('Detailed error:', error);
      
      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      
      // Create detailed error message
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
      
      // Insert error message
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
  function validateStep(stepIndex) {
    const currentStepElement = steps[stepIndex];
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        highlightInvalidField(field);
      } else {
        removeInvalidHighlight(field);
      }
    });
    
    return isValid;
  }
  
  // Highlight invalid field
  function highlightInvalidField(field) {
    field.classList.add('invalid');
    field.addEventListener('input', function() {
      if (field.value.trim()) {
        removeInvalidHighlight(field);
      }
    }, { once: true });
  }
  
  // Remove invalid highlight
  function removeInvalidHighlight(field) {
    field.classList.remove('invalid');
  }
  
  // Generate random reference number
  function generateReferenceNumber() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// FAQ accordion functionality
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
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
}

// Header scroll effect
function initHeaderScroll() {
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Initialize animations
function initAnimations() {
  // Animate elements when they come into view
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.dataset.animation || 'fade-in';
        element.classList.add(animation);
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.1
  });
  
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// Testimonial slider functionality
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  const indicators = document.querySelectorAll('.testimonial-indicators .indicator');
  
  if (!slider || !indicators.length) return;
  
  let currentSlide = 0;
  const slides = slider.querySelectorAll('.testimonial-card');
  
  // Show initial slide
  showSlide(currentSlide);
  
  // Set up indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });
  
  // Auto-advance slides
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000);
  
  function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
      slide.style.display = 'none';
    });
    
    // Show current slide
    slides[index].style.display = 'block';
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
}

// Auto-configure external links to open in new tab
document.addEventListener('DOMContentLoaded', function() {
  // Get all links on the page
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if it's an external link (starts with http/https and not current domain)
    if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes(window.location.hostname)) {
      // Add target="_blank" and rel="noopener" for security
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
    
    // Also handle mailto links
    if (href && href.startsWith('mailto:')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
  });
});

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!mobileMenuToggle || !mobileNav) return;
  
  // Toggle mobile menu
  mobileMenuToggle.addEventListener('click', function() {
    mobileMenuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close menu when clicking on links
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Versão limpa e definitiva - substitua todo o final do script.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initMultiStepForm();
  initFaqAccordion();
  initHeaderScroll();
  initAnimations();
  initMobileMenu();
  
  // Configure external links
  configureExternalLinks();
});

// Function to configure external links
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
