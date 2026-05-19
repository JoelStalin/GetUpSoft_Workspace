import { Link } from "react-router-dom";

export function TermsOfService() {
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
              Terms of Service
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
          {/* 1. Agreement to Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using the GetUpSoft platform, website, and services ("Services"), you agree to be bound
              by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              GetUpSoft reserves the right to modify these terms at any time. Changes will be effective immediately
              upon posting to the website. Your continued use of the Services constitutes acceptance of the updated terms.
            </p>
          </div>

          {/* 2. Acceptable Use */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to use the Services for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Illegal purposes or violating any laws or regulations</li>
              <li>Harassment, abuse, or harm to any person or entity</li>
              <li>Unauthorized access to systems or networks</li>
              <li>Transmission of malware, viruses, or harmful code</li>
              <li>Intellectual property infringement</li>
              <li>Fraud, deception, or misrepresentation</li>
              <li>Spamming or unsolicited communications</li>
              <li>Reverse engineering or attempting to derive source code</li>
              <li>Competitive intelligence gathering without authorization</li>
              <li>Any other activity that could damage our platform or services</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Violation of this policy may result in termination of your account and legal action.
            </p>
          </div>

          {/* 3. User Accounts */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Credentials</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-700 leading-relaxed">
                To use certain features of the Services, you must create an account with accurate and complete information.
                You are responsible for maintaining the confidentiality of your login credentials and are liable for all
                activities that occur under your account.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Responsibility</h3>
              <p className="text-gray-700 leading-relaxed">
                You are solely responsible for protecting your account credentials. If you believe your account has been
                compromised, notify us immediately at security@getupsoft.com. We are not liable for any unauthorized use
                of your account.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Eligibility</h3>
              <p className="text-gray-700 leading-relaxed">
                You represent that you are at least 18 years old and have the authority to enter into this agreement.
                Accounts for persons under 18 are not permitted.
              </p>
            </div>
          </div>

          {/* 4. Intellectual Property Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property Rights</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Platform Ownership</h3>
              <p className="text-gray-700 leading-relaxed">
                All content, materials, features, and functionality of the GetUpSoft platform, including but not limited to
                software, code, design, and documentation, are owned by GetUpSoft or its licensors and are protected by
                copyright and intellectual property laws.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Limited License</h3>
              <p className="text-gray-700 leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to use the Services for your business
                purposes in accordance with these Terms. You may not copy, modify, distribute, or create derivative works
                of our platform without written permission.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Your Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content you create or upload to the platform. By using our Services,
                you grant GetUpSoft a worldwide, non-exclusive license to use, process, and store your content
                to provide the Services to you.
              </p>
            </div>
          </div>

          {/* 5. Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed">
                The Services are provided "as-is" and "as-available" without warranties of any kind, express or implied.
                We do not warrant that the Services will be uninterrupted, error-free, or secure.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Limitation of Damages</h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, GetUpSoft shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including lost profits or data loss, arising from your use
                of the Services, even if advised of the possibility of such damages.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Liability Cap</h3>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for any claims arising from these Terms or your use of the Services shall not
                exceed the amount you paid to GetUpSoft in the 12 months preceding the claim.
              </p>
            </div>
          </div>

          {/* 6. Indemnification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless GetUpSoft and its officers, directors, employees,
              and agents from any claims, damages, or losses arising from your use of the Services, your violation of
              these Terms, or your infringement of third-party intellectual property rights.
            </p>
          </div>

          {/* 7. Payment Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Billing</h3>
              <p className="text-gray-700 leading-relaxed">
                If you have a paid subscription, you authorize GetUpSoft to charge your payment method for the
                subscription fees in effect during the subscription period. Billing occurs at the beginning of each
                billing period and is non-refundable.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Price Changes</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to change prices for our Services with 30 days' notice. Price changes will not
                apply to existing subscriptions until the renewal date.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                You may cancel your subscription at any time. Upon cancellation, you will have access to the Services
                until the end of your billing period. No refunds will be issued for partial months.
              </p>
            </div>
          </div>

          {/* 8. Service Level Agreement */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GetUpSoft commits to maintaining platform availability of 99.9% (calculated monthly). Scheduled maintenance
              windows and force majeure events are excluded from this commitment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In the event of Service unavailability exceeding 99.9% in a calendar month, you may be eligible for service
              credits as outlined in our Service Level Agreement. For details, contact support@getupsoft.com.
            </p>
          </div>

          {/* 9. Data and Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Protection and Security</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Data Protection</h3>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your data. However, no system is completely
                secure. We are not liable for unauthorized access or data breaches unless caused by our gross negligence.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 HIPAA and Compliance</h3>
              <p className="text-gray-700 leading-relaxed">
                GetUpSoft does not knowingly handle HIPAA-protected health information. If your use case involves
                healthcare data, contact us at compliance@getupsoft.com before using the Services.
              </p>
            </div>
          </div>

          {/* 10. Termination */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Termination by You</h3>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting support@getupsoft.com. Upon termination,
                you will lose access to the Services and associated data.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Termination by GetUpSoft</h3>
              <p className="text-gray-700 leading-relaxed">
                We may terminate your account immediately for violation of these Terms, unauthorized use, or non-payment.
                We will provide notice when possible, except in cases of security concerns or ongoing abuse.
              </p>
            </div>
          </div>

          {/* 11. Disputes and Governing Law */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disputes and Governing Law</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the Dominican Republic, without regard to its conflict of law
                provisions.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Dispute Resolution</h3>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these Terms or your use of the Services must be resolved through binding
                arbitration in Santo Domingo, Dominican Republic, or the courts of the Dominican Republic.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">11.3 Injunctive Relief</h3>
              <p className="text-gray-700 leading-relaxed">
                Notwithstanding the above, GetUpSoft may seek injunctive relief for violations of intellectual property
                rights, unauthorized access, or other urgent matters.
              </p>
            </div>
          </div>

          {/* 12. Contact Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
              <p className="font-semibold text-gray-900">GetUpSoft Legal Team</p>
              <p className="text-gray-700">Email: legal@getupsoft.com</p>
              <p className="text-gray-700">Address: Santo Domingo, Dominican Republic</p>
              <p className="text-gray-700">Support: support@getupsoft.com</p>
            </div>
          </div>

          {/* Acceptance */}
          <div className="border-t-2 border-gray-200 pt-8">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-gray-900">
                <strong>By accessing and using GetUpSoft, you acknowledge that you have read, understood, and agree to
                be bound by these Terms of Service.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
