import { CheckCircle } from 'lucide-react';

const AboutUs = () => (
  <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '80px 0' }}>
    <div className="container">
      {/* Hero */}
      <div style={{ maxWidth: '800px', margin: '0 auto 80px', textAlign: 'center' }}>
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Who We Are
        </p>
        <h1 className="font-serif" style={{ fontSize: '40px', fontWeight: 500, marginBottom: '16px', color: 'var(--green-900)' }}>
          The WellMan Co
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          A specialty care platform sourcing WHO-GMP certified lifestyle and wellness medications directly to patients under rigorous clinical supervision.
        </p>
      </div>

      {/* Mission Section */}
      <div className="card" style={{ marginBottom: '60px', maxWidth: '900px', margin: '0 auto 60px', padding: '48px' }}>
        <h2 className="font-serif" style={{ fontSize: '28px', fontWeight: 500, marginBottom: '20px', color: 'var(--green-900)' }}>
          Our Mission
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-dark)', lineHeight: 1.8, marginBottom: '16px' }}>
          We believe that access to quality, certified wellness medications should be straightforward and secure. Our mission is to bridge the gap between patients and high-quality, internationally certified treatments by eliminating intermediaries and providing direct, transparent access.
        </p>
        <p style={{ fontSize: '15px', color: 'var(--text-dark)', lineHeight: 1.8 }}>
          Every product in our catalog is sourced from WHO-GMP certified facilities and undergoes rigorous clinical review before being made available to our patients.
        </p>
      </div>

      {/* Values Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '80px', maxWidth: '1100px', margin: '0 auto 80px' }}>
        {[
          { title: 'WHO-GMP Certified', desc: 'All medications sourced from WHO Good Manufacturing Practice certified facilities.' },
          { title: 'Clinical Oversight', desc: 'Every patient order is reviewed by qualified healthcare professionals.' },
          { title: 'Direct Access', desc: 'Direct-to-patient model eliminates unnecessary intermediaries and costs.' },
          { title: 'Secure Transactions', desc: 'Multi-layered security with encrypted payments and secure data handling.' },
          { title: 'Global Logistics', desc: 'Insured DHL Express delivery to 180+ countries with real-time tracking.' },
          { title: 'Patient Privacy', desc: 'Strict confidentiality policies protecting patient data and medical history.' }
        ].map((value, i) => (
          <div key={i} style={{
            padding: '32px',
            border: '1px solid var(--beige-200)',
            borderRadius: '16px',
            background: 'var(--white)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CheckCircle size={20} color="var(--green-600)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--green-900)' }}>
                {value.title}
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {value.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Trust Section */}
      <div style={{ background: 'var(--white)', padding: '48px', borderRadius: '20px', marginBottom: '80px', maxWidth: '900px', margin: '0 auto 80px', border: '1px solid var(--beige-100)' }}>
        <h2 className="font-serif" style={{ fontSize: '28px', fontWeight: 500, marginBottom: '32px', color: 'var(--green-900)', textAlign: 'center' }}>
          Why Trust The WellMan Co
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {[
            { icon: '✓', label: 'WHO-GMP Compliance', value: '100%' },
            { icon: '🛡️', label: 'Clinical Review', value: 'Every Order' },
            { icon: '🌍', label: 'Global Reach', value: '180+ Countries' },
            { icon: '🔒', label: 'Data Security', value: 'Enterprise-Grade' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
          Ready to take control of your wellness journey with complete transparency and clinical oversight?
        </p>
        <a href="/shop" className="btn-primary" style={{ display: 'inline-flex', gap: '8px', textDecoration: 'none' }}>
          Browse Our Treatments
        </a>
      </div>
    </div>
  </div>
);

export default AboutUs;
