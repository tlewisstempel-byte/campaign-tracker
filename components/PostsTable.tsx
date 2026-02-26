import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'

type Props = { posts: Post[] }

export default function PostsTable({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg">
        No posts yet. Run a scrape to pull data.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Author</th>
            <th className="text-left px-4 py-3">Post</th>
            <th className="text-right px-4 py-3">Likes</th>
            <th className="text-right px-4 py-3">RTs</th>
            <th className="text-right px-4 py-3">Views</th>
            <th className="text-right px-4 py-3">Posted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {posts.map((post) => (
            <tr key={post.id} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="font-medium text-zinc-200">{post.author_name}</p>
                <p className="text-zinc-500 text-xs">@{post.author_handle}</p>
              </td>
              <td className="px-4 py-3 max-w-sm">
                <p className="text-zinc-300 line-clamp-2">{post.text}</p>
                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                  >
                    View on X
                  </a>
                )}
              </td>
              <td className="px-4 py-3 text-right text-zinc-300">{post.likes.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-zinc-300">{post.retweets.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-zinc-300">{post.views.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-zinc-500 whitespace-nowrap text-xs">
                {post.posted_at
                  ? formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
