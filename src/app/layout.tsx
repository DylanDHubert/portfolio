import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { Background, Column, Flex, Meta, opacity, SpacingToken } from "@once-ui-system/core";
import { Footer, Header, RouteGuard, Providers } from '@/components';
import { baseURL, effects, fonts, style, dataStyle, home, person, social } from '@/resources';

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // COMPREHENSIVE STRUCTURED DATA FOR AI ACCESSIBILITY
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": person.name,
    "jobTitle": person.role,
    "email": person.email,
    "image": `${baseURL}${person.avatar}`,
    "url": `${baseURL}/about`,
    "sameAs": social.map(s => s.link),
    "description": "Recent Computer Science Graduate & Machine Learning Engineer specializing in AI systems, RAG, and NASA research",
    "knowsAbout": [
      "Machine Learning",
      "Artificial Intelligence", 
      "RAG Systems",
      "Computer Vision",
      "Time Series Forecasting",
      "NASA Research",
      "Full Stack Development",
      "React",
      "Next.js",
      "PyTorch",
      "TensorFlow",
      "Natural Language Processing"
    ],
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "American University",
      "description": "Bachelor of Science in Computer Science"
    },
    "worksFor": [
      {
        "@type": "Organization",
        "name": "HHB AI Systems",
        "jobTitle": "Co-Founder & ML Engineer"
      },
      {
        "@type": "Organization",
        "name": "NASA GSFC", 
        "jobTitle": "Machine Learning Intern"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": `${person.name}'s Portfolio`,
    "url": baseURL,
    "logo": `${baseURL}/favicon-dark.svg`,
    "description": "Portfolio website showcasing machine learning engineering work, AI systems, and research projects",
    "founder": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}/about`
    },
    "sameAs": social.map(s => s.link)
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${person.name}'s Portfolio`,
    "url": baseURL,
    "description": home.description,
    "author": {
      "@type": "Person",
      "name": person.name,
      "url": `${baseURL}/about`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseURL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        
        {/* COMPREHENSIVE STRUCTURED DATA FOR AI ACCESSIBILITY */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema)
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'system';
                  
                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    'solid-style': style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    'viz-style': dataStyle.variant,
                  })};
                  
                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Apply saved theme
                  const savedTheme = localStorage.getItem('data-theme');
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                  // Favicon swap
                  function setFavicon(theme) {
                    const favicon = document.querySelector('link[rel="icon"]');
                    if (favicon) {
                      favicon.href = theme === 'light' ? '/favicon-light.svg' : '/favicon-dark.svg';
                    }
                  }
                  setFavicon(resolvedTheme);
                  // Listen for theme changes
                  const observer = new MutationObserver(() => {
                    setFavicon(root.getAttribute('data-theme'));
                  });
                  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column as="body" background="page" fillWidth style={{minHeight: "100vh"}} margin="0" padding="0" horizontal="center">
          <Background
            position="fixed"
            mask={{
              x: effects.mask.x,
              y: effects.mask.y,
              radius: effects.mask.radius,
              cursor: effects.mask.cursor,
            }}
            gradient={{
              display: effects.gradient.display,
              opacity: effects.gradient.opacity as opacity,
              x: effects.gradient.x,
              y: effects.gradient.y,
              width: effects.gradient.width,
              height: effects.gradient.height,
              tilt: effects.gradient.tilt,
              colorStart: effects.gradient.colorStart,
              colorEnd: effects.gradient.colorEnd,
            }}
            dots={{
              display: effects.dots.display,
              opacity: effects.dots.opacity as opacity,
              size: effects.dots.size as SpacingToken,
              color: effects.dots.color,
            }}
            grid={{
              display: effects.grid.display,
              opacity: effects.grid.opacity as opacity,
              color: effects.grid.color,
              width: effects.grid.width,
              height: effects.grid.height,
            }}
            lines={{
              display: effects.lines.display,
              opacity: effects.lines.opacity as opacity,
              size: effects.lines.size as SpacingToken,
              thickness: effects.lines.thickness,
              angle: effects.lines.angle,
              color: effects.lines.color,
            }}
          />
          <Flex fillWidth minHeight="16" hide="s"/>
            <Header />
            <Flex
              zIndex={0}
              fillWidth
              padding="l"
              horizontal="center"
              flex={1}
            >
              <Flex horizontal="center" fillWidth minHeight="0">
                <RouteGuard>
                  {children}
                </RouteGuard>
              </Flex>
            </Flex>
            <Footer/>
          </Column>
        </Providers>
      </Flex>
  );
}
