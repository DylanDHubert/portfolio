"use client";

import { useState, useRef, useEffect } from "react";
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

  // SVG circle progress helpers
  const CIRCLE_RADIUS = 70;
  const CIRCLE_STROKE = 6;
  const CIRCLE_CIRCUM = 2 * Math.PI * CIRCLE_RADIUS;

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
      <div className={styles.grid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
        {music.songs.map((song: Song, index: number) => {
          const isCurrent = playingSong === song.title;
          const progress = isCurrent && duration > 0 ? currentTime / duration : 0;
          return (
            <div
              key={index}
              className={styles.songCard}
              style={{ marginBottom: 0, background: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{ position: 'relative', width: 2 * CIRCLE_RADIUS, height: 2 * CIRCLE_RADIUS, margin: '0 auto', cursor: 'pointer' }}
                onMouseEnter={() => handleMouseEnter(song)}
                onMouseLeave={handleMouseLeave}
              >
                <svg width={2 * CIRCLE_RADIUS} height={2 * CIRCLE_RADIUS} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                  <circle
                    cx={CIRCLE_RADIUS}
                    cy={CIRCLE_RADIUS}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={CIRCLE_STROKE}
                    opacity={0.18}
                  />
                  <circle
                    cx={CIRCLE_RADIUS}
                    cy={CIRCLE_RADIUS}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={CIRCLE_STROKE}
                    strokeDasharray={CIRCLE_CIRCUM}
                    strokeDashoffset={CIRCLE_CIRCUM * (1 - progress)}
                    style={{ transition: isCurrent ? 'stroke-dashoffset 0.2s linear' : undefined }}
                  />
                </svg>
                <div
                  className={styles.cover}
                  style={{
                    width: 2 * (CIRCLE_RADIUS - CIRCLE_STROKE),
                    height: 2 * (CIRCLE_RADIUS - CIRCLE_STROKE),
                    background: '#222',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: CIRCLE_STROKE,
                    left: CIRCLE_STROKE,
                  }}
                >
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt={song.title + ' cover'}
                      className={styles.coverImage}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <div className={styles.coverFallback}>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {song.title}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ width: 2 * CIRCLE_RADIUS, textAlign: 'center', marginTop: 16 }}>
                <Text variant="body-strong-m" onBackground="brand-strong">
                  {song.title}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {song.album}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {formatDate(song.date)}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Column>
  );
} 