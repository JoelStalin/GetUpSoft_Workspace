import React, { useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section, SectionHeading } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";

export const AboutPage: React.FC = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;
  const about = content.about;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header language={currentLanguage} onLanguageChange={setLanguage} />

      {/* Hero Section */}
      <Section variant="default" padding="lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-h1 text-text font-bold mb-6">{about.heading}</h1>
          </div>
        </Container>
      </Section>

      {/* Mission & Vision Section */}
      <Section variant="soft" padding="lg">
        <Container>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-h2-section text-text font-bold mb-4">
                {currentLanguage === "es" ? "Visión" : "Vision"}
              </h2>
              <p className="text-body-lg text-text-muted">{about.vision}</p>
            </div>
            <div>
              <h2 className="text-h2-section text-text font-bold mb-4">
                {currentLanguage === "es" ? "Misión" : "Mission"}
              </h2>
              <p className="text-body-lg text-text-muted">{about.mission}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values Section */}
      <Section variant="elevated" padding="lg">
        <Container>
          <SectionHeading
            title={currentLanguage === "es" ? "Nuestros Valores" : "Our Values"}
            alignment="center"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.values.map((value, idx) => (
              <Card key={idx}>
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text mb-3">
                  {value.title}
                </h3>
                <p className="text-body text-text-muted">{value.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="default" padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-h2-section text-text font-bold mb-4">
              {content.common.getStarted}
            </h2>
            <p className="text-body-lg text-text-muted mb-8">
              Let's work together to transform your business.
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
