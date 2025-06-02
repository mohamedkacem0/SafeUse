export default function PrivacyPolicy() {
  const sections = [
    {
      heading: '1. Introduction',
      body: `SafeUse ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal data when you visit safeuse.com ("the Service").`,
    },
    {
      heading: '2. Information We Collect',
      body: `• Account data: name, email, hashed password, date of birth (optional), phone (optional).
• Usage data: pages visited, search queries, interactions, IP address, browser type.
• Device data: operating system, device identifiers, approximate location (city-level).`,
    },
    {
      heading: '3. How We Use Your Information',
      body: `• Provide and maintain the Service (create accounts, display content).
• Improve and personalize the user experience.
• Send transactional emails (password reset, account alerts).
• Conduct analytics and research for harm‑reduction purposes.
• Comply with legal obligations.`,
    },
    {
      heading: '4. Legal Basis',
      body: `We process your data under the GDPR on the bases of (a) consent, (b) performance of a contract, and (c) legitimate interest in improving public health information.`,
    },
    {
      heading: '5. Cookies',
      body: `We use first‑party cookies for session management and analytics cookies (Matomo) to understand site usage. You can disable cookies in your browser, but some features may not work.`,
    },
    {
      heading: '6. Data Sharing',
      body: `We do not sell or rent your personal data. We share it only with:
• Service providers under contract (hosting, email). 
• Public authorities when required by law.
All recipients are bound to strict confidentiality.`,
    },
    {
      heading: '7. Data Retention',
      body: `Account data is stored until you delete your account. Logs and analytics data are retained for a maximum of 24 months. Backups are encrypted and purged after 30 days.`,
    },
    {
      heading: '8. Your Rights',
      body: `Under GDPR you may: access, rectify, erase, restrict, or port your data, and object to processing. To exercise these rights email privacy@safeuse.com.`,
    },
    {
      heading: '9. Children’s Privacy',
      body: `The Service is not directed to minors under 18. We do not knowingly collect personal data from children.`,
    },
    {
      heading: '10. International Transfers',
      body: `Data may be processed in servers located in the EEA or the United States. We rely on Standard Contractual Clauses for transfers outside the EEA.`,
    },
    {
      heading: '11. Changes to This Policy',
      body: `We may update this Privacy Policy periodically. Material changes will be announced on the Site or via email. Continued use of the Service implies acceptance of the updated policy.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 mt-10">
      {/* If you have a global Navbar, it would typically be outside or part of a layout component */}
      {/* <Navbar /> */}
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-center mt-6 sm:mt-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-800 lg:text-5xl">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <article 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-xl border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-neutral-700 lg:text-2xl mb-3">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-gray-600 lg:text-base whitespace-pre-line">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <p className="text-xs text-gray-500">
            Last updated: May 19, 2025
          </p>
        </div>
      </main>
      {/* If you have a global Footer, it would typically be outside or part of a layout component */}
      {/* <Footer /> */}
    </div>
  );
}
