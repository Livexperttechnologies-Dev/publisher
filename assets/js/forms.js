/**
 * KIBO360 - Contact & Demo Forms Handling
 */

// Form submission endpoint (can be configured to a backend API, Web3Forms, Formspree, etc.)
const FORM_ENDPOINT = "";

document.addEventListener('DOMContentLoaded', () => {
  // Modal Elements
  const demoModal = document.getElementById('demo-modal');

  function openModal() {
    if (!demoModal) return;
    demoModal.classList.add('open');
    demoModal.style.display = 'flex';
    demoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = demoModal.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!demoModal) return;
    demoModal.classList.remove('open');
    demoModal.style.display = 'none';
    demoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Delegated Click Handler for all demo modal triggers and close buttons
  document.addEventListener('click', (e) => {
    // 1. Close button clicked
    if (e.target.closest('.modal-close') || e.target.closest('[data-close-modal]')) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      return;
    }

    // 2. Clicked on backdrop outside modal card
    if (e.target === demoModal) {
      e.preventDefault();
      closeModal();
      return;
    }

    // 3. Open demo modal clicked
    const openTrigger = e.target.closest('.nav-cta, [data-open-demo]');
    if (openTrigger) {
      e.preventDefault();
      openModal();
      return;
    }

    // 4. Any button with matching text
    const btn = e.target.closest('button');
    if (btn && !btn.closest('#demo-modal') && !btn.classList.contains('marquee-pause') && !btn.classList.contains('scroller-arrow') && !btn.classList.contains('nav-toggle')) {
      const text = btn.textContent.trim();
      if (text === 'Book a Demo' || text === 'Book a Free Demo' || text === 'Get a Demo' || text === 'Get Early Access') {
        e.preventDefault();
        openModal();
        return;
      }
    }
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && demoModal && (demoModal.classList.contains('open') || demoModal.style.display === 'flex')) {
      closeModal();
    }
  });

  // Initialize any demo or contact form
  initContactForms();
});

function initContactForms() {
  const forms = document.querySelectorAll('.contact-form');

  forms.forEach(form => {
    const slotContainer = form.querySelector('.slot-pills');
    let selectedSlots = [];

    // Slot pill toggles
    if (slotContainer) {
      const pills = slotContainer.querySelectorAll('button');
      pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          const slot = pill.textContent.trim();
          if (selectedSlots.includes(slot)) {
            selectedSlots = selectedSlots.filter(s => s !== slot);
            pill.classList.remove('active');
            pill.setAttribute('aria-pressed', 'false');
          } else {
            if (selectedSlots.length < 3) {
              selectedSlots.push(slot);
              pill.classList.add('active');
              pill.setAttribute('aria-pressed', 'true');
            }
          }
        });
      });
    }

    // Set minimum date for datepicker
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().slice(0, 10);
      dateInput.setAttribute('min', today);
    }

    // Submission handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear existing errors
      form.querySelectorAll('.field-error').forEach(el => el.remove());
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

      let hasError = false;

      // Validate name
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput && !nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name.');
        hasError = true;
      }

      // Validate email
      const emailInput = form.querySelector('input[name="email"]');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (emailInput && (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim()))) {
        showError(emailInput, 'Please enter a valid email address.');
        hasError = true;
      }

      // Validate message
      const messageInput = form.querySelector('textarea[name="message"]');
      if (messageInput && !messageInput.value.trim()) {
        showError(messageInput, 'Please enter a message.');
        hasError = true;
      }

      // Validate slots if present and user picked only 1
      if (slotContainer && selectedSlots.length === 1) {
        const slotError = document.createElement('span');
        slotError.className = 'field-error';
        slotError.setAttribute('role', 'alert');
        slotError.textContent = 'Please select 2-3 time slots, so we have a backup if one is busy.';
        slotContainer.parentElement.appendChild(slotError);
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: form.querySelector('input[name="phone"]')?.value.trim() || '',
        organization: form.querySelector('input[name="organization"]')?.value.trim() || '',
        preferredDate: dateInput?.value || '',
        preferredTimes: selectedSlots.join(', '),
        product: form.querySelector('select[name="product"]')?.value || 'General',
        message: messageInput ? messageInput.value.trim() : ''
      };

      try {
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          if (!res.ok) throw new Error('Submission failed');
        } else {
          // Simulate brief network delay when no endpoint is configured
          await new Promise(r => setTimeout(r, 600));
        }

        // Show Success state
        form.style.display = 'none';
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.setAttribute('role', 'status');
        successDiv.innerHTML = `
          <span class="form-success-icon">
            <svg class="lx-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"></path></svg>
          </span>
          <h3>Thank you! Your message has been received.</h3>
          <p>Our team will get back to you within one business day.</p>
          <button type="button" class="btn btn-primary" id="reset-form-btn">Send another message</button>
        `;
        form.parentElement.appendChild(successDiv);

        successDiv.querySelector('#reset-form-btn').addEventListener('click', () => {
          successDiv.remove();
          form.reset();
          selectedSlots = [];
          if (slotContainer) {
            slotContainer.querySelectorAll('button').forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-pressed', 'false');
            });
          }
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          form.style.display = '';
        });

      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        const globalErr = document.createElement('p');
        globalErr.className = 'field-error';
        globalErr.setAttribute('role', 'alert');
        globalErr.textContent = 'Could not send message. Please call +91-800 800 5672 or email info@livexperttechnologies.com directly.';
        form.appendChild(globalErr);
      }
    });
  });
}

function showError(input, message) {
  input.setAttribute('aria-invalid', 'true');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.setAttribute('role', 'alert');
  err.textContent = message;
  input.parentElement.appendChild(err);
}
