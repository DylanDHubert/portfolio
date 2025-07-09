import {
  Avatar,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  IconButton,
  Media,
  Text,
  Meta,
  Schema
} from "@once-ui-system/core";
import { baseURL, about, person, social } from "@/resources";
import styles from "@/components/about/about.module.scss";
import React from "react";
import PixelatedSocialButton from "@/components/PixelatedSocialButton";



export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default function About() {
  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <Flex fillWidth mobileDirection="column" horizontal="center">
        {about.avatar.display && (
          <Column
            className={styles.avatar}
            position="sticky"
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <div className={styles.avatarGlow}>
              <Avatar src={person.avatar} size="xl" />
            </div>
            <Flex gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {person.location.replace('America/Los_Angeles', 'San Fransisco, CA')}
            </Flex>

          </Column>
        )}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column
            id={about.intro.title}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="32"
            className={styles.purpleArea}
          >

            <Heading className={`${styles.textAlign} ${styles.yellowGlow}`} variant="display-strong-xl">
              {person.name}
            </Heading>
            <Text
              className={`${styles.textAlign} ${styles.yellowGlow}`}
              variant="display-default-xs"
            >
              {person.role}
            </Text>
            {social.length > 0 && (
              <Flex className={styles.blockAlign} paddingTop="20" gap="12" wrap horizontal="center" fitWidth data-border="rounded">
                {social.map(
                  (item) =>
                    item.link && (
                        <PixelatedSocialButton
                            key={item.name}
                            type={item.icon as 'github' | 'linkedin' | 'email' | 'discord' | 'x' | 'threads'}
                            href={item.link}
                            tooltip={item.name}
                            size={28}
                        />
                    ),
                )}
              </Flex>
            )}
          </Column>

          {about.intro.display && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="32" className={styles.justifiedText}>
              {about.intro.description}
            </Column>
          )}

          {about.work.display && (
            <Column className={styles.purpleArea}>
              <Heading as="h2" id={about.work.title} variant="display-strong-s" marginBottom="m" className={styles.yellowGlow}>
                {about.work.title}
              </Heading>
              <Column fillWidth gap="l">
                {about.work.experiences.map((experience, index) => (
                    <Column key={`${experience.company}-${experience.role}-${index}`} fillWidth>
                      <Flex fillWidth horizontal="space-between" vertical="end" marginBottom="4">
                        <Flex gap="8" vertical="center">
                          <Text id={experience.company} variant="heading-strong-l" className={styles.yellowGlow}>
                            {experience.company}
                          </Text>
                        </Flex>
                        <Text variant="heading-strong-s" onBackground="neutral-weak" className={styles.yellowGlow}>
                          {experience.timeframe}
                        </Text>
                      </Flex>
                    <Text variant="body-default-l" onBackground="neutral-weak" marginBottom="m">
                      {experience.role}
                    </Text>
                    <Column as="ul" style={{ listStyle: 'none', padding: 0 }}>
                      {experience.achievements.map((achievement: JSX.Element, index: number) => (
                        <Text
                          as="li"
                          variant="body-default-s"
                          onBackground="brand-weak"
                          key={`${experience.company}-${index}`}
                          style={{ 
                            position: 'relative',
                            paddingLeft: '16px',
                            marginBottom: '4px'
                          }}
                        >
                          <span style={{ 
                            position: 'absolute', 
                            left: '0', 
                            color: 'var(--brand-on-background-weak)',
                            fontWeight: 'bold'
                          }}>
                            -
                          </span>
                          {achievement}
                        </Text>
                      ))}
                    </Column>
                    {experience.images.length > 0 && (
                      <Flex fillWidth paddingTop="m" paddingLeft="40" gap="12" wrap>
                        {experience.images.map((image, index) => (
                          <Flex
                            key={index}
                            border="neutral-medium"
                            radius="m"
                            //@ts-ignore
                            minWidth={image.width}
                            //@ts-ignore
                            height={image.height}
                          >
                            <Media
                              enlarge
                              radius="m"
                              //@ts-ignore
                              sizes={image.width.toString()}
                              //@ts-ignore
                              alt={image.alt}
                              //@ts-ignore
                              src={image.src}
                            />
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </Column>
                ))}
              </Column>
            </Column>
          )}

          {about.studies.display && (
            <Column className={styles.purpleArea}>
              <Heading as="h2" id={about.studies.title} variant="display-strong-s" marginBottom="m" className={styles.yellowGlow}>
                {about.studies.title}
              </Heading>
              <Column fillWidth gap="l">
                {about.studies.institutions.map((institution, index) => (
                  <Column key={`${institution.name}-${index}`} fillWidth gap="4">
                    <Flex gap="8" vertical="center">
                      <Text id={institution.name} variant="heading-strong-l" className={styles.yellowGlow}>
                        {institution.name}
                      </Text>
                    </Flex>
                    <Text variant="body-default-s" onBackground="brand-weak">
                      {institution.description}
                    </Text>
                  </Column>
                ))}
              </Column>
            </Column>
          )}

          {about.technical.display && (
            <Column className={styles.purpleArea}>
              <Heading
                as="h2"
                id={about.technical.title}
                variant="display-strong-s"
                marginBottom="40"
                className={styles.yellowGlow}
              >
                {about.technical.title}
              </Heading>
              <Column fillWidth gap="l">
                {about.technical.skills.map((skill, index) => (
                  <Column key={`${skill}-${index}`} fillWidth gap="4">
                    <Flex gap="8" vertical="center">
                      <Text id={skill.title} variant="heading-strong-l" className={styles.yellowGlow}>{skill.title}</Text>
                    </Flex>
                    <Text variant="body-default-s" onBackground="brand-weak">
                      {skill.description}
                    </Text>
                    {skill.images && skill.images.length > 0 && (
                      <Flex fillWidth paddingTop="m" gap="12" wrap>
                        {skill.images.map((image, index) => (
                          <Flex
                            key={index}
                            border="neutral-medium"
                            radius="m"
                            //@ts-ignore
                            minWidth={image.width}
                            //@ts-ignore
                            height={image.height}
                          >
                            <Media
                              enlarge
                              radius="m"
                              //@ts-ignore
                              sizes={image.width.toString()}
                              //@ts-ignore
                              alt={image.alt}
                              //@ts-ignore
                              src={image.src}
                            />
                          </Flex>
                        ))}
                      </Flex>
                    )}
                  </Column>
                ))}
              </Column>
            </Column>
          )}
        </Column>
      </Flex>
    </Column>
  );
}
