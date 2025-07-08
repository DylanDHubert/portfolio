"use client";

import { useState, useRef } from "react";
import { Column, Text, Button, Heading } from "@once-ui-system/core";
import { music } from "@/resources";
import styles from "./Music.module.scss";

interface Song {
  title: string;
  artist: string;
  album: string;
  date: string;
  cover: string;
  audioFile: string;
}

export default function MusicPlayer() {
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (song: Song) => {
    if (playingSong === song.title) {
      // If the same song is playing, pause it
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSong(null);
    } else {
      // If a different song is playing, stop it and play the new one
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSong(song.title);
      // In a real implementation, you would set the audio source here
      // audioRef.current.src = song.audioFile;
      // audioRef.current.play();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Column maxWidth="l" gap="xl" paddingX="l">
      <Column gap="l" horizontal="center">
        <Heading as="h1" variant="heading-strong-xl" wrap="balance">
          {music.title}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          {music.description}
        </Text>
      </Column>

      <div className={styles.grid}>
        {music.songs.map((song: Song, index: number) => (
          <div
            key={index}
            className={styles.songCard}
          >
            <Column gap="m" padding="l" background="surface" border="neutral-alpha-weak" radius="m-4" shadow="s">
              <div className={styles.coverContainer}>
                <div className={styles.cover}>
                  <div className={styles.coverFallback}>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {song.title}
                    </Text>
                  </div>
                </div>
                <Button
                  className={styles.playButton}
                  variant="primary"
                  size="s"
                  onClick={() => handlePlay(song)}
                  prefixIcon={playingSong === song.title ? "pause" : "play"}
                />
              </div>

              <Column gap="s">
                <Text variant="body-strong-m" onBackground="brand-strong">
                  {song.title}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {song.artist}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {song.album}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {formatDate(song.date)}
                </Text>
              </Column>
            </Column>
          </div>
        ))}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </Column>
  );
} 