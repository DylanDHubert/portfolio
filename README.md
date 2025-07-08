# **Magic Portfolio by Once UI**

View the [demo here](https://demo.magic-portfolio.com).

![Magic Portfolio](https://demo.magic-portfolio.com/images/og/home.jpg)


# **Getting started**

Magic Portfolio was built with [Once UI](https://once-ui.com) for [Next.js](https://nextjs.org). It requires Node.js v18.17+.

**1. Clone the repository**
```
git clone https://github.com/once-ui-system/magic-portfolio.git
```

**2. Install dependencies**
```
npm install
```

**3. Run dev server**
```
npm run dev
```

**4. Edit config**
```
src/app/resources/config
```

**5. Edit content**
```
src/app/resources/content
```

**6. Create blog posts / projects**
```
Add a new .mdx file to src/app/blog/posts or src/app/work/projects
```

# **Documentation**

Docs available at: [docs.once-ui.com](https://docs.once-ui.com/docs/magic-portfolio/quick-start)

# **Features**

## **Once UI**
- All tokens, components & features of [Once UI](https://once-ui.com)

## **SEO**
- Automatic open-graph and X image generation with next/og
- Automatic schema and metadata generation based on the content file

## **Design**
- Responsive layout optimized for all screen sizes
- Timeless design without heavy animations and motion
- Endless customization options through [data attributes](https://once-ui.com/docs/theming)

## **Content**
- Render sections conditionally based on the content file
- Enable or disable pages for blog, work, gallery and about / CV
- Generate and display social links automatically
- Set up password protection for URLs

## **Localization**
- A localized version of Magic Portfolio is available with the next-intl library
- To use localization, switch to the 'i18n' branch

# **Authors**

Connect with us on Threads or LinkedIn.

Lorant Toth: [Threads](https://www.threads.net/@lorant.one), [LinkedIn](https://www.linkedin.com/in/tothlorant/)  
Zsofia Komaromi: [Threads](https://www.threads.net/@zsofia_kom), [LinkedIn](https://www.linkedin.com/in/zsofiakomaromi/)

Localization added by [François Hernandez](https://github.com/francoishernandez)

# **Get involved**

- Join the [Design Engineers Club on Discord](https://discord.com/invite/5EyAQ4eNdS) and share your portfolio with us!
- Report a [bug](https://github.com/once-ui-system/magic-portfolio/issues/new?labels=bug&template=bug_report.md).

# **License**

Distributed under the CC BY-NC 4.0 License.
- Commercial usage is not allowed.
- Attribution is required.
- You can extend the license to commercial use by purchasing a [Once UI Pro](https://once-ui.com/pricing) license.

See `LICENSE.txt` for more information.

# **Deploy with Vercel**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fonce-ui-system%2Fmagic-portfolio&project-name=portfolio&repository-name=portfolio&redirect-url=https%3A%2F%2Fgithub.com%2Fonce-ui-system%2Fmagic-portfolio&demo-title=Magic%20Portfolio&demo-description=Showcase%20your%20designers%20or%20developer%20portfolio&demo-url=https%3A%2F%2Fdemo.magic-portfolio.com&demo-image=%2F%2Fraw.githubusercontent.com%2Fonce-ui-system%2Fmagic-portfolio%2Fmain%2Fpublic%2Fimages%2Fog%2Fhome.jpg)

# Magic Portfolio - Development Guide

Magic Portfolio is a comprehensive, MDX-based, SEO-friendly, responsive portfolio template built with Once UI and Next.js.

## License

Magic Portfolio is licensed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). You can only use it for personal purposes, and you must attribute the original work. The attribution is added in the footer by default, but you can place it in any other, visible part of your site.

Subscribe to the [Once UI Pro plan](https://once-ui.com/pricing) to extend the license to [Dopler CC](https://once-ui.com/products/magic-portfolio).

## Quick Start

Clone the git repository:

```bash
git clone https://github.com/once-ui-system/magic-portfolio.git
```

Install the necessary dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

## Content Management

### Avatar

Replace the `public/images/avatar.jpg` file with your own avatar image. It is used on the `/about` page as well as on the dynamically generated `open-graph` images.

### Favicon

Replace the `src/app/favicon.ico` file with your own favicon.

### Content Configuration

Replace the content in the `resources/content.js` file with your own content. You can use custom components in most cases, since the props are usually declared as `ReactNode` instead of `string`, but it's important that you need to import them in the file.

```tsx
import { InlineCode } from "@once-ui-system/core";
import Link from "next/link";

const person = {
  // Your content here
};
```

The imports above would let us use `InlineCode` and `Link` components in the content file.

### Personal Details

Your personal details are used across the whole app to render personalized headings, labels and images. Languages are displayed on the `/about` page, and location and time in the header.

```tsx
const person = {
    firstName: "Selene",
    lastName: "Yu",
    get name() {
      return "...";
    },
    role: "Design Engineer",
    avatar: "/images/avatar.jpg",
    location: "Asia/Jakarta", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
    languages: ["English", "Bahasa"], // optional: Leave the array empty if you don't want to display languages
};
```

### Social Links

Social links are rendered on the `/about` page and in the footer based on the array configured in the `social` object. You can set custom icons to each, but don't forget to import them in `src/once-ui/icons.ts`. Read the [Once UI documentation](https://once-ui.com/docs/icons) for more information.

```tsx
const social = [
    {
      name: "GitHub",
      icon: "github",
      link: "https://github.com/once-ui-system/nextjs-starter",
    },
    {
      name: "Email",
      icon: "email",
      link: "mailto:lorant@once-ui.com",
    },
];
```

### Pages

Each page has its own object that manages the personalized content, such as headings, subheadings, images and dynamic data.

```tsx
const home = {
    label: "Home",
    title: "Selene Yu's Portfolio",
    description: "Portfolio website showcasing my work as a Design Engineer",
    headline: <>Design engineer and builder</>,
    subline: (
      <>
        I'm Selene, a design engineer at <InlineCode>FLY</InlineCode>, where I craft intuitive
        <br /> user experiences. After hours, I build my own projects.
      </>
    ),
};
```

The `label` property is used in the header navigation. The `title` property is used for the page title and the `description` property is used for the page description. They are also used in meta- and open graph tags.

## Custom Components in Markdown

Magic Portfolio will replace some default HTML elements to Once UI components to integrate better in the design and add additional functionality. Furthermore, many common Once UI components are already imported and available for use.

### Feedback

The feedback component is used to display critical information to visitors.

```tsx
<Feedback
    icon
    variant="success"
    title="Feedback element"
    description="Longer description of the feedback message."
/>
```

### Table

Tables are used to display data in a structured format.

```tsx
<Table 
    data={{
      headers: [
        { content: "Name", key: "name", sortable: true },
        { content: "Type", key: "type", sortable: true },
        { content: "Description", key: "description" }
      ],
      rows: [
        ["title", "string", "The title of the document"],
        ["summary", "string", "A brief summary of the document content"],
        ["updatedAt", "string", "The date when the document was last updated"],
        ["navLabel", "string", "The label used in navigation menus"]
      ]
    }}
/>
```

### Code

Use the CodeBlock component to display code snippets with code highlighting, preview, and copy to clipboard functionality. Use the InlineCode component for inline code snippets.

#### CodeBlock

The code block component works based on Once UI's CodeBlock. You can access it with the complete syntax for full customization, or by using the standard markdown syntax (triple backticks) with pre-configured props.

```tsx
// Full component syntax
<CodeBlock
    codes={[
      {
        code: "console.log('Hello, World!');",
        language: "javascript",
        label: "Example"
      }
    ]}
/>

// Short syntax example
```tsx
function greeting(name) {
    return `Hello, ${name}!`;
}

console.log(greeting('World'));
```

#### InlineCode

The `InlineCode` is another Once UI component that you can access either through the complete syntax or the short syntax (backticks). Usually the standard markdown syntax is recommended, since it doesn't have that much configuration options.

```tsx
// Full component syntax
<InlineCode>
    const x = 10;
</InlineCode>

// Short syntax example
`const x = 10;`
```

### Accordion

Accordions are used to toggle between hiding and showing content.

```tsx
<AccordionGroup 
    items={[
      {
        title: "Section 1",
        content: <Text variant="body-default-s" onBackground="neutral-weak">This is the content for section 1. You can include any components here.</Text>
      },
      {
        title: "Section 2",
        content: <Text variant="body-default-s" onBackground="neutral-weak">This is the content for section 2. Accordions are great for FAQs and other expandable content.</Text>
      },
      {
        title: "Section 3",
        content: <Text variant="body-default-s" onBackground="neutral-weak">This is the content for section 3. They help save space by hiding content until needed.</Text>
      }
    ]}
/>
```

## Styling

### Global Style

Magic Portfolio's styling is based on Once UI's customization through data-attributes. You can generate a custom color palette for brand, accent and neutral colors on [Once UI](https://once-ui.com/customize) where you'll find instructions on how to apply it.

```tsx
theme:       'dark',         // dark | light
neutral:     'gray',         // sand | gray | slate
brand:       'blue',         // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
accent:      'indigo',       // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
solid:       'contrast',     // color | contrast
solidStyle:  'flat',         // flat | plastic
border:      'playful',      // rounded | playful | conservative
surface:     'translucent',  // filled | translucent
transition:  'all',          // all | micro | macro
scaling:     '100',          // 90 | 95 | 100 | 105 | 110
```

### Background Effects

There's a pre-configured background in `layout.tsx` that you can modify in the config file. Set graphic elements such as gradient, dots, lines, and grid and configure their appearance.

```tsx
const effects = {
    mask: {
      cursor: false,
      x: 50,
      y: 0,
      radius: 100
    },
    gradient: {
      display: true,
      x: 50,
      y: -25,
      width: 100,
      height: 100,
      tilt: 0,
      colorStart: 'accent-background-strong',
      colorEnd: 'static-transparent',
      opacity: 50
    },
    dots: {
      display: true,
      size: 2,
      color: 'brand-on-background-weak',
      opacity: 20
    },
    lines: {
      display: false,
      color: 'neutral-alpha-weak',
      opacity: 100
    },
    grid: {
      display: false,
      color: 'neutral-alpha-weak',
      opacity: 100,
      width: 'var(--static-space-32)',
      height: 'var(--static-space-32)'
    }
}
```

## Adding New Pages

### Blog Posts

Create new blog posts by adding a new `.mdx` file to `app/blog/posts`. All posts will be listed on the `/blog` route.

### Project Pages

Create new project pages by adding a new `.mdx` file to `app/work/projects`. All projects will be listed on the `/home` and `/work` routes.

### Custom Pages

To add a new page:

1. Create a new directory in `src/app/` with your page name
2. Add a `page.tsx` file in that directory
3. Update the routes configuration in `src/resources/once-ui.config.js`
4. Add navigation in `src/components/Header.tsx` if needed

## File Structure

```
src/
├── app/
│   ├── about/           # About page
│   ├── blog/            # Blog listing and posts
│   ├── work/            # Work/projects listing and pages
│   ├── gallery/         # Photo gallery
│   ├── music/           # Music collection (custom)
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── resources/           # Content and configuration
└── utils/              # Utility functions
```

## SEO and Metadata

Each page automatically generates:
- Meta tags for SEO
- Open Graph images
- Schema markup
- Sitemap entries

## Deployment

The portfolio is ready for deployment on Vercel, Netlify, or any other Next.js-compatible hosting platform.

## Support

For more information about Once UI components and customization, visit the [Once UI documentation](https://once-ui.com/docs).