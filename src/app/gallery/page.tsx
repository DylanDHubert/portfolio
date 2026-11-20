import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import GalleryWall from "@/components/gallery/GalleryWall";
import styles from "@/components/gallery/Gallery.module.scss";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

export default function Gallery() {
  return (
    <Column maxWidth="l" horizontal="center" fillWidth>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <div className={styles.page}>
        <div className={styles.intro}>
          <Heading variant="display-strong-s">Gallery</Heading>
          <p className={styles.introText}>
            {gallery.medium}. Click any piece to look closer. <span className={styles.count}>{gallery.images.length} pieces</span>
          </p>
        </div>
        <GalleryWall />
      </div>
    </Column>
  );
}
