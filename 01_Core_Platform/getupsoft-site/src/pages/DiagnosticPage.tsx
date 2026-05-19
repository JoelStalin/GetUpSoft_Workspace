import React, { useState, useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section } from "../components/ui/Layout";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";
import { useERPSubmission } from "../hooks/useERPSubmission";
import { DiagnosticFormData } from "../lib/erp/types";

export const DiagnosticPage: React.FC = () => {
  const context = useContext(LanguageContext);
  const { state: submission, submitDiagnostic, reset } = useERPSubmission();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    employees: "",
    currentSystems: [] as string[],
    mainPain: "",
    timeline: "3-6-months" as const,
    budget: "20k-50k" as const,
    message: "",
  });

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;

  const industries = [
    "Retail & E-Commerce",
    "Restaurants & Gastronomy",
    "Distribution & Logistics",
    "Professional Services",
    "Manufacturing",
    "Healthcare",
    "Other",
  ];

  const systemOptions = [
    "ERP (SAP, Oracle, Odoo)",
    "CRM (Salesforce, HubSpot)",
    "Accounting Software",
    "Inventory Management",
    "E-commerce Platform",
    "Custom Legacy System",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (system: string) => {
    setFormData((prev) => ({
      ...prev,
      currentSystems: prev.currentSystems.includes(system)
        ? prev.currentSystems.filter((s) => s !== system)
        : [...prev.currentSystems, system],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const diagnosticData: DiagnosticFormData = {
      ...formData,
      timeline: formData.timeline as any,
      budget: formData.budget as any,
      language: currentLanguage,
      submittedAt: new Date().toISOString(),
    };

    await submitDiagnostic(diagnosticData);

    // Reset form on success
    if (submission.success) {
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          company: "",
          industry: "",
          employees: "",
          currentSystems: [],
          mainPain: "",
          timeline: "3-6-months",
          budget: "20k-50k",
          message: "",
        });
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
              {currentLanguage === "es"
                ? "Diagnóstico Empresarial"
                : "Business Diagnostic"}
            </h1>
            <p className="text-body-lg text-text-muted">
              {currentLanguage === "es"
                ? "Cuéntanos sobre tu negocio para una evaluación personalizada."
                : "Tell us about your business for a personalized assessment."}
            </p>
          </div>
        </Container>
      </Section>

      {/* Diagnostic Form Section */}
      <Section variant="soft" padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto">
            {submission.success && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg">
                <p className="text-success font-medium">
                  {currentLanguage === "es"
                    ? `¡Diagnóstico enviado! Tu ticket: ${submission.ticketId}`
                    : `Diagnostic submitted! Your ticket: ${submission.ticketId}`}
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
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">
                  {currentLanguage === "es"
                    ? "Información de Contacto"
                    : "Contact Information"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es" ? "Nombre" : "Name"}
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es" ? "Email" : "Email"}
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es" ? "Empresa" : "Company"}
                    </label>
                    <input
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">
                  {currentLanguage === "es"
                    ? "Información de Negocio"
                    : "Business Information"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es" ? "Industria" : "Industry"}
                    </label>
                    <select
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                    >
                      <option value="">
                        {currentLanguage === "es"
                          ? "Selecciona una industria"
                          : "Select an industry"}
                      </option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es"
                        ? "Número de Empleados"
                        : "Number of Employees"}
                    </label>
                    <select
                      name="employees"
                      required
                      value={formData.employees}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                    >
                      <option value="">
                        {currentLanguage === "es"
                          ? "Selecciona rango"
                          : "Select range"}
                      </option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es"
                        ? "Sistemas Actuales"
                        : "Current Systems"}
                    </label>
                    <div className="space-y-2">
                      {systemOptions.map((system) => (
                        <label
                          key={system}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.currentSystems.includes(system)}
                            onChange={() => handleSystemChange(system)}
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm text-text-muted">
                            {system}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge & Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">
                  {currentLanguage === "es"
                    ? "Desafíos & Plazo"
                    : "Challenges & Timeline"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {currentLanguage === "es"
                        ? "Principal Dolor de Negocio"
                        : "Main Business Pain Point"}
                    </label>
                    <textarea
                      name="mainPain"
                      required
                      rows={3}
                      value={formData.mainPain}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        {currentLanguage === "es" ? "Plazo" : "Timeline"}
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                      >
                        <option value="immediate">
                          {currentLanguage === "es" ? "Inmediato" : "Immediate"}
                        </option>
                        <option value="1-3-months">
                          {currentLanguage === "es"
                            ? "1-3 Meses"
                            : "1-3 Months"}
                        </option>
                        <option value="3-6-months">
                          {currentLanguage === "es"
                            ? "3-6 Meses"
                            : "3-6 Months"}
                        </option>
                        <option value="6-12-months">
                          {currentLanguage === "es"
                            ? "6-12 Meses"
                            : "6-12 Months"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        {currentLanguage === "es" ? "Presupuesto" : "Budget"}
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all"
                      >
                        <option value="under-5k">
                          {currentLanguage === "es" ? "Menor a $5k" : "Under $5k"}
                        </option>
                        <option value="5k-20k">$5k - $20k</option>
                        <option value="20k-50k">$20k - $50k</option>
                        <option value="50k-100k">$50k - $100k</option>
                        <option value="100k+">$100k+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {currentLanguage === "es" ? "Mensaje Adicional" : "Additional Message"}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text placeholder-text-muted focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all resize-none"
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
                {currentLanguage === "es"
                  ? "Enviar Diagnóstico"
                  : "Submit Diagnostic"}
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};
