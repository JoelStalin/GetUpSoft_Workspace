import { Link } from "react-router-dom";

const features = [
  {
    icon: "🚀",
    title: "Product Platforms",
    description: "Build scalable admin portals and client surfaces designed for teams that operate at scale.",
    color: "gc-bright-blue",
  },
  {
    icon: "⚙️",
    title: "Business Workflows",
    description: "Orchestrate processes across sales, operations, support and backoffice seamlessly.",
    color: "gc-bright-purple",
  },
  {
    icon: "☁️",
    title: "Cloud Delivery",
    description: "Deploy with complete infrastructure, monitoring and environment controls.",
    color: "gc-bright-green",
  },
  {
    icon: "🔗",
    title: "Integration Layer",
    description: "Connect Odoo, billing systems, catalogs and business events with clear contracts.",
    color: "gc-bright-orange",
  },
];

const benefits = [
  { label: "99.99% Uptime", value: "Industrial Grade Reliability" },
  { label: "42ms Latency", value: "Global CDN Coverage" },
  { label: "100+ Features", value: "Complete Platform" },
];

const services = [
  {
    step: "01",
    title: "Discovery & Analysis",
    description: "We map your operations and identify where systems break down.",
    gradient: "gradient-blue-purple",
  },
  {
    step: "02",
    title: "Architecture Design",
    description: "Technical design of product, integrations, and automation as one system.",
    gradient: "gradient-orange-red",
  },
  {
    step: "03",
    title: "Operational Delivery",
    description: "Deploy with observability, environments, and a scalable codebase.",
    gradient: "gradient-green-cyan",
  },
];

export function HomePage() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-light opacity-40" />

        {/* Gradient overlays */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-900">Enterprise-Ready Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900">Build Operating Systems</span>
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  for Your Teams
                </span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              GetUpSoft engineers scalable digital infrastructure for teams that need to grow.
              Software, automation, and cloud delivery—all integrated into one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                to="/productos/easycount"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Explore EasyCount
              </Link>
              <Link
                to="/contacto"
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Request Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {benefits.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{item.label}</p>
                  <p className="text-sm text-gray-600 mt-2">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Complete Platform Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale your digital operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-xl bg-white border border-gray-200 hover:border-transparent transition-all hover:shadow-2xl"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity ${
                    idx === 0
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : idx === 1
                      ? "bg-gradient-to-r from-purple-500 to-purple-600"
                      : idx === 2
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600"
                  }`}
                />

                <div className="relative">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Our Approach
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Proven methodology to deliver scalable systems that grow with your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.step} className="relative">
                {/* Step connector line */}
                {service.step !== "03" && (
                  <div className="hidden md:block absolute top-24 left-1/2 w-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-x-1/2" />
                )}

                <div className="relative">
                  {/* Step number circle */}
                  <div className={`w-16 h-16 rounded-full ${service.gradient} flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg`}>
                    {service.step}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EasyCount Spotlight */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-orange-50 border border-orange-200">
                <span className="text-sm font-semibold text-orange-700">Flagship Product</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                EasyCount: Business Operations Made Simple
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                EasyCount is our core operating system for business control, billing, and connected workflows.
                Built on enterprise architecture with everything your team needs to scale.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  "Intuitive role-based interfaces",
                  "Automated business workflows",
                  "Real-time operational visibility",
                  "Cloud-native infrastructure",
                  "24/7 enterprise support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link
                  to="/productos/easycount"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all text-center"
                >
                  View Product Specs
                </Link>
                <Link
                  to="/contacto"
                  className="px-8 py-4 border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all text-center"
                >
                  Schedule Demo
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-purple-100 to-blue-100" />

                {/* Animated shapes */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-float" />
                <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-400 rounded-full opacity-20 animate-float animation-delay-2000" />

                {/* Center badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-white shadow-2xl flex items-center justify-center border-4 border-blue-100">
                    <div className="text-center">
                      <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">EC</div>
                      <p className="text-sm text-gray-600 mt-2">EasyCount</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Ready to Scale Your Operations?
            </h2>
            <p className="text-xl text-gray-600">
              Get started with GetUpSoft today. Enterprise support, unlimited scaling, and cloud-native infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                to="/contacto"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Get Started Free
              </Link>
              <a
                href="mailto:contacto@getupsoft.com"
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
