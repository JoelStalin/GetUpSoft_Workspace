import { Link } from "react-router-dom";
import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";

export function PrivacyPolicy() {
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
            <Eyebrow>Legal</Eyebrow>
            <h1 className="text-5xl sm:text-6xl font-bold text-text mb-6">
              Privacy Policy
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
            {/* 1. Introduction */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">1. Introduction</h2>
              <p className="text-lg text-textMuted leading-relaxed">
                GetUpSoft ("Company," "we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you visit our website, use our services,
                and interact with our platform.
              </p>
              <p className="text-lg text-textMuted leading-relaxed">
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices,
                please do not use our services.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-text">2. Information We Collect</h2>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-text">2.1 Information You Provide Directly</h3>
                <ul className="grid gap-3 text-textMuted font-medium">
                  {["Account registration information", "Billing and payment data", "Communication preferences", "Content uploaded to the platform", "Support requests"].map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-text">2.2 Information Collected Automatically</h3>
                <p className="text-lg text-textMuted leading-relaxed">
                  We use cookies, log files, and IP tracking to understand platform usage and improve the digital experience.
                </p>
              </div>
            </div>

            {/* 10. Contact Us */}
            <div className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl">
              <h2 className="text-2xl font-bold text-text mb-6">10. Contact Us</h2>
              <p className="text-textMuted leading-relaxed mb-8">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="space-y-4">
                <p className="font-bold text-text uppercase tracking-widest text-xs">GetUpSoft Privacy Team</p>
                <div className="grid gap-2 text-primary font-bold">
                  <a href="mailto:privacy@getupsoft.com">privacy@getupsoft.com</a>
                  <p className="text-textMuted font-medium">Santo Domingo, Dominican Republic</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
