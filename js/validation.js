/**
 * Form Validation Module for Racine Clicks Registration
 */

const Validation = {
  /**
   * Validate Indian Mobile Number
   * Validates 10-digit Indian numbers starting with 6, 7, 8, or 9
   * Supports optional +91 or 0 prefix
   */
  isValidIndianMobile(phoneStr) {
    if (!phoneStr) return false;
    // Strip out spaces, dashes, parentheses
    let cleaned = phoneStr.replace(/[\s\-\(\)]/g, '');
    
    // Remove leading +91 or 91 if present and total length is 12
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }

    // Must be exactly 10 digits starting with 6, 7, 8, or 9
    const regex = /^[6-9]\d{9}$/;
    return regex.test(cleaned);
  },

  /**
   * Clean and normalize Indian mobile number
   */
  cleanIndianMobile(phoneStr) {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  },

  /**
   * Validate standard email format
   */
  isValidEmail(emailStr) {
    if (!emailStr) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr.trim());
  },

  /**
   * Validate text string length
   */
  isNotEmpty(value, minLength = 1) {
    if (!value) return false;
    return value.trim().length >= minLength;
  },

  /**
   * Validate entire form data
   * Returns { isValid: boolean, errors: Record<string, string> }
   */
  validateFormData(data) {
    const errors = {};

    // 01. Full Name *
    if (!this.isNotEmpty(data.fullName, 2)) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    // 02. Mobile / WhatsApp Number *
    if (!this.isNotEmpty(data.mobileNumber)) {
      errors.mobileNumber = 'Please enter your WhatsApp number.';
    } else if (!this.isValidIndianMobile(data.mobileNumber)) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // 03. Email Address *
    if (!this.isNotEmpty(data.email)) {
      errors.email = 'Please enter your email address.';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // 04. Location / City *
    if (!this.isNotEmpty(data.location, 2)) {
      errors.location = 'Please enter your city / location.';
    }

    // 05. Photo Studio Name is optional, no validation required

    // 06. Photography Experience *
    if (!this.isNotEmpty(data.photographyExp)) {
      errors.photographyExp = 'Please select your photography experience level.';
    }

    // 07. Your Role *
    if (!this.isNotEmpty(data.role)) {
      errors.role = 'Please select your role.';
    }

    // 08. Photoshop Experience *
    if (!this.isNotEmpty(data.photoshopExp)) {
      errors.photoshopExp = 'Please select your Photoshop experience.';
    }

    // 09. Do you currently design wedding albums? *
    if (!this.isNotEmpty(data.designAlbums)) {
      errors.designAlbums = 'Please select whether you currently design wedding albums.';
    }

    // 10. How did you hear about this workshop? *
    if (!this.isNotEmpty(data.referralSource)) {
      errors.referralSource = 'Please tell us how you heard about this workshop.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Export to window for browser usage
window.Validation = Validation;
