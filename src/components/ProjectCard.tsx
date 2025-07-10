"use client";

import { useState } from "react";
import {
  AvatarGroup,
  Carousel,
  Column,
  Flex,
  Heading,
  SmartLink,
  Text,
  Button,
} from "@once-ui-system/core";
import DemoModal from "./DemoModal";
import styles from "./ProjectCard.module.scss";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
  demoUrl?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  content,
  description,
  avatars,
  link,
  demoUrl,
}) => {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <Column fillWidth gap="m">
      {demoUrl && showDemo ? (
        <div className={styles.purpleDemoArea}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '500px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid var(--neutral-alpha-medium)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <iframe
              src={demoUrl}
              title={`${title} Demo`}
              style={{
                border: 'none',
                transform: 'scale(0.6)',
                transformOrigin: 'top left',
                width: '166.67%',
                height: '166.67%'
              }}
              allow="microphone; camera"
            />
            <Button
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              variant="tertiary"
              size="s"
              onClick={() => setShowDemo(false)}
              prefixIcon="close"
            />
          </div>
        </div>
      ) : (
        <Carousel
          sizes="(max-width: 960px) 100vw, 960px"
          items={images.map((image) => ({
            slide: image,
            alt: title,
          }))}
        />
      )}
      <Flex
        mobileDirection="column"
        fillWidth
        paddingX="s"
        paddingTop="12"
        paddingBottom="24"
        gap="l"
      >
        {title && (
          <Flex flex={5}>
            <Heading as="h2" wrap="balance" variant="heading-strong-xl" className={styles.yellowGlow}>
              {title}
            </Heading>
          </Flex>
        )}
        {(avatars?.length > 0 || description?.trim() || content?.trim()) && (
          <Column flex={7} gap="16">
            {avatars?.length > 0 && <AvatarGroup avatars={avatars} size="m" reverse />}
            {description?.trim() && (
              <Text wrap="balance" variant="body-default-s" onBackground="neutral-weak">
                {description}
              </Text>
            )}
                        <Flex gap="24" wrap>
              {demoUrl && (
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => setShowDemo(true)}
                  prefixIcon="play"
                  className={`${styles.yellowGlowButton} ${showDemo ? styles.activeDemo : ''}`}
                >
                  TRY LIVE DEMO
                </Button>
              )}
              {link && (
                <SmartLink
                  suffixIcon="arrowUpRightFromSquare"
                  style={{ margin: "0", width: "fit-content" }}
                  href={link}
                  className={styles.yellowGlowLink}
                >
                  <Text variant="body-default-s" className={styles.yellowGlowText}>VIEW PROJECT</Text>
                </SmartLink>
              )}
            </Flex>
          </Column>
        )}
      </Flex>
      
    </Column>
  );
};
