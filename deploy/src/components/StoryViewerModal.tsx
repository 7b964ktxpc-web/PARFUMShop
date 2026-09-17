import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Flame, Droplets, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Story, StorySlide } from '../types';
import { STORIES_DATA } from '../data/storiesData';
import { triggerHaptic } from '../lib/telegram';

interface StoryViewerModalProps {
  currentStory: Story | null;
  stories?: Story[];
  initialSlideIndex?: number;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
  onSelectBrand?: (brand: string) => void;
  onSelectCategory?: (category: string) => void;
  onMarkStoryViewed: (storyId: string) => void;
  onShareStory?: (story: Story) => void;
}

const SLIDE_DURATION_MS = 5000;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  currentStory,
  stories,
  initialSlideIndex = 0,
  onClose,
  onSelectProduct,
  onSelectBrand,
  onSelectCategory,
  onMarkStoryViewed,
  onShareStory
}) => {
  const storiesList = stories && stories.length > 0 ? stories : STORIES_DATA;
  const [storyIndex, setStoryIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeStory = currentStory ? storiesList[storyIndex] || currentStory : null;
  const activeSlide: StorySlide | undefined = activeStory?.slides[slideIndex];

  // Sync with currentStory when opened
  useEffect(() => {
    if (currentStory) {
      const idx = storiesList.findIndex((s) => s.id === currentStory.id);
      setStoryIndex(idx >= 0 ? idx : 0);
      setSlideIndex(initialSlideIndex || 0);
      setProgress(0);
      onMarkStoryViewed(currentStory.id);
    }
  }, [currentStory, initialSlideIndex, onMarkStoryViewed, storiesList]);

  // Lock body scroll when open
  useEffect(() => {
    if (currentStory) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [currentStory]);

  const handleNext = useCallback(() => {
    if (!activeStory) return;

    if (slideIndex < activeStory.slides.length - 1) {
      // Next slide in same story
      triggerHaptic('light');
      setSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else if (storyIndex < storiesList.length - 1) {
      // Next story
      triggerHaptic('light');
      const nextStory = storiesList[storyIndex + 1];
      setStoryIndex((prev) => prev + 1);
      setSlideIndex(0);
      setProgress(0);
      onMarkStoryViewed(nextStory.id);
    } else {
      // Reached the end
      onClose();
    }
  }, [activeStory, slideIndex, storyIndex, storiesList, onMarkStoryViewed, onClose]);

  const handlePrev = useCallback(() => {
    if (slideIndex > 0) {
      // Prev slide in same story
      triggerHaptic('light');
      setSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else if (storyIndex > 0) {
      // Prev story, jump to its last slide
      triggerHaptic('light');
      const prevStory = storiesList[storyIndex - 1];
      setStoryIndex((prev) => prev - 1);
      setSlideIndex(prevStory.slides.length - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [slideIndex, storyIndex, storiesList]);

  // Progress timer loop
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory, isPaused, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  if (!currentStory || !activeStory || !activeSlide) return null;

  const handleActionClick = () => {
    triggerHaptic('medium');
    onClose();

    if (activeSlide.productId && onSelectProduct) {
      onSelectProduct(activeSlide.productId);
    } else if (activeSlide.brandFilter && onSelectBrand) {
      onSelectBrand(activeSlide.brandFilter);
    } else if (activeSlide.categoryFilter && onSelectCategory) {
      onSelectCategory(activeSlide.categoryFilter);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="story-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl sm:p-4"
        onClick={onClose}
      >
        {/* Desktop close button */}
        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Закрыть"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Desktop previous story button */}
        {storyIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Desktop next story button */}
        {storyIndex < STORIES_DATA.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Story Card Container */}
        <motion.div
          key={`story-card-${activeStory.id}-${activeSlide.id}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-[100dvh] sm:h-[720px] sm:max-w-md sm:rounded-3xl overflow-hidden bg-[#242532] flex flex-col shadow-2xl select-none"
        >
          {/* Background Image with Ambient Vignette */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
              referrerPolicy="no-referrer"
            />
            {/* Top gradient for story header readability */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
            {/* Bottom gradient for content readability */}
            <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
          </div>

          {/* Interactive Tap Areas for navigation */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
            onClick={handlePrev}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
          <div
            className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer"
            onClick={handleNext}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />

          {/* Top Bar: Progress Segments & Header */}
          <div className="relative z-20 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] space-y-2.5 pointer-events-none">
            {/* Progress Segments */}
            <div className="flex gap-1.5 w-full">
              {activeStory.slides.map((slide, idx) => {
                let fillPercent = 0;
                if (idx < slideIndex) {
                  fillPercent = 100;
                } else if (idx === slideIndex) {
                  fillPercent = progress;
                }

                return (
                  <div
                    key={slide.id}
                    className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden backdrop-blur-sm"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Profile / Story Info */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black/40 shrink-0">
                  <img
                    src={activeStory.avatarUrl}
                    alt={activeStory.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white tracking-wide drop-shadow truncate">
                      {activeStory.title}
                    </span>
                    {activeSlide.tag && (
                      <span className="text-[10px] text-[#c5a880] font-medium px-1.5 py-0.2 rounded bg-black/40 border border-[#c5a880]/30 shrink-0">
                        {activeSlide.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions on mobile: Share & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onShareStory && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      onShareStory(activeStory);
                    }}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-[#c5a880] transition-colors border border-white/10 shrink-0"
                    title="Поделиться историей"
                    aria-label="Поделиться историей"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors border border-white/10 shrink-0"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Card Content */}
          <div className="relative z-20 p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 pointer-events-auto">
            {/* Badge */}
            {activeSlide.badge && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#141311]/90 text-[#f5dfb8] backdrop-blur-md border border-[#c5a880]/60 shadow-lg shadow-black/70">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>{activeSlide.badge}</span>
                </span>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="space-y-0.5">
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight break-words">
                {activeSlide.title}
              </h2>
              {activeSlide.subtitle && (
                <p className="text-xs sm:text-sm font-medium text-[#e2cbab] drop-shadow break-words">
                  {activeSlide.subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed drop-shadow line-clamp-3 break-words">
              {activeSlide.description}
            </p>

            {/* Notes Preview Chips */}
            {activeSlide.notesPreview && activeSlide.notesPreview.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {activeSlide.notesPreview.map((note, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-[10.5px] sm:text-[11px] text-[#e4e4e7] truncate max-w-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}

            {/* Price Preview & Action CTA Button */}
            <div className="pt-1.5 flex items-center justify-between gap-3">
              {activeSlide.priceFrom && (
                <div className="text-left shrink-0">
                  <span className="text-[9px] uppercase text-[#a1a1aa] block tracking-wider">
                    Стоимость
                  </span>
                  <span className="font-serif text-sm sm:text-base font-bold text-[#c5a880] whitespace-nowrap">
                    от {activeSlide.priceFrom.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}

              <button
                onClick={handleActionClick}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#c5a880] hover:bg-[#d8bf9b] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl shadow-[#c5a880]/20 active:scale-95 transition-all min-w-0"
              >
                <span className="truncate">{activeSlide.ctaText || 'Смотреть в каталоге'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
