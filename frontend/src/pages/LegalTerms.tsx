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
      body: `You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account or submit content. By using the Service, you represent and warrant that you meet this requirement.`,
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
      body: `For questions about these Terms, email SafeUse@gmail.com or write to SafeUse — Calle Ficticia 42, 28000 Madrid, Spain.`,
    },
  ];

  return (
    <section className="container mx-auto max-w-4xl px-6 py-16 text-neutral-900">
      <h1 className="mb-10 text-center mt-10 text-4xl font-extrabold lg:text-5xl">
        Terms of Service
      </h1>

      {sections.map((s, i) => (
        <article key={i} className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold lg:text-2xl">{s.heading}</h2>
          <p className="text-sm leading-relaxed lg:text-base">{s.body}</p>
        </article>
      ))}

      <div className="mt-16 text-center">
        <p className="text-xs text-gray-500">
          Last updated: May 19, 2025
        </p>
      </div>
    </section>
  );
}
