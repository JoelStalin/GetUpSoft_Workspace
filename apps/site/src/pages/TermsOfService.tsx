import { Link } from "react-router-dom";
import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";

export function TermsOfService() {
  return (
    <div className="bg-background">
      {/* Header */}
      <Section className="!py-20 lg:!py-32 border-b border-border">
        <Container>
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest mb-12 hover:text-text transition-colors">
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="max-w-3xl">
            <Eyebrow>Governance</Eyebrow>
            <h1 className="text-5xl sm:text-6xl font-bold text-text mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-textMuted font-medium">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section background="surface">
        <Container>
          <div className="max-w-3xl mx-auto space-y-16">
            {/* 1. Agreement to Terms */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">1. Agreement to Terms</h2>
              <p className="text-lg text-textMuted leading-relaxed">
                By accessing and using the GetUpSoft platform, website, and services ("Services"), you agree to be bound
                by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            {/* 2. Acceptable Use */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-text">2. Acceptable Use Policy</h2>
              <p className="text-lg text-textMuted leading-relaxed">You agree not to use the Services for:</p>
              <ul className="grid gap-3 text-textMuted font-medium">
                {["Illegal purposes or regulatory violations", "Harassment or unauthorized system access", "Transmission of harmful code", "Intellectual property infringement", "Reverse engineering source code"].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 12. Contact Information */}
            <div className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl">
              <h2 className="text-2xl font-bold text-text mb-6">12. Contact Us</h2>
              <p className="text-textMuted leading-relaxed mb-8">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-4">
                <p className="font-bold text-text uppercase tracking-widest text-xs">GetUpSoft Legal Team</p>
                <div className="grid gap-2 text-primary font-bold">
                  <a href="mailto:legal@getupsoft.com">legal@getupsoft.com</a>
                  <p className="text-textMuted font-medium">Santo Domingo, Dominican Republic</p>
                </div>
              </div>
            </div>

            {/* Acceptance */}
            <div className="bg-primarySoft/30 rounded-3xl p-8 border border-primarySoft">
              <p className="text-text font-bold leading-relaxed">
                By accessing and using GetUpSoft, you acknowledge that you have read, understood, and agree to
                be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
