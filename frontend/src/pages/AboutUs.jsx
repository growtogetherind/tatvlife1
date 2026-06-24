import { Mail, Zap } from 'lucide-react';

const AboutUs = () => (
  <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '0' }}>
    {/* Hero Section */}
    <div style={{ background: 'var(--green-900)', color: 'white', padding: '80px 0' }}>
      <div className="container">
        <div style={{ maxWidth: '800px' }}>
          <h1 className="font-serif" style={{ fontSize: '48px', fontWeight: 500, marginBottom: '20px', lineHeight: 1.2 }}>
            Elevating Men&rsquo;s Potential, From the Inside Out
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
            Welcome to &lsquo;The WellMan Co&rsquo;. We&rsquo;re the ultimate destination for guys who refuse to settle for "average."
          </p>
        </div>
      </div>
    </div>

    <div style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Introduction */}
        <div style={{ marginBottom: '60px' }}>
          <p style={{ fontSize: '16px', color: 'var(--text-dark)', lineHeight: 1.8, marginBottom: '16px' }}>
            Let's be real: generic multivitamins and overhyped wellness trends don't cut it for optimizing peak male performance. Designed to deliver science based solutions, we give you direct access to premium, pharma-grade products engineered to upgrade your aesthetics, vitality, and confidence.
          </p>
          <p style={{ fontSize: '16px', color: 'var(--text-dark)', lineHeight: 1.8 }}>
            Whether you want to lock down your hair routine, clear up your skin, maximize your gym gains, or take your sexual health to the next level, we&rsquo;re here to help you Looksmax and Vitality-max with zero compromises.
          </p>
        </div>

        {/* What We Focus On */}
        <div style={{ marginBottom: '80px' }}>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '32px', color: 'var(--green-900)' }}>
            What We Focus On
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            We focus on high-impact, science-backed medications and treatments targeting the four pillars of modern male excellence:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Sexual Health & Vitality', desc: 'Reclaim ultimate confidence and performance with proven treatments designed to optimize your stamina and drive.' },
              { title: 'Hair Restoration', desc: 'Stop thinning in its tracks and regrow what\'s yours. From advanced topicals to oral treatments, we keep your hairline exactly where it belongs.' },
              { title: 'Advanced Skincare', desc: 'Clear, sharp skin isn\'t just for models. Our targeted treatments fight aging, acne, and fatigue to give you that clean, high-contrast look.' },
              { title: 'Muscle & Physical Optimization', desc: 'Support your training, speed up recovery, and optimize your hormonal health to unlock your true genetic potential.' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '24px', border: '1px solid var(--beige-200)', borderRadius: '14px', background: 'var(--white)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--green-900)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The Vault Policy */}
        <div style={{ marginBottom: '80px', padding: '40px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--beige-100)' }}>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '12px', color: 'var(--green-900)' }}>
            The Vault Policy: 100% Discrete, 0% Spam
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.7 }}>
            Taking control of your health and appearance requires trust. We believe that what you buy, why you buy it, and who you are is nobody&rsquo;s business but your own. We protect your privacy like an asset.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--green-900)' }}>
            🔒 Our Triple-Lock Privacy Guarantee
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Discrete Processing & Billing', desc: 'Your orders are processed securely and privately. Your bank statement won\'t broadcast your personal routines to the world.' },
              { title: 'Stealth Shipping', desc: 'Every order arrives at your doorstep in completely plain, unbranded packaging. No logos, no product descriptions, and zero awkward conversations with roommates or delivery drivers.' },
              { title: 'Zero Marketing Spam', desc: 'We hate spam as much as you do. We never sell, rent, or use your data for aggressive marketing campaigns. Your personal and medical information is strictly used to fulfill your order and provide customer support. Period.' }
            ].map((item, i) => (
              <div key={i} style={{ paddingLeft: '20px', borderLeft: '3px solid var(--green-600)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why The WellMan Co */}
        <div style={{ marginBottom: '80px' }}>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '32px', color: 'var(--green-900)' }}>
            Why The WellMan Co.?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Real Meds, Real Results', desc: 'No filler, no hype. We offer actual medications and highly effective formulations prescribed by licensed healthcare professionals.' },
              { title: '100% Digital', desc: 'Skip the awkward doctor\'s visits and pharmacy lines. Get evaluated online, consult with a provider, and manage everything right from your phone.' },
              { title: 'Built for the Modern Man', desc: 'We get it. Wanting to look better, feel stronger, and perform at your highest level isn\'t vanity—it\'s strategy.' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '24px', border: '1px solid var(--beige-200)', borderRadius: '14px', background: 'var(--white)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--green-900)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '40px', background: 'var(--green-50)', borderRadius: '16px', border: '1px solid var(--green-200)', textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="font-serif" style={{ fontSize: '28px', fontWeight: 500, marginBottom: '16px', color: 'var(--green-900)' }}>
            Stop Leaving Your Potential to Chance
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '24px', lineHeight: 1.7 }}>
            Your appearance, energy, and drive are your highest-value assets. Don't let genetics or stress dictate your baseline. It's time to take control of your biology, optimize your routine, and unlock the absolute best version of yourself—securely and privately.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/shop" className="btn-primary" style={{ textDecoration: 'none' }}>
              Upgrade Your Routine
            </a>
            <a href="/dashboard" className="btn-outline" style={{ textDecoration: 'none' }}>
              Maximize Your Vitality
            </a>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div style={{ padding: '40px', background: '#FEF2F2', borderRadius: '14px', border: '1px solid #FED2D2', marginBottom: '80px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚠️ Mandatory Medical & Health Disclaimer
          </h3>
          <p style={{ fontSize: '12.5px', color: '#991B1B', lineHeight: 1.7, margin: 0 }}>
            THE CONTENT, PRODUCTS, AND STATEMENTS FOUND ON THIS SITE HAVE NOT BEEN EVALUATED BY THE FOOD AND DRUG ADMINISTRATION (FDA) OR ANY OTHER REGULATORY AUTHORITY. THE INFORMATION PROVIDED ON THIS SITE, INCLUDING ALL PRODUCT DETAILS, LABELS, INGREDIENT LISTS, AND BLOG POSTS, IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE MEDICAL ADVICE. YOU SHOULD ALWAYS CONSULT A QUALIFIED HEALTHCARE PROFESSIONALS BEFORE STARTING ANY NEW MEDICAL TREATMENT, ESPECIALLY IF YOU HAVE PRE-EXISTING MEDICAL CONDITIONS, TAKE PRESCRIPTION MEDICATIONS, OR ARE EXPERIENCING UNEXPLAINED SYMPTOMS.
          </p>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginBottom: '80px' }}>
          <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 500, marginBottom: '32px', color: 'var(--green-900)' }}>
            Terms and Conditions
          </h2>

          {[
            {
              num: '1',
              title: 'Introduction & Binding Agreement',
              content: 'Welcome to TheWellManco.com. This website is operated by The WellMan co. Throughout the site, the terms "we", "us", and "our" refer to The WellMan co online store. We offer this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here. By visiting our site and/or purchasing products from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms, conditions, and policies referenced herein or available by hyperlink. These Terms apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.\n\nPlease read these Terms carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.'
            },
            {
              num: '2',
              title: 'Eligibility & Account Responsibility',
              content: 'By agreeing to these Terms, you represent that you are at least the age of majority in your state, province, or country of residence. Our products are formulated and intended strictly for adults.\n\nYou may be required to register an account to execute purchases. You agree to provide accurate, current, and complete purchase and account information for all transactions made at our store. You are entirely responsible for maintaining the confidentiality of your account credentials and password. We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.'
            },
            {
              num: '3',
              title: 'Product Information Accuracy & Intended Use',
              content: 'We attempt to ensure that product descriptions, ingredients, nutritional panels, and labeling details are as accurate and up-to-date as possible. However, we do not warrant that product descriptions or other content on the website are entirely accurate, complete, reliable, or error-free. The visual appearance of product packaging may vary from the images displayed on the website. You must always read the actual printed labels, warnings, warnings against misuse, and directions provided with the physical product before consumption.\n\nIndividual Results May Vary: Every individual body possesses unique biochemistry, metabolic rates, health histories, and lifestyle patterns. Consequently, individual results from using our products may vary significantly. The WellMan Co. does not guarantee specific performance outcomes, strength increases, physiological optimization, or anatomical transformations.'
            },
            {
              num: '4',
              title: 'Modifications to Prices and Services',
              content: 'Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or product content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the products or service.'
            },
            {
              num: '5',
              title: 'Order Fulfillment, Payments, and Billing Accuracy',
              content: 'We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. As detailed in our Privacy Policy, your customer details are explicitly restricted to transaction verification, order fulfillment, security screening, and direct support. No payment data or order history will be cataloged for behavioral advertising or third-party marketing brokers. In the event that we make a change to or cancel an order, we will attempt to notify you by contacting the email and/ or billing address/phone number provided at the time the order was made.'
            },
            {
              num: '6',
              title: 'Shipping, Custom Restrictions, and Delivery Liability',
              content: 'All products purchased from the Site are made pursuant to a shipment contract. This means that the risk of loss and title for such items pass to you upon our delivery to the third-party carrier.\n\nIt is your responsibility to verify that the products ordered comply with all local, state, provincial, and national regulations or border control laws applicable to your shipping destination. We are not responsible for shipments seized, delayed, opened, or destroyed by domestic or international customs enforcement agencies.'
            },
            {
              num: '7',
              title: 'Limitation of Liability & Indemnification',
              content: 'In no case shall The WellMan Co., our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation, lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility.\n\nIndemnification Clause: You agree to indemnify, defend, and hold harmless The WellMan Co. and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees, harmless from any claim or demand, including reasonable attorneys\' fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.'
            },
            {
              num: '8',
              title: 'Severability & Termination',
              content: 'In the event that any provision of these Terms of Service is determined to be unlawful, void, or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions. The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes. These Terms of Service are effective unless and until terminated by either you or us.\n\nYou may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our site.'
            },
            {
              num: '9',
              title: 'Contact Information',
              content: 'Questions about the Terms and Conditions should be sent to us via our primary contact options:'
            }
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--green-900)' }}>
                {section.num}. {section.title}
              </h3>
              {section.num === '9' ? (
                <div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-dark)', lineHeight: 1.7, marginBottom: '12px' }}>
                    {section.content}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--text-dark)' }}>
                      <Mail size={16} color="var(--green-700)" />
                      <a href="mailto:Customersupport@thewellmanco.com" style={{ color: 'var(--green-700)', textDecoration: 'none', fontWeight: 600 }}>
                        Customersupport@thewellmanco.com
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13.5px', color: 'var(--text-dark)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {section.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AboutUs;
