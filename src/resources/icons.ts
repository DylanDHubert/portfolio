import { IconType } from "react-icons";

import {
  HiArrowUpRight,
  HiOutlineLink,
  HiArrowTopRightOnSquare,
  HiEnvelope,
  HiCalendarDays,
  HiArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineDocument,
  HiOutlineGlobeAsiaAustralia,
  HiOutlineRocketLaunch,
  HiPlay,
  HiPause,
} from "react-icons/hi2";

import {
  PiHouseDuotone,
  PiUserCircleDuotone,
  PiGridFourDuotone,
  PiBookBookmarkDuotone,
  PiImageDuotone,
  PiMusicNotesDuotone,
} from "react-icons/pi";

import { FaDiscord, FaGithub, FaLinkedin, FaX, FaThreads } from "react-icons/fa6";

// Import Lucide React icons for mobile navigation and social icons
import { 
  FileType2, 
  FileAudio, 
  FileImage, 
  FileBadge, 
  FileCode2,
  FileKey,
  AlertTriangle,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Tv,
  Sun,
  Moon,
  Lightbulb
} from "lucide-react";

export const iconLibrary: Record<string, IconType> = {
  arrowUpRight: HiArrowUpRight,
  arrowRight: HiArrowRight,
  email: HiEnvelope,
  globe: HiOutlineGlobeAsiaAustralia,
  person: PiUserCircleDuotone,
  grid: PiGridFourDuotone,
  book: PiBookBookmarkDuotone,
  openLink: HiOutlineLink,
  calendar: HiCalendarDays,
  home: Tv,
  gallery: PiImageDuotone,
  music: PiMusicNotesDuotone,
  play: HiPlay,
  pause: HiPause,
  discord: FaDiscord,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaX,
  threads: FaThreads,
  arrowUpRightFromSquare: HiArrowTopRightOnSquare,
  document: HiOutlineDocument,
  rocket: HiOutlineRocketLaunch,
  // Lucide React icons for mobile navigation
  fileType2: FileType2,
  fileAudio: FileAudio,
  fileImage: FileImage,
  fileBadge: FileBadge,
  fileCode2: FileCode2,
  fileKey: FileKey,
  alertTriangle: AlertTriangle,
  warning: AlertTriangle,
  // Lucide React social icons
  lucideGithub: Github,
  lucideLinkedin: Linkedin,
  lucideMail: Mail,
  lucideDiscord: MessageCircle,
  lucideTwitter: Twitter,
  sun: Lightbulb,
  moon: Moon,
  lightbulb: Lightbulb,
  light: Lightbulb,
  dark: Moon
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;