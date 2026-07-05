export interface BlogPost {
    title: string;
    subtitle: string;
    content: string;
    url: string;
    pubDate: string;
    editDate: string;
    secret?: boolean;
}

export async function getLatestPost(): Promise<BlogPost | null> {
    const posts = await getAllPosts();

    if (posts.length === 0) {
        return null;
    }

    return posts[0];
}

export async function getAllPosts(): Promise<BlogPost[]> {
    const posts = await import.meta.glob("../pages/devlog/*.md");

    const postEntries = Object.entries(posts);

    const allPosts: BlogPost[] = [];

    for (const [path, resolver] of postEntries) {
        const post = await resolver();

        const postData = {
            title: post.frontmatter.title,
            content: post.mdxContent,
            subtitle: post.frontmatter.subtitle,
            url: `/devlog/${post.frontmatter.slug}`,
            // TODO: why is this 1 day behind...
            pubDate: new Date(post.frontmatter.pubDate).toDateString(),
        } as BlogPost;

        if (post.frontmatter.editDate) {
            postData.editDate = new Date(post.frontmatter.editDate).toDateString();
        }

        if (post.frontmatter.secret) {
            continue;
        }

        allPosts.push(postData);
    }

    // Sort the posts by pubDate in descending order
    allPosts.sort((a, b) => {
        const aDate = new Date(a.pubDate);
        const bDate = new Date(b.pubDate);
        return bDate.getTime() - aDate.getTime(); // Sort in descending order
    });

    return allPosts;
}

// create a shared function to convert md date to datestring
