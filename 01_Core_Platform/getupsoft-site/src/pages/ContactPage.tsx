import React, { useState, useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section } from "../components/ui/Layout";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";
import { useERPSubmission } from "../hooks/useERPSubmission";
import { ContactFormData } from "../lib/erp/types";

export const ContactPage: React.FC = () => {
  const context = useContext(LanguageContext);
  const { state: submission, submitContact, reset } = useERPSubmission();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;
  const contactContent = content.contact;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contactData: ContactFormData = {
      ...formData,
      language: currentLanguage,
      submittedAt: new Date().toISOString(),
    };

    await submitContact(contactData);

    // Reset form on success
    if (submission.success) {
      setTimeout(() => {
        setFormData({ name: "", email: "", company: "", message: "" });
        reset();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header language={currentLanguage} onLanguageChange={setLanguage} />

      {/* Hero Section */}
      <Section variant="default" padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-h1 text-text font-bold mb-4">
              {contactContent.heading}
            </h1>
            <p className="text-body-lg text-text-muted">
              {contactContent.subheading}
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section variant="soft" padding="lg">
        <Container>
          <div className="max-w-xl mx-auto">
            {submission.success && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <p className="text-success font-medium">
                  {contactContent.form.success}
                  {submission.ticketId && ` (${submission.ticketId})`}
                </p>
              </div>
            )}

            {submission.error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg">
                <p className="text-danger font-medium">{submission.error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-surface border border-border rounded-lg p-8 space-y-6"
            >
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-text mb-2"
                >
                  {contactContent.form.name}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                  placeholder={contactContent.form.name}
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-text mb-2"
                >
                  {contactContent.form.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                  placeholder={contactContent.form.email}
                />
              </div>

              {/* Company Field */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-text mb-2"
                >
                  {contactContent.form.company}
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                  placeholder={contactContent.form.company}
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-text mb-2"
                >
                  {contactContent.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all resize-none"
                  placeholder={contactContent.form.message}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                variant="primary"
                isLoading={submission.isLoading}
                disabled={submission.isLoading}
                className="w-full"
              >
                {contactContent.form.submit}
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};
