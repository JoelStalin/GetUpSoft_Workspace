import React, { useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section, SectionHeading } from "../components/ui/Layout";
import { Button } from "../components/ui/Button";
import { Card, ServiceCard, ProductCard, IndustryCard } from "../components/ui/Card";
import { LanguageContext } from "../contexts/LanguageContext";

export const HomePage: React.FC = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;

  // Hero section
  const hero = content.home.hero;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        region="global"
        language={currentLanguage}
        onLanguageChange={setLanguage}
      />

      {/* Hero Section */}
      <Section variant="default" padding="xl">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-h1 text-text font-bold mb-6 leading-tight">
              {hero.heading}
            </h1>
            <p className="text-body-lg text-text-muted mb-8 max-w-2xl mx-auto">
              {hero.subheading}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" variant="primary">
                {hero.cta}
              </Button>
              <Button size="lg" variant="secondary">
                {hero.ctaSecondary}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section variant="soft" padding="lg">
        <Container>
          <SectionHeading
            eyebrow={content.home.features.subheading}
            title={content.home.features.heading}
            alignment="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.home.features.items.map((feature, idx) => (
              <ServiceCard
                key={idx}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                title={feature.title}
                description={feature.description}
                cta={{ label: content.common.learnMore, href: "#" }}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Services Section */}
      <Section variant="elevated" padding="lg">
        <Container>
          <SectionHeading
            eyebrow={content.home.services.subheading}
            title={content.home.services.heading}
            alignment="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.home.services.items.map((service, idx) => (
              <Card key={idx} className="flex flex-col">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  {service.title}
                </h3>
                <p className="text-body text-text-muted">{service.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Products Section */}
      <Section variant="default" padding="lg">
        <Container>
          <SectionHeading
            eyebrow={content.products.subheading}
            title={content.products.heading}
            alignment="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.products.items.map((product, idx) => (
              <ProductCard
                key={idx}
                productName={product.name}
                features={product.features}
                status={product.status as any}
                ctaLabel={content.common.learnMore}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Solutions Section */}
      <Section variant="soft" padding="lg">
        <Container>
          <SectionHeading
            eyebrow={content.solutions.subheading}
            title={content.solutions.heading}
            alignment="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.solutions.items.map((solution, idx) => (
              <IndustryCard
                key={idx}
                industryName={solution.industry}
                description={solution.description}
                benefits={solution.benefits}
                ctaLabel={content.common.learnMore}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="elevated" padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-h2-section text-text font-bold mb-4">
              {content.home.cta.heading}
            </h2>
            <p className="text-body-lg text-text-muted mb-8">
              {content.home.cta.subheading}
            </p>
            <Button size="lg" variant="primary">
              {content.home.cta.button}
            </Button>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
