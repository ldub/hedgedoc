/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import type { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import type { LinkWithTextProps } from './types'
import React from 'react'

/**
 * An external link.
 * This should be used for linking pages that are not part of the HedgeDoc instance.
 * The links will be opened in a new tab.
 *
 * @param href The links location
 * @param text The links text
 * @param icon An optional icon to be shown before the links text
 * @param id An id for the link object
 * @param className Additional class names added to the link object
 * @param title The title of the link
 */
export const ExternalLink: React.FC<LinkWithTextProps> = ({
  href,
  text,
  icon,
  id,
  className = 'text-light',
  title
}) => {
  return (
    <a href={href} target='_blank' rel='noopener noreferrer' id={id} className={className} title={title} dir='auto'>
      <ShowIf condition={!!icon}>
        <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true} />
        &nbsp;
      </ShowIf>
      {text}
    </a>
  )
}
