const PrivacyPolicy = () => (
  <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
    <div className="container" style={{ maxWidth: '900px', lineHeight: 1.8, color: 'var(--text-dark)' }}>
      <h1 className="font-serif" style={{ fontSize: '48px', fontWeight: 400, marginBottom: '12px', color: 'var(--green-900)' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '14px' }}>Last updated: June 23, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>Our Commitment to Your Privacy</h2>
          <p>At The WellMan Co (the "Site", "we", "us", or "our"), we understand that privacy is incredibly important, especially when it comes to your health and wellness journey. We are fully committed to protecting your personal data.</p>
          <p>Unlike many online retailers, we do not use your personal information for marketing campaigns, tracking ads, or promotional newsletters, nor do we sell or rent your data to third parties. We collect and use your data strictly to fulfill your orders, process payments, and provide customer support.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>1. Information We Collect</h2>
          <p>To safely and accurately deliver your products, we collect the following information when you interact with our Site:</p>
          <div style={{ marginLeft: '20px' }}>
            <p><strong>Order Information:</strong> Your name, billing address, shipping address, email address, phone number, and payment details (such as credit card numbers or account details via our secure payment processors).</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Purpose: Fulfilling your order, processing transactions, and sending order/shipping updates.</p>
            <p style={{ marginTop: '16px' }}><strong>Customer Support Information:</strong> Any details you voluntarily provide when you reach out to us with questions about our products or shipments.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Purpose: Providing dedicated customer service and resolving issues.</p>
            <p style={{ marginTop: '16px' }}><strong>Essential Technical Data:</strong> Basic technical data like your IP address and device type, which is automatically collected by our hosting platform solely to ensure our website loads properly and stays secure against fraud.</p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>2. Strict Limits on How We Use Your Information</h2>
          <p>We use your personal information only for the following operational purposes:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Processing your payment and routing funds securely.</li>
            <li>Packaging and shipping your order to your delivery address.</li>
            <li>Communicating with you regarding your specific order status or customer support inquiries.</li>
          </ul>
          <p style={{ marginTop: '16px' }}><strong>Our Marketing Commitment:</strong> We do not track your browsing habits across the web to serve you retargeting ads, we do not build marketing profiles on you, and we will never spam your inbox with promotional offers. Any email you receive from us will be strictly transactional (e.g., your order confirmation or a response from our support team).</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>3. Sharing Your Information with Trusted Service Providers</h2>
          <p>We only share your information with essential third-party service providers who are strictly required to help us operate our business and get your products to your door. These include:</p>
          <div style={{ marginLeft: '20px' }}>
            <p><strong>Payment Processors:</strong> We use a third-party partner to process your payments securely. We do not store your raw credit card numbers on our own servers.</p>
            <p style={{ marginTop: '12px' }}><strong>Shipping & Fulfillment:</strong> We share your name and address with courier services so they can deliver your package.</p>
          </div>
          <p style={{ marginTop: '16px' }}>We ensure these partners only use your data to perform their specific operational tasks and are bound by strict confidentiality rules. We will also disclose your information if required to do so by law or to protect against fraud.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>4. Cookies</h2>
          <p>Our website uses essential and functional cookies to remember what items are in your shopping cart and to keep our site secure. Because we do not run behavioral advertising campaigns, we do not use tracking or advertising cookies to follow you around the internet.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>5. Data Retention</h2>
          <p>When you place an order for our products, we retain your order information for accounting records (such as tax compliance). If you wish to request that your data be deleted earlier, please contact us using the information below.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>6. Your Rights</h2>
          <p>Depending on where you live, you may have specific rights regarding your personal data, including the right to view the data we have on file, request corrections, or ask for its deletion. Because we limit our data usage strictly to what is required to serve you, exercising these rights is simple and straightforward.</p>
        </section>

        <section style={{ background: 'var(--beige-100)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--green-700)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, your data, or your order, please reach out to our support team:</p>
          <p style={{ marginTop: '12px' }}>
            <strong>The WellMan Co Support</strong><br />
            Email: <a href="mailto:Customersupport@thewellmanco.com" style={{ color: 'var(--green-700)', textDecoration: 'none' }}>Customersupport@thewellmanco.com</a>
          </p>
        </section>

      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
