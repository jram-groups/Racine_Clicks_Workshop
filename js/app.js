/**
 * Racine Clicks - Registration Application Orchestrator (Index Page)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Form Elements
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const errorDismissBtn = document.getElementById('error-dismiss-btn');

  // Google Sheets Web App Endpoint (Paste your Google Apps Script Web App URL here)
  const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyhByyWvPWlfReCANLnjGZ5gnjjngJPo_1DdP32PsJ7QP_hTydXIcY8mVYjIYEx2U_1gA/exec'; // e.g. https://script.google.com/macros/s/AKfycbx.../exec

  /**
   * Save registration details to Google Sheet via Google Apps Script
   */
  async function saveToGoogleSheet(payload) {
    if (!GOOGLE_SHEET_WEBAPP_URL) {
      console.log('Google Sheets URL not configured yet. Payload:', payload);
      return;
    }

    try {
      await fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors', // Avoid CORS restrictions from Google Apps Script
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
      console.log('Successfully dispatched registration data to Google Sheets.');
    } catch (sheetErr) {
      console.error('Could not save to Google Sheet:', sheetErr);
    }
  }

  /**
   * Generate a readable registration ID: RC-WAW-XXXXX
   */
  function generateRegistrationId() {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RC-WAW-${timestamp}${random}`;
  }

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
      btnText.textContent = 'PROCEEDING TO PAYMENT...';
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

  // Handle Form Submission -> Redirect to payment.html
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
      const regId = generateRegistrationId();
      const registrationRecord = {
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        registrationId: regId,
        fullName: formData.fullName,
        mobileNumber: window.Validation.cleanIndianMobile(formData.mobileNumber),
        email: formData.email,
        cityLocation: formData.location,
        studioName: formData.studioName || 'N/A',
        photographyExp: formData.photographyExp,
        role: formData.role,
        photoshopExp: formData.photoshopExp,
        designAlbums: formData.designAlbums,
        referralSource: formData.referralSource,
        amountPaid: '₹249',
        status: 'PENDING_PAYMENT'
      };

      // Store in sessionStorage for payment.html
      sessionStorage.setItem('racine_registration', JSON.stringify(registrationRecord));

      // Record to Google Sheet (awaits dispatch with 1.2s maximum delay so UX remains snappy)
      await Promise.race([
        saveToGoogleSheet(registrationRecord),
        new Promise(resolve => setTimeout(resolve, 1200))
      ]);

      // Redirect to payment.html
      window.location.href = 'payment.html';

    } catch (err) {
      console.error('Registration processing error:', err);
      errorMessage.textContent = 'An unexpected error occurred. Please try again.';
      errorBanner.classList.remove('hidden');
      setLoading(false);
    }
  });
});
