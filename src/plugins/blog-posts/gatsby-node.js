exports.onPreInit = ({ reporter }) => reporter.info('Initialized blog-posts plugin');

/**
 * Dynamically create pages for blog posts
 */
exports.createPages = async ({ reporter, graphql, actions }, pluginOptions) => {
  const { createPage } = actions
  const { authorId, blogPathPrefix = '/blog' } = pluginOptions

  if (!authorId) {
    reporter.panic('A Contentful author ID is required to retrieve blog posts');
  }

  const blogPost = require.resolve('./templates/blog-post.js')
  const result = await graphql(
    `
      query AuthorPosts($authorId: String) {
        allContentfulBlogPost(filter: { author: { contentful_id: { eq: $authorId } } }) {
          edges {
            node {
              title
              slug
            }
          }
        }
      }
    `,
    {
      authorId
    }
  );

  if (result.errors) {
    reporter.panic('Could not retrieve blog posts', result.errors)
  }

  const posts = result.data.allContentfulBlogPost.edges
  posts.forEach(post => {
    createPage({
      path: `${blogPathPrefix}/${post.node.slug}/`,
      component: blogPost,
      context: {
        slug: post.node.slug,
      },
    })
  })

  reporter.info(`Generated ${posts.length} blog posts using template`);
}
