
import { PostCard } from "./PostCard";

const samplePosts = [
  {
    id: "1",
    title: "Just built my first React app with TypeScript! 🎉",
    content: "After months of learning, I finally completed my first full-stack application using React, TypeScript, and Node.js. The journey was challenging but incredibly rewarding. I learned so much about state management, API integration, and proper TypeScript patterns.",
    author: "devlearner23",
    subreddit: "reactjs",
    upvotes: 847,
    comments: 92,
    timeAgo: "3 hours ago",
  },
  {
    id: "2",
    title: "TIL that JavaScript's Array.sort() converts elements to strings by default",
    content: "I was debugging for hours wondering why [1, 10, 2, 20].sort() was returning [1, 10, 2, 20] instead of [1, 2, 10, 20]. Turns out sort() converts elements to strings first! You need to provide a compare function for numeric sorting.",
    author: "todayilearned_user",
    subreddit: "javascript",
    upvotes: 1243,
    comments: 156,
    timeAgo: "5 hours ago",
  },
  {
    id: "3",
    title: "What's the best way to handle authentication in modern web apps?",
    content: "I'm building a new web application and trying to decide between different authentication strategies. Should I use JWT tokens, sessions, or something else? What are the security implications of each approach?",
    author: "securityfirst",
    subreddit: "webdev",
    upvotes: 672,
    comments: 234,
    timeAgo: "7 hours ago",
  },
  {
    id: "4",
    title: "The future of programming: AI-assisted development",
    content: "With tools like GitHub Copilot and ChatGPT becoming more prevalent, how do you think the role of developers will evolve? Are we heading towards a future where coding becomes more about prompt engineering than traditional programming?",
    author: "futuretech",
    subreddit: "programming",
    upvotes: 2156,
    comments: 445,
    timeAgo: "12 hours ago",
  },
  {
    id: "5",
    title: "CSS Grid vs Flexbox: When to use what?",
    content: "I still get confused about when to use CSS Grid versus Flexbox. I know Grid is for 2D layouts and Flexbox is for 1D, but in practice, the decision isn't always clear. Any practical guidelines?",
    author: "cssnewbie",
    subreddit: "webdev",
    upvotes: 934,
    comments: 178,
    timeAgo: "1 day ago",
  },
];

export const PostFeed = () => {
  return (
    <div className="flex-1 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button className="px-4 py-2 bg-white border rounded-full text-sm font-medium hover:bg-gray-50 border-gray-300">
            🔥 Hot
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            🆕 New
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            ⭐ Top
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium">
            🌅 Rising
          </button>
        </div>
      </div>
      
      <div className="space-y-0">
        {samplePosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
};
