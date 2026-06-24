const HealthSafetyDisclaimer = () => (
  <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
    <div className="container" style={{ maxWidth: '900px', lineHeight: 1.8, color: 'var(--text-dark)' }}>
      <h1 className="font-serif" style={{ fontSize: '48px', fontWeight: 400, marginBottom: '12px', color: 'var(--green-900)' }}>Health, Safety, & Liability Disclaimer</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '14px' }}>Last updated: June 23, 2026</p>

      <div style={{ background: 'var(--red-50)', border: '2px solid var(--red-200)', borderRadius: '8px', padding: '20px', marginBottom: '40px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--red-900)', fontWeight: 600 }}>
          ⚠️ IMPORTANT: The information, products, and content provided on this site are for informational and educational purposes only. They are not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals before using these products.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <section>
          <p style={{ fontSize: '15px', color: 'var(--text-dark)' }}>The information, products, and content provided on www.thewellmanco.com (the "Site") are for informational and educational purposes only. They are not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
          <p>By using this Site and purchasing our products, you acknowledge, understand, and explicitly agree to the following legally binding disclaimers:</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>1. No FDA Approval & Regulatory Status</h2>
          <p>Our product catalog includes products that may not be approved by the Food and Drug Administration (FDA) or any other federal or international health authority. Consequently, the statements made regarding these products have not been reviewed by any regulatory body.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>2. Complete Waiver of Liability for Adverse Events</h2>
          <p>The WellMan Co., its owners, directors, employees, and suppliers accept absolutely no responsibility or liability for any adverse events, side effects, allergic reactions, unexpected physiological complications, injuries, or negative health outcomes that may occur from the use or misuse of our products.</p>
          <p>By purchasing and consuming these products, you do so voluntarily and entirely at your own physical and financial risk. You hereby release The WellMan Co from any and all legal or civil claims arising from adverse health events connected to our product line.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>3. Sole Responsibility of the Customer to Research</h2>
          <p>Because these products are not FDA-approved, it is the sole and absolute responsibility of the customer to conduct their own independent research regarding the ingredients, potential side effects, and safety profiles of our products prior to making a purchase.</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>You are responsible for ensuring that the ingredients do not conflict with your unique health history, allergies, or pre-existing conditions.</li>
            <li>If you are currently taking any prescription medications or over-the-counter drugs, you must independently verify that our ingredients will not cause dangerous drug interactions.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>4. Mandatory Professional Medical Consultation</h2>
          <p>Nothing contained on this Site—including product descriptions, ingredient listings, customer reviews, or communications from our support team—constitutes medical advice.</p>
          <p>We strongly advise you to consult with a qualified healthcare professional or physician before starting any new treatment regimen. Never disregard professional medical advice or delay seeking it because of something you have read on this Site.</p>
          <p><strong>If you experience an adverse reaction or health emergency after consuming our products, immediately discontinue use and seek professional emergency medical attention.</strong></p>
        </section>

        <section>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>5. Individual Results May Vary</h2>
          <p>Every individual has a unique biological makeup, metabolic rate, and health history. We do not guarantee, warrant, or imply specific performance outcomes, physical transformations, or wellness changes.</p>
          <p>Any testimonials or reviews displayed on this Site reflect the anecdotal experiences of specific users and do not guarantee that you will achieve the same or similar results.</p>
        </section>

        <section style={{ background: 'var(--beige-100)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--green-700)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '16px' }}>Your Health is Your Responsibility</h2>
          <p>The WellMan Co provides products and information for educational purposes. Your use of any product or information from this site is entirely your decision and risk. We encourage you to:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Research all product ingredients thoroughly</li>
            <li>Consult with healthcare professionals before use</li>
            <li>Read all product labels and warnings carefully</li>
            <li>Stop use immediately if adverse reactions occur</li>
            <li>Seek emergency medical attention if needed</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
);

export default HealthSafetyDisclaimer;
