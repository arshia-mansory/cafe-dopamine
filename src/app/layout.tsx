import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

const SITE_URL = "https://cafe-dopamine.vercel.app";

export const metadata: Metadata = {
  title: "کافه دوپامین | بهترین قهوه و نوشیدنی‌ها در اسلامشهر",
  description:
    "کافه دوپامین در اسلامشهر — فضایی دلنشین برای لذت بردن از بهترین قهوه تخصصی، نوشیدنی‌های سرد و گرم، دسرهای خانگی و اتصال رایگان وای‌فای. منوی متنوع با قیمت مناسب.",
  keywords: [
    "کافه دوپامین",
    "کافه دوپامین اسلامشهر",
    "قهوه تخصصی اسلامشهر",
    "کافه اسلامشهر",
    "بهترین کافه اسلامشهر",
    "نوشیدنی سرد",
    "نوشیدنی گرم",
    "دسر خانگی",
    "کافه با وای فای رایگان",
    "قهوه",
    "cafe dopamine",
    "کافی شاپ اسلامشهر",
  ],
  authors: [{ name: "کافه دوپامین" }],
  creator: "کافه دوپامین",
  publisher: "کافه دوپامین",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "کافه دوپامین",
    title: "کافه دوپامین | بهترین قهوه و نوشیدنی‌ها در اسلامشهر",
    description:
      "کافه دوپامین در اسلامشهر — فضایی دلنشین برای لذت بردن از بهترین قهوه تخصصی، نوشیدنی‌های سرد و گرم، دسرهای خانگی. منوی متنوع با قیمت مناسب.",
    images: [
      {
        url: `${SITE_URL}/hero-default.jpg`,
        width: 1200,
        height: 630,
        alt: "کافه دوپامین - بهترین تجربه قهوه در اسلامشهر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "کافه دوپامین | بهترین قهوه و نوشیدنی‌ها در اسلامشهر",
    description:
      "کافه دوپامین در اسلامشهر — فضایی دلنشین برای لذت بردن از بهترین قهوه تخصصی، نوشیدنی‌ها و دسرهای خانگی.",
    images: [`${SITE_URL}/hero-default.jpg`],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  verification: {
    google: "google-site-verification=YOUR_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "کافه دوپامین",
    description:
      "کافه دوپامین در اسلامشهر — فضایی دلنشین برای لذت بردن از بهترین قهوه تخصصی، نوشیدنی‌های سرد و گرم، دسرهای خانگی و اتصال رایگان وای‌فای.",
    url: SITE_URL,
    image: `${SITE_URL}/hero-default.jpg`,
    logo: `${SITE_URL}/logo.svg`,
    telephone: "",
    address: {
      "@type": "PostalAddress",
      addressLocality: "اسلامشهر",
      addressRegion: "تهران",
      addressCountry: "IR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.5619,
      longitude: 51.3286,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "09:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "14:00",
        closes: "23:00",
      },
    ],
    priceRange: "$$",
    servesCuisine: ["قهوه تخصصی", "نوشیدنی سرد", "نوشیدنی گرم", "دسر"],
    acceptsReservations: "False",
    hasMenu: {
      "@type": "Menu",
      url: `${SITE_URL}`,
      hasMenuSection: {
        "@type": "MenuSection",
        name: "منوی کافه دوپامین",
        hasMenuItem: {
          "@type": "MenuItem",
          name: "قهوه تخصصی، نوشیدنی سرد و گرم، دسر خانگی",
        },
      },
    },
    sameAs: [],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Vazirmatn', sans-serif" }}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}