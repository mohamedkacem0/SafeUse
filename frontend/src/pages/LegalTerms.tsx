export default function LegalTerms() {
  const sections = [
    {
      heading: '1. Acceptance of Terms',
      body: `By accessing or using SafeUse ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to every provision, you must not use the Service.`,
    },
    {
      heading: '2. Educational Purpose Only',
      body: `Content on SafeUse is provided for informational and harm‑reduction purposes. We do not promote or encourage the use of any controlled or illegal substances. Decisions made based on information from SafeUse are taken at your own risk.`,
    },
    {
      heading: '3. User Accounts',
      body: `To access certain features you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.`,
    },
    {
      heading: '4. Age Restriction',
      body: `You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account or submit content. By using the Service, you represent and warrant that you meet this requirement.`,
    },
    {
      heading: '5. Prohibited Conduct',
      body: `You agree not to (a) upload content that is unlawful, harmful or misleading; (b) attempt to hack or disrupt the Service; (c) impersonate another person; (d) violate any applicable law.`,
    },
    {
      heading: '6. Intellectual Property',
      body: `All logos, graphics, text and compilations are the property of SafeUse or its licensors. You may not copy, modify, distribute or create derivative works without prior written consent.`,
    },
    {
      heading: '7. Disclaimers',
      body: `The Service is provided “as is” without warranties of any kind, express or implied. SafeUse does not guarantee that the information is complete, accurate or up to date.`,
    },
    {
      heading: '8. Limitation of Liability',
      body: `To the maximum extent permitted by law, SafeUse shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the Service.`,
    },
    {
      heading: '9. Governing Law',
      body: `These Terms are governed by and construed in accordance with the laws of Spain. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Madrid.`,
    },
    {
      heading: '10. Changes',
      body: `We may modify these Terms at any time by posting the updated version on this page. Continued use of the Service constitutes acceptance of the revised Terms.`,
    },
    {
      heading: '11. Contact',
      body: `For questions about these Terms, email SafeUse@gmail.com or write to SafeUse — Calle Ficticia 42, 28000 Madrid, Spain.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 mt-10">
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-center mt-6 sm:mt-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-800 lg:text-5xl">
          Terms of Service
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
    </div>
  );
}
