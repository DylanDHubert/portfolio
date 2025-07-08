import React from "react";
import { Column, Meta, Schema } from "@once-ui-system/core";
import { home, person, baseURL } from "@/resources";
import { CRTTV } from "@/components";

export default function Home() {
  return (
    <Column maxWidth="m" gap="xl" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/about`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      {/* CRT TV Interface */}
      <CRTTV />
    </Column>
  );
}
