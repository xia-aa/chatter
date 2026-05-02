import {
  OcticonCaution,
  OcticonImportant,
  OcticonNote,
  OcticonTip,
  OcticonWarning,
} from './icons'

export const githubAlertTypeMap = {
  note: {
    type: 'note',
    icon: OcticonNote,
    label: 'Note',
    match: '[!NOTE]',
    shortcutRegexp: /^>Note\s/,
  },
  tip: {
    type: 'tip',
    icon: OcticonTip,
    label: 'Tip',
    match: '[!TIP]',
    shortcutRegexp: /^>Tip\s/,
  },
  important: {
    type: 'important',
    icon: OcticonImportant,
    label: 'Important',
    match: '[!IMPORTANT]',
    shortcutRegexp: /^>Important\s/,
  },
  warning: {
    type: 'warning',
    icon: OcticonWarning,
    label: 'Warning',
    match: '[!WARNING]',
    shortcutRegexp: /^>Warning\s/,
  },
  caution: {
    type: 'caution',
    icon: OcticonCaution,
    label: 'Caution',
    match: '[!CAUTION]',
    shortcutRegexp: /^>Caution\s/,
  },
} as const

export const githubAlertTypeKeys = Object.keys(
  githubAlertTypeMap,
) as Array<GithubAlertType>

export type GithubAlertType =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
