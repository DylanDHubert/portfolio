import React from "react";

import { Heading, Flex, Text, Button, Avatar, RevealFx, Column, Badge, Row, Meta, Schema } from "@once-ui-system/core";
import { home, about, person, newsletter, baseURL, routes, heroProjects } from "@/resources";
import { Mailchimp } from "@/components";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";

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
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column fillWidth paddingY="24" gap="m">
        <Column maxWidth="s">
          <RevealFx fillWidth horizontal="start" paddingTop="16" paddingBottom="32" paddingLeft="12">
            <Flex gap="12" wrap="wrap">
              {heroProjects.map((project, index) => (
                <Button
                  key={index}
                  href={project.href}
                  variant="secondary"
                  size="s"
                  data-border="rounded"
                >
                  <strong>{project.title}</strong>
                  <span style={{ marginLeft: "0.5rem", opacity: 0.8 }}>{project.subtitle}</span>
                </Button>
              ))}
            </Flex>
          </RevealFx>
          <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.4} horizontal="start" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Flex gap="8" vertical="center" paddingRight="4">
                {about.avatar.display && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                {about.title}
              </Flex>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      {/* Project Sections */}
      <RevealFx translateY="16" delay={0.6}>
        <Column fillWidth gap="xl">
          {/* pb&j Section */}
          <Column fillWidth padding="l" background="surface" radius="l">
            <Heading as="h2" variant="display-strong-s" marginBottom="m">
              pb&j
            </Heading>
            <Text variant="heading-default-l" onBackground="neutral-weak" marginBottom="l">
              RAG System Data Pipeline
            </Text>
            <Text onBackground="neutral-weak">
              A comprehensive data pipeline for processing and preparing documents for retrieval-augmented generation systems.
            </Text>
          </Column>

          {/* farm Section */}
          <Column fillWidth padding="l" background="surface" radius="l">
            <Heading as="h2" variant="display-strong-s" marginBottom="m">
              farm
            </Heading>
            <Text variant="heading-default-l" onBackground="neutral-weak" marginBottom="l">
              RAG System Retrieval Agent
            </Text>
            <Text onBackground="neutral-weak">
              An intelligent retrieval agent that efficiently searches and retrieves relevant information from document collections.
            </Text>
          </Column>

          {/* eudaemonia Section */}
          <Column fillWidth padding="l" background="surface" radius="l">
            <Heading as="h2" variant="display-strong-s" marginBottom="m">
              eudaemonia
            </Heading>
            <Text variant="heading-default-l" onBackground="neutral-weak" marginBottom="l">
              Personal Wellness Tracker
            </Text>
            <Text onBackground="neutral-weak">
              A comprehensive wellness tracking application designed to help users monitor and improve their overall well-being.
            </Text>
          </Column>

          {/* NASA Section */}
          <Column fillWidth padding="l" background="surface" radius="l">
            <Heading as="h2" variant="display-strong-s" marginBottom="m">
              NASA
            </Heading>
            <Text variant="heading-default-l" onBackground="neutral-weak" marginBottom="l">
              Machine Learning Research
            </Text>
            <Text onBackground="neutral-weak">
              Advanced machine learning research projects including TSI prediction and 3D cloud modeling at NASA Goddard Space Flight Center.
            </Text>
          </Column>
        </Column>
      </RevealFx>

      {routes["/blog"] && (
        <Flex fillWidth gap="24" mobileDirection="column">
          <Flex flex={1} paddingLeft="l" paddingTop="24">
            <Heading as="h2" variant="display-strong-xs" wrap="balance">
              Latest from the blog
            </Heading>
          </Flex>
          <Flex flex={3} paddingX="20">
            <Posts range={[1, 2]} columns="2" />
          </Flex>
        </Flex>
      )}
      {newsletter.display && <Mailchimp newsletter={newsletter} />}
    </Column>
  );
}
