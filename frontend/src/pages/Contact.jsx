import { useState } from 'react';
import { CheckCircle, Clock, HelpCircle, Mail, MapPin, Phone, Send } from 'lucide-react';

const faqs = [
  {
    question: 'How quickly will customer support respond?',
    answer: 'Most messages receive a response within one business day. Order-specific requests are prioritized by urgency.',
  },
  {
    question: 'Can I ask product questions before ordering?',
    answer: 'Yes. Share the product name and your question in the contact form so the support team can route it correctly.',
  },
  {
    question: 'Where can I get help with an existing order?',
    answer: 'Use the Support Request page for shipping, payment, product, or order-specific issues.',
  },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container contact-hero-grid">
          <div>
            <span className="contact-kicker">Contact</span>
            <h1 className="font-serif">Speak with The WellMan Co support team.</h1>
            <p>
              Get help with orders, product questions, billing, or private delivery. Our team keeps every conversation discreet and practical.
            </p>
          </div>

          <div className="contact-info-card">
            <div>
              <Mail size={18} />
              <a href="mailto:Customersupport@thewellmanco.com">Customersupport@thewellmanco.com</a>
            </div>
            <div>
              <Phone size={18} />
              <a href="tel:+15550192834">+1 (555) 019-2834</a>
            </div>
            <div>
              <Clock size={18} />
              <span>Monday to Friday, 9:00 AM to 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="container contact-main-grid">
          <form className="contact-form card-elevated" onSubmit={handleSubmit}>
            <div>
              <h2 className="font-serif">Send a Message</h2>
              <p>Tell us what you need and we will get back to you as soon as possible.</p>
            </div>

            {submitted && (
              <div className="alert alert-success" role="status">
                <CheckCircle size={16} />
                <span>Your message has been received. Our support team will follow up shortly.</span>
              </div>
            )}

            <div className="form-grid">
              <div>
                <label className="label" htmlFor="contact-name">Name</label>
                <input id="contact-name" className="input" name="name" type="text" autoComplete="name" required />
              </div>
              <div>
                <label className="label" htmlFor="contact-email">Email</label>
                <input id="contact-email" className="input" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="form-grid-full">
                <label className="label" htmlFor="contact-phone">Phone Number</label>
                <input id="contact-phone" className="input" name="phone" type="tel" autoComplete="tel" />
              </div>
              <div className="form-grid-full">
                <label className="label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" className="input contact-textarea" name="message" rows="6" required />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <Send size={15} />
              Send Message
            </button>
          </form>

          <aside className="contact-side">
            <div className="card-elevated contact-business-card">
              <h2 className="font-serif">Business Contact Information</h2>
              <div className="contact-detail">
                <MapPin size={18} />
                <span>Private fulfillment network serving customers across eligible regions.</span>
              </div>
              <div className="contact-detail">
                <Mail size={18} />
                <a href="mailto:Customersupport@thewellmanco.com">Customersupport@thewellmanco.com</a>
              </div>
              <div className="contact-detail">
                <Phone size={18} />
                <a href="tel:+15550192834">+1 (555) 019-2834</a>
              </div>
              <div className="contact-detail">
                <Clock size={18} />
                <span>Monday to Friday, 9:00 AM to 6:00 PM</span>
              </div>
            </div>

            <div className="contact-map-placeholder" aria-label="Google Maps placeholder">
              <MapPin size={28} />
              <span>Google Maps Placeholder</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="contact-faq" id="faqs">
        <div className="container">
          <div className="stitch-section-heading">
            <h2>Frequently Asked Questions</h2>
            <span />
          </div>
          <div className="contact-faq-grid">
            {faqs.map(item => (
              <article className="contact-faq-card" key={item.question}>
                <HelpCircle size={18} />
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
