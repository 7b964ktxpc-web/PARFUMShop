import React, { useRef, useState, useEffect } from 'react';
import { Flame, Sparkles, Droplets, Award } from 'lucide-react';
import { Story } from '../types';
import { STORIES_DATA } from '../data/storiesData';
import { triggerHaptic } from '../lib/telegram';

interface StoriesBarProps {
  stories?: Story[];
  onSelectStory: (story: Story, initialSlideIndex?: number) => void;
  viewedStoryIds: string[];
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  viewedStoryIds
}) => {
  const displayStories = stories && stories.length > 0 ? stories : STORIES_DATA;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayStories]);

  const getBadgeIcon = (type?: Story['badgeType']) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-2.5 h-2.5 text-[#1a1105] fill-[#c5a880]" />;
      case 'sparkles':
        return <Sparkles className="w-2.5 h-2.5 text-[#1a1105]" />;
      case 'droplet':
        return <Droplets className="w-2.5 h-2.5 text-[#1a1105]" />;
      case 'award':
        return <Award className="w-2.5 h-2.5 text-[#1a1105]" />;
      default:
        return null;
    }
  };

  // Build soft edge-fade mask so there is never a sharp cutoff
  const getMaskStyle = () => {
    if (canScrollLeft && canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 32px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 32px), transparent 100%)'
      };
    }
    if (canScrollLeft && !canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0%, black 28px)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28px)'
      };
    }
    if (!canScrollLeft && canScrollRight) {
      return {
        maskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent 100%)'
      };
    }
    return {};
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={getMaskStyle()}
        className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto smooth-scroll py-2 px-4 no-scrollbar select-none"
      >
        {displayStories.map((story) => {
          const isViewed = viewedStoryIds.includes(story.id);

          return (
            <button
              key={story.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectStory(story, 0);
              }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
              title={story.title}
            >
              {/* Outer Ring */}
              <div
                className={`relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${
                  isViewed
                    ? 'bg-white/20 group-hover:bg-white/30'
                    : 'bg-gradient-to-tr from-[#c5a880] via-[#f7e7ce] to-[#8d6f46] shadow-sm shadow-[#c5a880]/30'
                }`}
              >
                {/* Dark Spacing Gap */}
                <div className="p-[2px] bg-[#1e2029] rounded-full">
                  <div className="w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full overflow-hidden bg-[#282a38] relative">
                    <img
                      src={story.avatarUrl}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle vignette over circle */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                </div>

                {/* Optional Badge on circle */}
                {story.badgeType && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#c5a880] border-2 border-[#1e2029] flex items-center justify-center shadow-sm">
                    {getBadgeIcon(story.badgeType)}
                  </div>
                )}
              </div>

              {/* Title label */}
              <span
                className={`text-[11px] font-medium tracking-tight text-center truncate max-w-[68px] sm:max-w-[72px] transition-colors ${
                  isViewed
                    ? 'text-[#8e8e93] group-hover:text-white'
                    : 'text-[#f4f4f5] font-semibold group-hover:text-[#c5a880]'
                }`}
              >
                {story.title}
              </span>
            </button>
          );
        })}
        {/* End breathing space */}
        <div className="w-1 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};
