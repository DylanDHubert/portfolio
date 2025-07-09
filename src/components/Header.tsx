"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Flex, Line, ToggleButton } from "@once-ui-system/core";

import { routes, display, person, about, blog, work, gallery, music } from "@/resources";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

export const Header = () => {
  const pathname = usePathname() ?? "";

  return (
    <>
      <Fade hide="s" fillWidth position="fixed" height="80" zIndex={9} />
      <Fade show="s" fillWidth position="fixed" bottom="0" to="top" height="80" zIndex={9} />
      <Flex
        fitHeight
        position="unset"
        className={styles.position}
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
      >
        <Flex paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
          <Logo size="s" showText={false} />
        </Flex>
        <Flex fillWidth horizontal="center">
          <Flex
            className={styles.navBarBackground}
            radius="m-4"
            padding="4"
            horizontal="center"
            zIndex={1}
          >
            <Flex gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning>
              {routes["/"] && (
                <ToggleButton 
                  prefixIcon="home" 
                  href="/" 
                  selected={pathname === "/"} 
                  className={styles.glowyNavButton}
                  data-selected={pathname === "/"}
                />
              )}
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              {routes["/about"] && (
                <>
                  <ToggleButton
                    className={`s-flex-hide ${styles.glowyNavButton}`}
                    href="/about"
                    label={about.label}
                    selected={pathname === "/about"}
                    data-selected={pathname === "/about"}
                  />
                  <ToggleButton
                    className={`s-flex-show ${styles.glowyNavButton}`}
                    href="/about"
                    selected={pathname === "/about"}
                    data-selected={pathname === "/about"}
                    prefixIcon="fileBadge"
                  />
                </>
              )}
              {routes["/websites"] && (
                <>
                  <ToggleButton
                    className={`s-flex-hide ${styles.glowyNavButton}`}
                    href="/websites"
                    label={work.label}
                    selected={pathname.startsWith("/websites")}
                    data-selected={pathname.startsWith("/websites")}
                  />
                  <ToggleButton
                    className={`s-flex-show ${styles.glowyNavButton}`}
                    href="/websites"
                    selected={pathname.startsWith("/websites")}
                    data-selected={pathname.startsWith("/websites")}
                    prefixIcon="fileCode2"
                  />
                </>
              )}
              {routes["/blog"] && (
                <>
                  <ToggleButton
                    className={`s-flex-hide ${styles.glowyNavButton}`}
                    href="/blog"
                    label={blog.label}
                    selected={pathname.startsWith("/blog")}
                    data-selected={pathname.startsWith("/blog")}
                  />
                  <ToggleButton
                    className={`s-flex-show ${styles.glowyNavButton}`}
                    href="/blog"
                    selected={pathname.startsWith("/blog")}
                    data-selected={pathname.startsWith("/blog")}
                    prefixIcon="fileType2"
                  />
                </>
              )}
              {routes["/gallery"] && (
                <>
                  <ToggleButton
                    className={`s-flex-hide ${styles.glowyNavButton}`}
                    href="/gallery"
                    label={gallery.label}
                    selected={pathname.startsWith("/gallery")}
                    data-selected={pathname.startsWith("/gallery")}
                  />
                  <ToggleButton
                    className={`s-flex-show ${styles.glowyNavButton}`}
                    href="/gallery"
                    selected={pathname.startsWith("/gallery")}
                    data-selected={pathname.startsWith("/gallery")}
                    prefixIcon="fileImage"
                  />
                </>
              )}
              {routes["/music"] && (
                <>
                  <ToggleButton
                    className={`s-flex-hide ${styles.glowyNavButton}`}
                    href="/music"
                    label={music.label}
                    selected={pathname.startsWith("/music")}
                    data-selected={pathname.startsWith("/music")}
                  />
                  <ToggleButton
                    className={`s-flex-show ${styles.glowyNavButton}`}
                    href="/music"
                    selected={pathname.startsWith("/music")}
                    data-selected={pathname.startsWith("/music")}
                    prefixIcon="fileAudio"
                  />
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex hide="s">{display.time && <TimeDisplay timeZone={person.location} />}</Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
