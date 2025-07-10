import { getPosts } from '@/utils/utils';
import { Grid } from '@once-ui-system/core';
import Post from './Post';

interface SideBySidePostsProps {
    post1Slug: string;
    post2Slug: string;
    thumbnail?: boolean;
    direction?: 'row' | 'column';
}

export function SideBySidePosts({
    post1Slug,
    post2Slug,
    thumbnail = false,
    direction
}: SideBySidePostsProps) {
    let allBlogs = getPosts(['src', 'app', 'blog', 'posts']);
    
    const post1 = allBlogs.find(post => post.slug === post1Slug);
    const post2 = allBlogs.find(post => post.slug === post2Slug);
    
    const posts = [post1, post2].filter(Boolean);

    return (
        <>
            {posts.length > 0 && (
                <Grid
                    columns="2" mobileColumns="1"
                    fillWidth marginBottom="32" gap="24">
                    {posts.map((post) => post && (
                        <Post
                            key={post.slug}
                            post={post}
                            thumbnail={thumbnail}
                            direction={direction}
                        />
                    ))}
                </Grid>
            )}
        </>
    );
} 