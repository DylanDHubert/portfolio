import React from "react";
import { Column, Heading, Text, Meta, Schema } from "@once-ui-system/core";
import { person, baseURL } from "@/resources";

export default function RAGPage() {
  return (
    <Column maxWidth="m" gap="xl" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path="/rag"
        title="RAG Chat - Ask About Dylan"
        description="Chat with an AI assistant that knows everything about Dylan Hubert's background, projects, and experience"
        image={`/api/og/generate?title=${encodeURIComponent("RAG Chat - Ask About Dylan")}`}
        author={{
          name: person.name,
          url: `${baseURL}/about`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      <Column fillWidth paddingY="24" gap="m">
        <Heading variant="display-strong-l">
          Ask Me Anything
        </Heading>
        <Text variant="heading-default-xl" onBackground="neutral-weak">
          Chat with an AI that knows everything about my background, projects, and experience
        </Text>
      </Column>

      {/* Chat interface will go here */}
      <Column fillWidth gap="m">
        <Text>Chat interface coming soon...</Text>
      </Column>
    </Column>
  );
} 