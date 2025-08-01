"use client";

import { Column, Flex, Heading, Media, SmartLink, Tag, Text } from '@once-ui-system/core';
import styles from './Posts.module.scss';
import { formatDate } from '@/utils/formatDate';

interface PostProps {
    post: any;
    thumbnail: boolean;
    direction?: "row" | "column";
}

export default function Post({ post, thumbnail, direction }: PostProps) {
    return (
        <SmartLink
            fillWidth
            unstyled
            style={{ borderRadius: 'var(--radius-l)' }}
            key={post.slug}
            href={`/blog/${post.slug}`}>
            <Flex
                position="relative"
                transition="micro-medium"
                direction={direction}
                radius="l"
                className={`${styles.hover} ${styles.blogPostContainer}`}
                mobileDirection="column"
                fillWidth>
                {post.metadata.image && thumbnail && (
                    <Media
                        priority
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 640px"
                        border="neutral-alpha-weak"
                        cursor="interactive"
                        radius="l"
                        src={post.metadata.image}
                        alt={'Thumbnail of ' + post.metadata.title}
                        aspectRatio="16 / 9"
                    />
                )}
                <Column
                    position="relative"
                    fillWidth gap="16"
                    padding="24"
                    vertical="center">
                    <Heading
                        as="h2"
                        variant="heading-strong-l"
                        wrap="nowrap"
                        className={styles.yellowGlow}
                        style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          padding: '0 8px'
                        }}>
                        {post.metadata.title}
                    </Heading>
                    {post.metadata.summary && (
                        <Text
                            variant="body-default-s"
                            onBackground="neutral-weak"
                            wrap="nowrap"
                            style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              padding: '0 8px',
                              color: '#ffffff'
                            }}>
                            {post.metadata.summary}
                        </Text>
                    )}
                    <Text
                        variant="label-default-s"
                        onBackground="neutral-weak">
                        {formatDate(post.metadata.publishedAt, false)}
                    </Text>
                    {(post.metadata.tag || post.metadata.tags) && (
                        <Flex gap="8" wrap>
                            {post.metadata.tag && (
                                <Tag
                                    className={styles.yellowGlowTag}
                                    label={post.metadata.tag}
                                    variant="neutral" />
                            )}
                            {post.metadata.tags && post.metadata.tags.map((tag: string, index: number) => (
                                <Tag
                                    key={index}
                                    className={styles.yellowGlowTag}
                                    label={tag}
                                    variant="neutral" />
                            ))}
                        </Flex>
                    )}
                </Column>
            </Flex>
        </SmartLink>
    );
}