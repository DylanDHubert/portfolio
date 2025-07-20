"use client";

import { useState, useRef, useEffect } from "react";
import { Column, Text, Button, Heading } from "@once-ui-system/core";
import { music } from "@/resources";
import styles from "./Music.module.scss";
import Image from "next/image";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Loop if mouse stays
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (isPlaying && duration > 0 && currentTime >= duration - 0.1) {
      audio.currentTime = 0;
      audio.play();
    }
  }, [currentTime, duration, isPlaying]);

  const handleMouseEnter = (song: Song) => {
    if (audioRef.current) {
      if (playingSong !== song.title) {
        audioRef.current.src = song.audioFile;
        audioRef.current.currentTime = 0;
      }
      setPlayingSong(song.title);
      audioRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingSong(null);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Progress bar helpers
  const PROGRESS_BAR_HEIGHT = 4;

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
        {music.songs.map((song: Song, index: number) => {
          const isCurrent = playingSong === song.title;
          const progress = isCurrent && duration > 0 ? currentTime / duration : 0;
          return (
            <div
              key={index}
              className={`${styles.songCard} ${styles.musicCard}`}
              onMouseEnter={() => handleMouseEnter(song)}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.coverContainer}>
                {song.cover ? (
                  <Image
                    src={song.cover}
                    alt={song.title + ' cover'}
                    className={styles.coverImage}
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className={styles.coverFallback}>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {song.title}
                    </Text>
                  </div>
                )}
                <div className={styles.playButton}>
                  <Text variant="body-strong-s" onBackground="neutral-strong">
                    ▶
                  </Text>
                </div>
              </div>
              
              <div className={styles.songInfo}>
                <Text 
                  variant="body-strong-m" 
                  onBackground="brand-strong"
                  className={styles.songTitle}
                >
                  {song.title}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {song.album}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {formatDate(song.date)}
                </Text>
                
                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${progress * 100}%`,
                        transition: isCurrent ? 'width 0.2s linear' : 'none'
                      }}
                    />
                  </div>
                  <div className={styles.timeInfo}>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {isCurrent ? formatTime(currentTime) : '0:00'}
                    </Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {isCurrent ? formatTime(duration) : '0:00'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Column>
  );
} 