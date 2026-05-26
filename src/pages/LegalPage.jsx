import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import Footer from "../components/Footer";

const aboutParagraphs = [
  "RentalChhavi Platform is a modern digital rental platform specially designed for flats, individual homes, PG accommodations, and stand-alone buildings. The main purpose of the platform is to directly connect property owners and tenants without any unnecessary brokerage or middlemen involvement. In today's rental market, both owners and tenants face multiple problems such as high brokerage charges, delayed communication, fake commitments, lack of transparency, and unnecessary expenses. RentalChhavi provides a simple, affordable, and technology-driven solution for these problems.",
  "Through the RentalChhavi platform, property owners can list their flats, individual homes, PGs, or stand-alone buildings online for only ₹99 + GST. Similarly, tenants can also access the platform and directly connect with owners for only ₹99 + GST. This affordable pricing model helps both sides save a huge amount of money that is usually spent on brokerage charges. In the traditional rental market, tenants often have to pay one month's rent as brokerage. For example, if the monthly rent of a flat is ₹20,000, the tenant may also need to pay an additional ₹20,000 as brokerage. RentalChhavi eliminates this financial burden and makes the rental process more affordable for everyone.",
  "One of the biggest strengths of RentalChhavi is its Direct Owner-Tenant Communication system. Owners and tenants can directly communicate through calls, chats, or inquiries without depending on brokers or third parties. This improves transparency, builds trust, speeds up communication, and helps properties get rented faster. Owners receive direct and genuine tenant inquiries, while tenants can quickly find suitable rental properties without wasting time or money.",
  "The platform is designed to be simple, secure, and user-friendly. Property owners can easily upload property details, photos, rent information, location, and amenities. Tenants can search properties based on their budget, preferred location, and property type. RentalChhavi is mobile-friendly and easily accessible for users across India.",
  "The platform mainly focuses on making the rental process faster, transparent, affordable, and brokerage-free. It is especially beneficial for students, working professionals, families, and people relocating to new cities who want to avoid heavy brokerage expenses.",
];

const privacySections = [
  {
    title: "Privacy Policy",
    body: [
      'This privacy policy applies to the RentalChaavi app, hereby referred to as the "Application", for mobile devices that was created by CARYANAMINIDIA PVT LTD, hereby referred to as the "Service Provider", as a free service. This service is intended for use "AS IS".',
    ],
  },
  {
    title: "Information Collection and Use",
    body: [
      "The Application collects information when you download and use it. This information may include your device's Internet Protocol address, the pages of the Application that you visit, the time and date of your visit, the time spent on those pages, the time spent on the Application, and the operating system you use on your mobile device.",
      "The Application does not gather precise information about the location of your mobile device. The Application does not use Artificial Intelligence technologies to process your data or provide features.",
      "The Service Provider may use the information you provided to contact you from time to time to provide important information, required notices, and marketing promotions.",
      "For a better experience, while using the Application, the Service Provider may require you to provide certain personally identifiable information. The requested information will be retained and used as described in this privacy policy.",
    ],
  },
  {
    title: "Third Party Access",
    body: [
      "Only aggregated, anonymized data is periodically transmitted to external services to help the Service Provider improve the Application and their service. The Application utilizes Google Play Services, which has its own privacy policy.",
      "The Service Provider may disclose user provided and automatically collected information as required by law, when disclosure is necessary to protect rights or safety, investigate fraud, respond to a government request, or with trusted service providers who work on their behalf and agree to follow this privacy statement.",
    ],
  },
  {
    title: "Opt-Out Rights",
    body: [
      "You can stop all collection of information by the Application by uninstalling it using the standard uninstall processes available on your mobile device or via the mobile application marketplace or network.",
    ],
  },
  {
    title: "Data Retention Policy",
    body: [
      "The Service Provider will retain user provided data for as long as you use the Application and for a reasonable time thereafter. To request deletion of user provided data, contact asifattar003@gmail.com and the Service Provider will respond in a reasonable time.",
    ],
  },
  {
    title: "Children",
    body: [
      "The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13. If the Service Provider discovers that a child under 13 has provided personal information, it will be deleted from their servers. Parents or guardians may contact asifattar003@gmail.com for necessary action.",
    ],
  },
  {
    title: "Security, Changes, and Consent",
    body: [
      "The Service Provider provides physical, electronic, and procedural safeguards to protect information it processes and maintains.",
      "This Privacy Policy may be updated from time to time. You are advised to consult this page regularly because continued use is deemed approval of all changes. This privacy policy is effective as of 2026-05-25.",
      "By using the Application, you consent to the processing of your information as set forth in this Privacy Policy now and as amended. For privacy questions, contact asifattar003@gmail.com.",
    ],
  },
];

const termsSections = [
  {
    title: "Business Name and Contact Details",
    body: [
      "RentalChaavi is operated by CARYANAMINIDIA PVT LTD. Contact: rentalchaavi@gmail.com, +91 94218 73407. GSTIN: 27FNCPA0353N1Z2.",
    ],
  },
  {
    title: "Services and Products",
    body: [
      "RentalChaavi provides a digital rental platform for flats, individual homes, PG accommodations, and stand-alone buildings. The platform helps property owners list properties and helps tenants discover and directly connect with owners without brokerage or middlemen.",
    ],
  },
  {
    title: "Payment Terms",
    body: [
      "Property owners may list eligible properties for ₹99 + GST. Tenants may access owner connection features for ₹99 + GST. Payments must be completed through the payment methods made available on the platform, and access may begin only after successful payment verification.",
    ],
  },
  {
    title: "Refund and Cancellation Rules",
    body: [
      "Paid access is generally non-refundable once listing access, tenant access, or owner contact access has been activated. Refund requests for duplicate payments, failed transactions, or incorrect charges may be reviewed after users contact support with payment proof. RentalChaavi may approve or reject refund requests based on verification.",
    ],
  },
  {
    title: "User Responsibilities",
    body: [
      "Users must provide accurate details, use the platform lawfully, avoid fake listings or misleading commitments, respect other users, and independently verify property details before making rental decisions or payments outside the platform.",
    ],
  },
  {
    title: "Account Termination or Suspension",
    body: [
      "RentalChaavi may suspend, restrict, or terminate accounts or listings that contain false information, misuse platform features, violate these terms, create safety risks, or harm other users or the platform.",
    ],
  },
  {
    title: "Delivery and Service Timelines",
    body: [
      "Digital listing and access services are usually activated after successful payment and internal verification where applicable. Property approvals, support responses, and verification actions may take a reasonable operational time depending on request volume and information completeness.",
    ],
  },
  {
    title: "Intellectual Property and Copyright",
    body: [
      "The RentalChaavi name, platform design, content, software, logos, and related materials are owned by or licensed to the business. Users retain responsibility for content they upload and must not upload content that infringes another person's rights.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "RentalChaavi is a technology platform that enables direct owner-tenant communication. RentalChaavi does not guarantee rental agreements, property condition, user conduct, or outcomes of negotiations. To the maximum extent permitted by law, liability is limited to the amount paid by the user for the relevant platform service.",
    ],
  },
  {
    title: "Governing Law",
    body: [
      "These Terms & Conditions are governed by the laws of India. Disputes will be subject to the jurisdiction of competent courts in India.",
    ],
  },
  {
    title: "Contact and Support",
    body: [
      "For support, payment, account, privacy, or listing questions, contact rentalchaavi@gmail.com or call +91 94218 73407.",
    ],
  },
];

const pageContent = {
  "/about-us": {
    title: "About Us",
    intro:
      "RentalChhavi Rental Platform stands with one powerful vision: Direct Rental. No Brokerage. Affordable for Everyone.",
    sections: [{ title: "RentalChhavi Platform", body: aboutParagraphs }],
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    intro:
      "This page explains how RentalChaavi collects, uses, retains, and protects information when users access the application.",
    sections: privacySections,
  },
  "/terms-and-conditions": {
    title: "Terms & Conditions",
    intro:
      "These terms define platform use, payments, refunds, user duties, service timelines, liability, and support details.",
    sections: termsSections,
  },
};

const LegalPage = () => {
  const { pathname } = useLocation();
  const content = pageContent[pathname] || pageContent["/about-us"];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="bg-slate-950 text-white px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="min-w-0">
            <BrandLogo size="sm" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white hover:border-[#ff7438] hover:text-[#ff7438] transition-colors"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <main className="px-4 md:px-6 py-12">
        <article className="max-w-4xl mx-auto">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff7438]">
            RentalChaavi
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl font-black text-slate-950">
            {content.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {content.intro}
          </p>

          <div className="mt-10 space-y-8">
            {content.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-2xl font-black text-slate-900">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;
