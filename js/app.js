/**
 * Racine Clicks - Registration Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  
  // Views
  const formContainer = document.getElementById('form-container');
  const successView = document.getElementById('success-view');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const errorDismissBtn = document.getElementById('error-dismiss-btn');
  
  // Success receipt fields
  const receiptName = document.getElementById('receipt-name');
  const receiptMobile = document.getElementById('receipt-mobile');
  const receiptWorkshop = document.getElementById('receipt-workshop');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptPaymentId = document.getElementById('receipt-payment-id');
  const receiptRegId = document.getElementById('receipt-reg-id');
  const receiptDate = document.getElementById('receipt-date');
  const whatsappJoinBtn = document.getElementById('whatsapp-join-btn');
  const registerAnotherBtn = document.getElementById('register-another-btn');
  const printReceiptBtn = document.getElementById('print-receipt-btn');

  // WhatsApp group link configuration
  const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/invite/RacineClicksWorkshop';

  // Radio button card styling handling
  const radioCards = document.querySelectorAll('.radio-card');
  radioCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener('click', () => {
      radio.checked = true;
      updateRadioStyles();
      clearError('designAlbums');
    });
    if (radio) {
      radio.addEventListener('change', () => {
        updateRadioStyles();
        clearError('designAlbums');
      });
    }
  });

  function updateRadioStyles() {
    radioCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    });
  }

  // Real-time error clearing on input/change
  const inputMap = {
    'full-name': 'fullName',
    'mobile-number': 'mobileNumber',
    'email-address': 'email',
    'location-city': 'location',
    'photography-exp': 'photographyExp',
    'user-role': 'role',
    'photoshop-exp': 'photoshopExp',
    'referral-source': 'referralSource'
  };

  Object.entries(inputMap).forEach(([elemId, fieldKey]) => {
    const el = document.getElementById(elemId);
    if (!el) return;
    const eventName = el.tagName.toLowerCase() === 'select' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      clearError(fieldKey);
    });
  });

  // Clear single error message
  function clearError(fieldKey) {
    const errorEl = document.getElementById(`error-${fieldKey}`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
    
    // Also remove error class from element
    const elemId = Object.keys(inputMap).find(key => inputMap[key] === fieldKey);
    if (elemId) {
      const el = document.getElementById(elemId);
      if (el) el.classList.remove('has-error');
    }
    
    if (fieldKey === 'designAlbums') {
      const errorRadio = document.getElementById('error-designAlbums');
      if (errorRadio) {
        errorRadio.textContent = '';
        errorRadio.classList.add('hidden');
      }
    }
  }

  // Display validation errors
  function displayErrors(errors) {
    let firstErrorElement = null;

    Object.entries(errors).forEach(([fieldKey, msg]) => {
      const errorEl = document.getElementById(`error-${fieldKey}`);
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
      }

      // Add has-error border to input/select
      const elemId = Object.keys(inputMap).find(key => inputMap[key] === fieldKey);
      if (elemId) {
        const el = document.getElementById(elemId);
        if (el) {
          el.classList.add('has-error');
          if (!firstErrorElement) firstErrorElement = el;
        }
      }

      if (fieldKey === 'designAlbums' && !firstErrorElement) {
        firstErrorElement = document.getElementById('design-albums-group');
      }
    });

    // Smooth scroll to the first invalid field
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof firstErrorElement.focus === 'function') {
        firstErrorElement.focus();
      }
    }
  }

  // Set loading state
  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnSpinner.classList.remove('hidden');
      btnText.textContent = 'CONNECTING GATEWAY...';
    } else {
      submitBtn.disabled = false;
      btnSpinner.classList.add('hidden');
      btnText.textContent = 'REGISTER & PAY ₹249';
    }
  }

  // Dismiss error banner
  if (errorDismissBtn) {
    errorDismissBtn.addEventListener('click', () => {
      errorBanner.classList.add('hidden');
    });
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.add('hidden');

    // Gather field values
    const selectedRadio = document.querySelector('input[name="designAlbums"]:checked');
    const formData = {
      fullName: document.getElementById('full-name').value.trim(),
      mobileNumber: document.getElementById('mobile-number').value.trim(),
      email: document.getElementById('email-address').value.trim(),
      location: document.getElementById('location-city').value.trim(),
      studioName: document.getElementById('studio-name').value.trim(),
      photographyExp: document.getElementById('photography-exp').value,
      role: document.getElementById('user-role').value,
      photoshopExp: document.getElementById('photoshop-exp').value,
      designAlbums: selectedRadio ? selectedRadio.value : '',
      referralSource: document.getElementById('referral-source').value
    };

    // Client-side validation
    const validationResult = window.Validation.validateFormData(formData);
    if (!validationResult.isValid) {
      displayErrors(validationResult.errors);
      return;
    }

    // Set loading indicator
    setLoading(true);

    try {
      // Call payment integration
      const paymentResult = await window.PaymentGateway.processPayment(formData);

      if (paymentResult && paymentResult.status === 'SUCCESS') {
        // Populate receipt
        receiptName.textContent = formData.fullName;
        receiptMobile.textContent = window.Validation.cleanIndianMobile(formData.mobileNumber);
        receiptWorkshop.textContent = 'Wedding Album Workshop';
        receiptAmount.textContent = '₹' + paymentResult.amount;
        receiptPaymentId.textContent = paymentResult.paymentId;
        receiptRegId.textContent = paymentResult.registrationId;
        
        if (receiptDate) {
          const formattedDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          receiptDate.textContent = formattedDate;
        }

        // Setup WhatsApp join button
        if (whatsappJoinBtn) {
          whatsappJoinBtn.href = WHATSAPP_GROUP_URL;
        }

        // Transition views
        formContainer.classList.add('hidden');
        successView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Payment failure:', err);
      // Show error banner at top of form
      errorMessage.textContent = err.message || 'Payment could not be completed. Please try again.';
      errorBanner.classList.remove('hidden');
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setLoading(false);
    }
  });

  // Register another participant button
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener('click', () => {
      form.reset();
      updateRadioStyles();
      successView.classList.add('hidden');
      formContainer.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Print / Save Receipt
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
