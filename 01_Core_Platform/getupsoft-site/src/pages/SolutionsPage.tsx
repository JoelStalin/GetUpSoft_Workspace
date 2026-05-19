import React, { useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section, SectionHeading } from "../components/ui/Layout";
import { IndustryCard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";

export const SolutionsPage: React.FC = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;
  const solutions = content.solutions;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header language={currentLanguage} onLanguageChange={setLanguage} />

      {/* Hero Section */}
      <Section variant="default" padding="lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              eyebrow={solutions.subheading}
              title={solutions.heading}
              alignment="center"
            />
          </div>
        </Container>
      </Section>

      {/* Solutions Grid */}
      <Section variant="soft" padding="lg">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.items.map((solution, idx) => (
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
              {content.common.getStarted}
            </h2>
            <p className="text-body-lg text-text-muted mb-8">
              Find the solution that fits your industry.
            </p>
            <Button size="lg" variant="primary">
              {content.common.contactUs}
            </Button>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};
