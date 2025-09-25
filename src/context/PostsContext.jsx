"use client";

import { useContext, useState, createContext } from "react";

const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Building Scalable REST APIs with Node.js and Express",
      description:
        "Learn how to build scalable, maintainable REST APIs using Node.js and Express...",
      coverImage: "/imagePost1.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["NODE.JS", "EXPRESS", "REST API"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Featured",
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Code Review Workflows",
      description:
        "Explore how AI is transforming code reviews, cutting review time, spotting bugs, summarizing pull requests, and enabling smarter suggestions...",
      coverImage: "/imagePost2.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["AI", "CODE REVIEW", "DEVELOPER TOOLS"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Featured",
    },
    {
      id: 3,
      title: "Getting Started With Next.js 14",
      description:
        "A beginner-friendly guide to building a blazing fast web app with Next.js 14...",
      coverImage: "/imagePost3.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["WEB DEVELOPMENT", "NEXT JS", "FULL STACK"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 4,
      title: "What I Learned Teaching Myself to Code",
      description:
        "Teaching myself to code was messy: too many roadmaps, constant Googling, and feeling behind. But sticking to basics, building small projects, and finding a community finally helped me make real progress.",
      coverImage: "/imagePost4.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["SELF-TAUGHT DEVELOPER", "CODING JOURNEY", "WEB DEVELOPMENT"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 5,
      title: "Building Scalable REST APIs with Node.js and Express",
      description:
        "Learn how to build scalable, maintainable REST APIs using Node.js and Express. This technical guide covers project structure, routing, middleware, error handling, and best practices to create robust backends for modern applications.",
      coverImage: "/imagePost5.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["NODE.JS", "EXPRESS", "REST API"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 6,
      title: "The Power of Collaboration in Software Development",
      description:
        "Know why effective collaboration is essential in modern software development. Learn about key tools, proven strategies, and metrics to measure team success in building high-quality, maintainable software products together.",
      coverImage: "/imagePost6.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: [
        "SOFTWARE DEVELOPMENT",
        "TEAM-COLLABORATION",
        "CODING BEST PRACTICES",
      ],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 7,
      title: "Optimizing Your Postgres-Powered API: A Practical Guide",
      description:
        "An in depth guide into optimizing PostgreSQL-based APIs for performance and scalability. Covers connection pooling, smart indexing, pagination, caching, and real query analysis. Ideal for backend devs aiming to fine-tune their Postgres stack.",
      coverImage: "/imagePost7.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["POSTGRESQL", "API DESIGN", "BACKEND PERFORMANCE"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 8,
      title:
        "Why Web Accessibility Should Be a Priority in Your Development Workflow",
      description:
        "Web accessibility isn’t a luxury,it’s a necessity. Learn what accessibility means, why it matters, and how to implement best practices in your frontend development workflow to create inclusive, legally compliant, and user-friendly websites.",
      coverImage: "/imagePost8.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["WEB ACCESSIBILITY", "INCLUSIVE DESIGN", "FRONTEND DEVELOPMENT"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Trending",
    },
    {
      id: 9,
      title: "Why Edge Computing is the Silent Revolution of the Internet",
      description:
        "With AI and IoT growing rapidly, the demand for decentralized computation is no longer just a buzzword; it’s a necessity. Imagine a world where your devices don’t need to “ask the cloud” before acting. That’s what the future edge is enabling.",
      coverImage: "/imagePost9.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["#EDGECOMPUTING", "#FUTUREOFTECH", "#IOT"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Latest",
    },
    {
      id: 10,
      title: "Real-Time Web with WebSockets: A Beginner's Guide",
      description:
        "Learn how WebSockets enable real-time features like chat, live updates, and collaborative tools. This guide covers the basics, compares WebSockets to polling, and provides practical examples with Node.js and Socket.IO for developers building interact",
      coverImage: "/imagePost10.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["WEBSOCKETS", "REAL-TIME", "NODEJS"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Latest",
    },
    {
      id: 11,
      title:
        "An Introduction to Server-Side Rendering (SSR) for Web Developers",
      description:
        "Learn what Server-Side Rendering (SSR) is and why it's valuable for modern web development. This guide covers SSR basics, benefits, tradeoffs, and how to implement it with frameworks like Next.js to improve performance and SEO in real-world apps.",
      coverImage: "/imagePost11.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["SSR", "NEXT.JS", "REACT"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Latest",
    },
    {
      id: 12,
      title: "​Debugging JavaScript Effectively: Tips for Real-World Issues",
      description:
        "This post shares practical debugging techniques for JavaScript developers. Learn how to use DevTools, isolate bugs, step through async code, and prevent issues with linters. Build confidence and speed by improving how you find and fix errors.",
      coverImage: "/imagePost12.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["JAVASCRIPT", "DEBUGGING", "DEVTOOLS"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Latest",
    },
    {
      id: 13,
      title: "​Mastering Custom React Hooks: A Practical Guide",
      description:
        "Learn how to create powerful and reusable custom React hooks. This guide walks you through real examples like useFetch and useLocalStorage, and explains best practices to write cleaner, more maintainable React code with custom logic.",
      coverImage: "/imagePost13.png",
      authorName: "lazysloth",
      authorImage: "/imageProfile1.png",
      tags: ["REACT", "HOOKS", "CUSTOM HOOKS"],
      starRating: 4,
      views: 127,
      commentCount: 2,
      estimatedRead: 3,
      category: "Latest",
    },
  ]);

  return (
    <PostsContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => useContext(PostsContext);
