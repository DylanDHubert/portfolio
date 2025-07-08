import React from "react";

import { Heading, Flex, Text, Button, Avatar, RevealFx, Column, Badge, Row, Meta, Schema } from "@once-ui-system/core";
import { home, about, person, newsletter, baseURL, routes, heroProjects } from "@/resources";
import { Mailchimp } from "@/components";
import { Projects } from "@/components/websites/Projects";
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


      {/* Featured Projects with Live Demos */}
      <Column fillWidth gap="xl">
        <Flex fillWidth gap="xl" mobileDirection="column">
          {heroProjects.map((project, index) => (
            <Column key={index} flex={1} gap="m">
              <Heading as="h3" variant="heading-strong-l">
                {project.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {project.subtitle}
              </Text>
              <div style={{
                width: '100%',
                height: '300px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid var(--neutral-alpha-medium)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <iframe
                  src={project.href === "/websites/machinterview" ? "https://machinterview.vercel.app" : 
                       project.href === "/websites/eudaemonia-wellness" ? "https://eudaemonia.vercel.app" : ""}
                  title={`${project.title} Preview`}
                  style={{
                    border: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    width: '200%',
                    height: '200%'
                  }}
                  allow="microphone; camera"
                />
              </div>
              <Button
                href={project.href}
                variant="secondary"
                size="s"
                data-border="rounded"
                arrowIcon
              >
                View Project Details
              </Button>
            </Column>
          ))}
        </Flex>
      </Column>

      {(routes as any)["/blog"] && (
        <Flex fillWidth gap="24" mobileDirection="column">
          <Flex flex={3} paddingX="20">
            <Posts range={[1, 2]} columns="2" />
          </Flex>
        </Flex>
      )}
      {newsletter.display && <Mailchimp newsletter={newsletter} />}
    </Column>
  );
}
