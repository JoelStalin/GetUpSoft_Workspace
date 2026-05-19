import React, { useState, useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section } from "../components/ui/Layout";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";

export const ContactPage: React.FC = () => {
  const context = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    // Simulate form submission (would be replaced with actual API call)
    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
      setFormData({ name: "", email: "", company: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
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
            {submitted && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <p className="text-success font-medium">
                  {contactContent.form.success}
                </p>
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
                isLoading={isLoading}
                disabled={isLoading}
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
