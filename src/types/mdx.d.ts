declare module '*.mdx' {
  import type { ComponentType } from 'react'

  // The default export is a React component that renders the MDX content.
  const MDXComponent: ComponentType<any>
  export default MDXComponent

  // If you use remark-mdx-frontmatter, the frontmatter will be exported like this:
  export const frontmatter: any
}
