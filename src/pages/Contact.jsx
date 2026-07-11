import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <div className="page-header container">
        <span className="eyebrow">Get in touch</span>
        <h1>Contact</h1>
        <p>Tips, corrections, or partnership enquiries — send them our way.</p>
      </div>

      <div className="container contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" required placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" required placeholder="What's on your mind?" />
          </div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>
            {sent ? 'Message sent ✓' : 'Send message'}
          </button>
          {sent && <p className="contact-note">Thanks — we'll get back to you shortly.</p>}
        </form>

        <div className="info-card">
          <h3>Editorial desk</h3>
          <p>editorial@jamessportsofficial.com</p>
          <p style={{ marginTop: '1rem' }}>Response time: 1–2 business days.</p>
        </div>
      </div>
    </>
  )
}
