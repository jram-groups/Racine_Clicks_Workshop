/**
 * Payment Integration & Gateway Handler (Cashfree Ready)
 * 
 * Secure Frontend Architecture:
 * 1. Collects participant registration data
 * 2. In production, calls merchant backend to create a secure Cashfree Order & obtain payment session ID.
 * 3. Never exposes Cashfree client_secret or private keys on frontend.
 * 4. Supports simulation mode for end-to-end testing of success and failure flows.
 */

const PaymentGateway = {
  config: {
    workshopFee: 249,
    workshopName: 'Online Album Design Workshop',
    organizer: 'Racine Clicks',
    // In production, point to your backend API endpoint:
    orderCreationEndpoint: '/api/create-cashfree-order',
    // Cashfree environment mode: 'sandbox' or 'production'
    mode: 'sandbox'
  },

  /**
   * Generate a readable registration ID: RC-WAW-XXXXX
   */
  generateRegistrationId() {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RC-WAW-${timestamp}${random}`;
  },

  /**
   * Generate a mock Cashfree payment transaction reference
   */
  generatePaymentId() {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `CF_PAY_${Date.now()}_${randomHex}`;
  },

  /**
   * Process Payment
   * @param {Object} participant - Participant form details
   * @param {Object} options - Optional overrides (e.g. simulate failure)
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(participant, options = {}) {
    const fee = this.config.workshopFee;
    const registrationId = this.generateRegistrationId();

    // Check if Cashfree SDK is loaded and a real order backend is configured
    const isLiveCashfreeConfigured = typeof window.Cashfree !== 'undefined' && 
      this.config.orderCreationEndpoint && 
      !this.config.orderCreationEndpoint.startsWith('/api/'); // Replace with real server url when deployed

    if (isLiveCashfreeConfigured) {
      return this.initiateRealCashfreeCheckout(participant, fee, registrationId);
    } else {
      // Clean, seamless simulation mode with realistic network delay
      return this.simulateCashfreeCheckout(participant, fee, registrationId, options);
    }
  },

  /**
   * Real Cashfree Web SDK Checkout flow
   */
  async initiateRealCashfreeCheckout(participant, amount, registrationId) {
    try {
      // Step 1: Call backend server to create order
      const response = await fetch(this.config.orderCreationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          customer_id: participant.mobileNumber,
          customer_name: participant.fullName,
          customer_email: participant.email,
          customer_phone: participant.mobileNumber,
          registration_id: registrationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session with server');
      }

      const orderData = await response.json();
      const paymentSessionId = orderData.payment_session_id;

      // Step 2: Initialize Cashfree SDK Drop-in / Modal
      const cashfree = window.Cashfree({
        mode: this.config.mode
      });

      return new Promise((resolve, reject) => {
        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: '_modal'
        }).then((result) => {
          if (result.error) {
            reject(new Error(result.error.message || 'Payment was cancelled or failed.'));
          }
          if (result.paymentDetails) {
            resolve({
              status: 'SUCCESS',
              paymentId: result.paymentDetails.paymentId || this.generatePaymentId(),
              registrationId: registrationId,
              amount: amount,
              paidAt: new Date().toISOString()
            });
          }
        });
      });
    } catch (err) {
      throw err;
    }
  },

  /**
   * Simulation flow for instant local testing and demonstration
   */
  simulateCashfreeCheckout(participant, amount, registrationId, options) {
    return new Promise((resolve, reject) => {
      // 1.2s realistic gateway response latency
      setTimeout(() => {
        if (options.forceFail) {
          reject(new Error('Transaction was cancelled or declined by your bank. Please try again.'));
        } else {
          resolve({
            status: 'SUCCESS',
            paymentId: this.generatePaymentId(),
            registrationId: registrationId,
            amount: amount,
            paidAt: new Date().toISOString()
          });
        }
      }, 1200);
    });
  }
};

window.PaymentGateway = PaymentGateway;
