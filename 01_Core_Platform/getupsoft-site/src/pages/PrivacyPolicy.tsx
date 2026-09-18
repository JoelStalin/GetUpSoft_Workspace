import { Link } from "react-router-dom";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-12">
        <div className="mx-auto max-w-3xl px-6 prose prose-lg max-w-none">
          {/* 1. Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GetUpSoft ("Company," "we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our website, use our services,
              and interact with our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices,
              please do not use our services.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Account registration information (name, email, company)</li>
                <li>Billing and payment information</li>
                <li>Communication preferences</li>
                <li>Content you create or upload to the platform</li>
                <li>Support requests and feedback</li>
                <li>Any other information you voluntarily provide</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Device information (type, OS, browser)</li>
                <li>IP address and geolocation data</li>
                <li>Usage analytics and behavioral data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and server activity</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Information From Third Parties</h3>
              <p className="text-gray-700 leading-relaxed">
                We may receive information about you from third-party services, business partners, and public sources
                to verify your identity, prevent fraud, and improve our services.
              </p>
            </div>
          </div>

          {/* 3. How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Provide, maintain, and improve our platform</li>
              <li>Process transactions and send transaction confirmations</li>
              <li>Send you service updates and support notifications</li>
              <li>Respond to your inquiries and customer service requests</li>
              <li>Monitor and analyze platform usage and trends</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Comply with legal obligations and enforce our agreements</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Personalize your experience on our platform</li>
            </ul>
          </div>

          {/* 4. Data Sharing and Disclosure */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We share information with third-party service providers who perform services on our behalf, including
                hosting, payment processing, analytics, and customer support. These providers are bound by
                confidentiality obligations and may only use your information for the purposes we specify.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information when required by law, regulation, court order, or government authority.
                We will provide notice when legally permitted.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                If GetUpSoft is involved in a merger, acquisition, or asset sale, your information may be transferred
                as part of that transaction. We will provide notice and seek consent where required.
              </p>
            </div>
          </div>

          {/* 5. Data Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement comprehensive security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access controls and authentication</li>
              <li>Firewalls and intrusion detection systems</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              While we strive to protect your information, no security system is impenetrable.
              We cannot guarantee absolute security, but we are committed to maintaining appropriate safeguards.
            </p>
          </div>

          {/* 6. Your Rights and Choices */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Access and Portability</h3>
              <p className="text-gray-700 leading-relaxed">
                You have the right to request a copy of your personal data and to receive it in a portable format.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Correction and Deletion</h3>
              <p className="text-gray-700 leading-relaxed">
                You may request correction of inaccurate information and deletion of your personal data,
                subject to legal and business requirements.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Marketing Communications</h3>
              <p className="text-gray-700 leading-relaxed">
                You can opt-out of marketing emails by clicking the unsubscribe link or managing your preferences
                in your account settings.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.4 Cookie Management</h3>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. Note that disabling cookies may affect
                platform functionality.
              </p>
            </div>
          </div>

          {/* 7. International Data Transfer */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Data Transfer</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence,
              including countries that may have different data protection laws. By using our services, you consent to
              the transfer of your information to countries outside your country of residence.
            </p>
          </div>

          {/* 8. Retention */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as necessary to provide our services, comply with legal obligations,
              and resolve disputes. When you delete your account, we will delete or anonymize your personal data within
              30 days, except where retention is required by law.
            </p>
          </div>

          {/* 9. Changes to This Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting
              the updated policy on our website and updating the "Last updated" date at the top. Your continued use
              of our services constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* 10. Contact Us */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
              <p className="font-semibold text-gray-900">GetUpSoft Privacy Team</p>
              <p className="text-gray-700">Email: privacy@getupsoft.com</p>
              <p className="text-gray-700">Address: Santo Domingo, Dominican Republic</p>
              <p className="text-gray-700">Response time: 15 business days</p>
            </div>
          </div>

          {/* GDPR/CCPA Notice */}
          <div className="border-t-2 border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Notices</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">GDPR Compliance (European Users)</h3>
              <p className="text-gray-700 leading-relaxed">
                If you are a European resident, you have the right to lodge a complaint with your local data protection
                authority. We process your data based on legitimate interest, contractual necessity, and your consent.
                You have the right to withdraw consent at any time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">CCPA Compliance (California Users)</h3>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, you have the right to know what personal information is collected,
                delete personal information, and opt-out of sale or sharing of personal information.
                Email privacy@getupsoft.com with "CCPA Request" in the subject line.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
