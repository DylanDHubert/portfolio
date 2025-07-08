"use client";

import { useState } from "react";
import { Flex, Button, Icon } from "@once-ui-system/core";
import styles from "./DemoModal.module.scss";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoUrl: string;
  title: string;
}

export default function DemoModal({ isOpen, onClose, demoUrl, title }: DemoModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iframeContainer}>
          <iframe
            src={demoUrl}
            title={`${title} Demo`}
            className={styles.iframe}
            allow="microphone; camera"
            style={{
              transform: 'scale(0.6)',
              transformOrigin: 'top left',
              width: '166.67%',
              height: '166.67%'
            }}
          />
        </div>
        <Button
          className={styles.closeButton}
          variant="tertiary"
          size="s"
          onClick={onClose}
          prefixIcon="close"
        />
      </div>
    </div>
  );
} 