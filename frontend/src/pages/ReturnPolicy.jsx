const ReturnPolicy = () => (
  <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
    <div className="container" style={{ maxWidth: '900px', lineHeight: 1.8, color: 'var(--text-dark)' }}>
      <h1 className="font-serif" style={{ fontSize: '48px', fontWeight: 400, marginBottom: '12px', color: 'var(--green-900)' }}>Return & Refund Policy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '14px' }}>Last updated: June 23, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <section>
          <p style={{ fontSize: '15px', color: 'var(--text-dark)' }}>Thank you for shopping at The WellMan Co store. Because our products are intended for personal consumption, we maintain a strict no-returns and no-refunds policy to ensure the health, safety, and sanitary integrity of our inventory.</p>
          <p>Please read this policy carefully before completing your purchase.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>1. No Returns & No Refunds</h2>
          <p>All sales are final. Once an order has been processed and shipped from our facility, we cannot accept returns of the physical product, nor can we issue financial refunds to your original payment method. We encourage you to carefully review your cart, ingredient profiles, and shipping details before finalized payments.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>2. Exceptions: Case-by-Case Replacements</h2>
          <p>While we do not offer refunds or accept returns, your satisfaction and wellness journey are important to us. We understand that issues can occasionally happen during transit or fulfillment.</p>
          <p>We review requests for product replacements on a strict, case-by-case basis. You may be eligible for a replacement product if:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>The product arrived physically damaged or broken during transit.</li>
            <li>You received the incorrect item or formulation due to a fulfillment error on our part.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>3. How to Request a Replacement</h2>
          <p>To submit a request for an evaluation, you must contact our customer support team within 7 days of delivery. Please follow these steps:</p>
          <ol style={{ marginLeft: '20px' }}>
            <li>Email our support team at <a href="mailto:Customersupport@thewellmanco.com" style={{ color: 'var(--green-700)', textDecoration: 'none' }}>Customersupport@thewellmanco.com</a></li>
            <li>Include your Order Number and the full name associated with the account.</li>
            <li>Provide a brief explanation of the issue.</li>
            <li><strong>Mandatory:</strong> Attach clear, high-resolution photographic evidence of the damaged product, broken seal, or incorrect item.</li>
          </ol>
          <p style={{ marginTop: '16px', fontStyle: 'italic', color: 'var(--text-muted)' }}>Requests submitted without photographic evidence cannot be evaluated.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>4. Shipping Fees for Replacements</h2>
          <p>If your replacement request is approved, please note that an additional shipping and handling fee may be applicable to dispatch the new product to your address, depending on the nature of the claim. Our support team will notify you of any applicable shipping charges before your replacement order is finalized and dispatched.</p>
        </section>

        <section style={{ background: 'var(--beige-100)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--green-700)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>Contact Us</h2>
          <p>If you have any questions or need to submit a claim regarding a damaged shipment, please contact our support team directly:</p>
          <p style={{ marginTop: '12px' }}>
            <strong>The WellMan Co Support</strong><br />
            Email: <a href="mailto:Customersupport@thewellmanco.com" style={{ color: 'var(--green-700)', textDecoration: 'none' }}>Customersupport@thewellmanco.com</a><br />
            Response Time: Please allow 2-3 business days for our team to review your request.
          </p>
        </section>

      </div>
    </div>
  </div>
);

export default ReturnPolicy;
