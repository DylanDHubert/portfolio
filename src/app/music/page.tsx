import { Meta, Schema } from "@once-ui-system/core";
import { music, baseURL, person } from "@/resources";
import MusicPlayer from "./MusicPlayer";

export async function generateMetadata() {
  return Meta.generate({
    title: music.title,
    description: music.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(music.title)}`,
    path: music.path,
  });
}

export default function MusicPage() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={music.title}
        description={music.description}
        path={music.path}
        image={`/api/og/generate?title=${encodeURIComponent(music.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${music.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <MusicPlayer />
    </>
  );
} 