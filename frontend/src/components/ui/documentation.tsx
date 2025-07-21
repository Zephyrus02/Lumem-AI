"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  Search,
  X,
} from "lucide-react";
import { AppDock } from "./dock";
import documentationJson from "@/assets/data/documentation.json";

// Types for our documentation data
type Chapter = {
  id: string;
  title: string;
  topics: Topic[];
};

type Topic = {
  id: string;
  title: string;
  content: any; // This will be transformed from JSON to React components
};

// Function to transform JSON content into React components
function renderContent(content: any): React.ReactNode {
  if (!content) return null;

  return (
    <div>
      {content.title && (
        <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
      )}

      {content.paragraphs &&
        content.paragraphs.map((paragraph: string, idx: number) => (
          <p key={idx} className="mb-4">
            {paragraph}
          </p>
        ))}

      {content.description && <p className="mb-4">{content.description}</p>}

      {content.sections &&
        content.sections.map((section: any, idx: number) => (
          <div key={idx}>
            {section.title && (
              <h3 className="text-xl font-bold mb-2 mt-6">{section.title}</h3>
            )}

            {section.type === "ordered-list" && (
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                {section.items.map((item: string, itemIdx: number) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ol>
            )}

            {section.type === "unordered-list" && (
              <ul className="list-disc pl-6 mb-4 space-y-1">
                {section.items.map((item: string, itemIdx: number) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            )}

            {section.type === "code" && (
              <div className="bg-black/40 p-4 rounded-md mb-6">
                <pre className="text-sm text-white/80 whitespace-pre-wrap">
                  {section.content}
                </pre>
              </div>
            )}

            {section.type === "alert" && (
              <div
                className={`bg-${section.alertType}-500/10 border border-${section.alertType}-500/20 rounded-md p-4 mb-6`}
              >
                <h4 className="font-semibold mb-2">{section.alertTitle}</h4>
                <p>{section.alertContent}</p>
              </div>
            )}
          </div>
        ))}

      {content.shortcuts && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {content.shortcuts.map((shortcutSection: any, idx: number) => (
            <div key={idx} className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold mb-2">
                {shortcutSection.title}
              </h3>
              <div className="bg-black/40 rounded-md p-4 space-y-3">
                {shortcutSection.items.map((item: any, itemIdx: number) => (
                  <div
                    key={itemIdx}
                    className="flex justify-between items-center"
                  >
                    <span>{item.action}</span>
                    <div>
                      {item.keys.map((key: string, keyIdx: number) => (
                        <span key={keyIdx}>
                          <span className="bg-white/10 px-2 py-1 rounded text-white/90">
                            {key}
                          </span>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="text-white/50 mx-1">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Transform the imported JSON into our component-ready format
const documentationData: Chapter[] = documentationJson.map((chapter: any) => ({
  ...chapter,
  topics: chapter.topics.map((topic: any) => ({
    ...topic,
    content: renderContent(topic.content),
  })),
}));

type SearchResult = {
  chapterId: string;
  topicId: string;
  chapterTitle: string;
  topicTitle: string;
};

// Elegant decorative shape component from hero
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function DocumentationPage() {
  const [activeChapter, setActiveChapter] = useState<string>(
    documentationData[0].id
  );
  const [activeTopic, setActiveTopic] = useState<string>(
    documentationData[0].topics[0].id
  );
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({
    [documentationData[0].id]: true,
  });
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Find current chapter and topic
  const currentChapter = documentationData.find(
    (chapter) => chapter.id === activeChapter
  );
  const currentTopic = currentChapter?.topics.find(
    (topic) => topic.id === activeTopic
  );

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    setIsSearching(true);

    // Search through all chapters and topics
    const results: SearchResult[] = [];
    documentationData.forEach((chapter) => {
      // Search in chapter titles
      if (chapter.title.toLowerCase().includes(query)) {
        chapter.topics.forEach((topic) => {
          results.push({
            chapterId: chapter.id,
            topicId: topic.id,
            chapterTitle: chapter.title,
            topicTitle: topic.title,
          });
        });
      } else {
        // Search in topic titles
        chapter.topics.forEach((topic) => {
          if (topic.title.toLowerCase().includes(query)) {
            results.push({
              chapterId: chapter.id,
              topicId: topic.id,
              chapterTitle: chapter.title,
              topicTitle: topic.title,
            });
          }
        });
      }
    });

    setSearchResults(results);
  }, [searchQuery]);

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    setActiveChapter(result.chapterId);
    setActiveTopic(result.topicId);
    setExpandedChapters((prev) => ({
      ...prev,
      [result.chapterId]: true,
    }));
    setSearchQuery("");
    setIsSearching(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#030303] text-neutral-200 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.08]"
          className="left-[-10%] md:left-[-5%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="from-rose-500/[0.08]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={200}
          height={60}
          rotate={-8}
          gradient="from-violet-500/[0.08]"
          className="left-[5%] md:left-[10%] bottom-[20%] md:bottom-[25%]"
        />
      </div>

      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Left Sidebar - Chapters */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{
            x: isSidebarVisible ? 0 : -280,
            opacity: isSidebarVisible ? 1 : 0,
            width: isSidebarVisible ? "280px" : "0px",
          }}
          transition={{ duration: 0.3 }}
          className="h-full border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-400" />
            <h2 className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              Documentation
            </h2>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-40">
            {/* Search Results */}
            {isSearching ? (
              <div className="py-2">
                <div className="px-4 py-1 text-xs uppercase text-neutral-500 font-semibold">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="mt-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.chapterId}-${result.topicId}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      >
                        <div className="text-indigo-300">
                          {result.topicTitle}
                        </div>
                        <div className="text-xs text-neutral-500">
                          in {result.chapterTitle}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-sm text-neutral-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              // Regular Chapter/Topic List
              <>
                {documentationData.map((chapter, idx) => (
                  <motion.div
                    key={chapter.id}
                    className="mb-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + idx * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center justify-between",
                        "hover:bg-white/5 transition-colors",
                        chapter.id === activeChapter
                          ? "bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border-l-2 border-indigo-500/50"
                          : ""
                      )}
                    >
                      <span className="font-medium">{chapter.title}</span>
                      {expandedChapters[chapter.id] ? (
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>

                    {expandedChapters[chapter.id] && (
                      <div className="pl-4 py-1">
                        {chapter.topics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => {
                              setActiveChapter(chapter.id);
                              setActiveTopic(topic.id);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-md",
                              "hover:bg-white/5 transition-colors",
                              topic.id === activeTopic
                                ? "bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-200"
                                : "text-neutral-400"
                            )}
                          >
                            {topic.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="flex-1 overflow-auto h-full"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10">
            {/* Main header row */}
            <div className="p-4 flex items-center">
              <button
                onClick={() => setSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-md hover:bg-white/10 mr-2"
              >
                <ArrowLeft
                  className={`h-5 w-5 transition-transform ${
                    !isSidebarVisible ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className="flex-1">
                <div className="text-sm text-neutral-400">
                  {currentChapter?.title}
                </div>
                <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                  {currentTopic?.title}
                </h1>
              </div>
            </div>

            {/* Top Search Bar - Only visible when sidebar is collapsed */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: !isSidebarVisible ? "auto" : 0,
                opacity: !isSidebarVisible ? 1 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2, delay: !isSidebarVisible ? 0.1 : 0 },
              }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entire documentation..."
                    className="w-full py-2 pl-10 pr-8 rounded-md bg-black/30 border border-white/10 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results Dropdown for top search */}
              {isSearching && !isSidebarVisible && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 max-h-[50vh] overflow-y-auto z-20">
                  <div className="p-4">
                    <div className="mb-2 text-xs uppercase text-neutral-500 font-semibold">
                      Search Results ({searchResults.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <button
                          key={`top-${result.chapterId}-${result.topicId}-${index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left p-2 rounded text-sm hover:bg-white/10 transition-colors"
                        >
                          <div className="text-indigo-300">
                            {result.topicTitle}
                          </div>
                          <div className="text-xs text-neutral-500">
                            in {result.chapterTitle}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="p-6 md:p-8 max-w-4xl mx-auto pb-40">
            <motion.div
              key={activeTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-invert max-w-none prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:bg-gradient-to-r prose-headings:from-indigo-300 prose-headings:via-white/90 prose-headings:to-rose-300 prose-p:text-white/60"
            >
              {currentTopic?.content}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom dock */}
      <div className="fixed bottom-8 left-0 right-0 z-50">
        <AppDock />
      </div>
    </div>
  );
}
