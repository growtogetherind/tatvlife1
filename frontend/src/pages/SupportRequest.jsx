import { useState } from 'react';
import { CheckCircle, FileUp, LifeBuoy, Send } from 'lucide-react';

const supportCategories = [
  'Shipping',
  'Product Complaint / Query',
  'Payment',
  'Other',
];

const SupportRequest = () => {
  const [submitted, setSubmitted] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setAttachmentName('');
    event.currentTarget.reset();
  };

  return (
    <div className="support-page">
      <section className="support-hero">
        <div className="container support-hero-inner">
          <div className="support-hero-icon">
            <LifeBuoy size={26} />
          </div>
          <span className="contact-kicker">Support Request</span>
          <h1 className="font-serif">Tell us what needs attention.</h1>
          <p>
            Submit a dedicated request for shipping, product, payment, or order support. Include your order number when available so we can resolve it faster.
          </p>
        </div>
      </section>

      <section className="support-main">
        <div className="container">
          <form className="support-form card-elevated" onSubmit={handleSubmit}>
            {submitted && (
              <div className="alert alert-success" role="status">
                <CheckCircle size={16} />
                <span>Your support request has been submitted successfully. Our team will contact you shortly.</span>
              </div>
            )}

            <div className="form-grid">
              <div>
                <label className="label" htmlFor="support-full-name">Full Name</label>
                <input id="support-full-name" className="input" name="fullName" type="text" autoComplete="name" required />
              </div>
              <div>
                <label className="label" htmlFor="support-email">Email</label>
                <input id="support-email" className="input" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <label className="label" htmlFor="support-order-number">Order Number</label>
                <input id="support-order-number" className="input" name="orderNumber" type="text" />
              </div>
              <div>
                <label className="label" htmlFor="support-category">Category</label>
                <select id="support-category" className="select" name="category" required defaultValue="">
                  <option value="" disabled>Select a category</option>
                  {supportCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-grid-full">
                <label className="label" htmlFor="support-subject">Subject</label>
                <input id="support-subject" className="input" name="subject" type="text" required />
              </div>
              <div className="form-grid-full">
                <label className="label" htmlFor="support-description">Description</label>
                <textarea id="support-description" className="input contact-textarea" name="description" rows="7" required />
              </div>
              <div className="form-grid-full">
                <label className="support-upload" htmlFor="support-attachment">
                  <input
                    id="support-attachment"
                    name="attachment"
                    type="file"
                    onChange={event => setAttachmentName(event.target.files?.[0]?.name || '')}
                  />
                  <FileUp size={20} />
                  <span>{attachmentName || 'Upload an attachment'}</span>
                  <small>Images, PDFs, or supporting documents</small>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <Send size={15} />
              Submit Request
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SupportRequest;
