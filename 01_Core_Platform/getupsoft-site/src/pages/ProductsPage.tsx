import React, { useContext } from "react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Container } from "../components/ui/Layout";
import { Section, SectionHeading } from "../components/ui/Layout";
import { ProductCard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LanguageContext } from "../contexts/LanguageContext";

export const ProductsPage: React.FC = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    return <div>Error: Language context not available</div>;
  }

  const { language: content, currentLanguage, setLanguage } = context;
  const products = content.products;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header language={currentLanguage} onLanguageChange={setLanguage} />

      {/* Hero Section */}
      <Section variant="default" padding="lg">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              eyebrow={products.subheading}
              title={products.heading}
              alignment="center"
            />
          </div>
        </Container>
      </Section>

      {/* Products Grid */}
      <Section variant="soft" padding="lg">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.items.map((product, idx) => (
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

      {/* CTA Section */}
      <Section variant="elevated" padding="lg">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-h2-section text-text font-bold mb-4">
              {content.common.getStarted}
            </h2>
            <p className="text-body-lg text-text-muted mb-8">
              Choose your product and start your transformation today.
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
