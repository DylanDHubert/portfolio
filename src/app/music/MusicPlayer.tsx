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

  const handlePlay = (song: Song) => {
    if (playingSong === song.title) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.audioFile;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setPlayingSong(song.title);
    }
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

      <div className={styles.grid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {music.songs.map((song: Song, index: number) => (
          <div
            key={index}
            className={styles.songCard}
            style={{ marginBottom: 0, background: 'none', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  className={styles.cover}
                  style={{ aspectRatio: '1 / 1', width: 140, height: 140, background: '#222', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                  tabIndex={0}
                >
                  {song.cover ? (
                    <img
                      src={song.cover}
                      alt={song.title + ' cover'}
                      className={styles.coverImage}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1 / 1' }}
                    />
                  ) : (
                    <div className={styles.coverFallback}>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {song.title}
                      </Text>
                    </div>
                  )}
                </div>
                <div style={{ width: 140, textAlign: 'center', marginTop: 8 }}>
                  <Text variant="body-strong-m" onBackground="brand-strong">
                    {song.title}
                  </Text>
                </div>
              </div>
              <Column gap="m" style={{ flex: 1 }}>
                <Column gap="s">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, minHeight: 32 }}>
                  <span style={{ fontSize: 12, minWidth: 32 }}>
                    {playingSong === song.title ? formatTime(currentTime) : '0:00'}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={playingSong === song.title ? duration || 1 : 1}
                    step={0.1}
                    value={playingSong === song.title ? currentTime : 0}
                    onChange={playingSong === song.title ? handleSeek : undefined}
                    style={{ flex: 1 }}
                    disabled={playingSong !== song.title}
                  />
                  <span style={{ fontSize: 12, minWidth: 32 }}>
                    {playingSong === song.title ? formatTime(duration) : formatTime(0)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                    <Button
                      className={styles.playButton}
                      variant="primary"
                      size="s"
                      onClick={() => handlePlay(song)}
                      prefixIcon={playingSong === song.title && isPlaying ? "pause" : "play"}
                    />
                  </div>
                </div>
              </Column>
            </div>
          </div>
        ))}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} loop />
    </Column>
  );
} 