import React from 'react';

export function StoriesBarSkeleton() {
  return (
    <div className="relative w-full py-2 px-4">
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar select-none">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
            <div className="p-[2.5px] rounded-full bg-white/10">
              <div className="p-[2px] bg-[#1e2029] rounded-full">
                <div className="w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full bg-white/5" />
              </div>
            </div>
            <div className="w-12 h-2.5 bg-white/10 rounded-full mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpecialOffersSectionSkeleton() {
  return (
    <section className="w-full relative my-1">
      <div className="mx-4 p-4 rounded-3xl bg-[#20212c] border border-[#c5a880]/20 shadow-xl overflow-hidden relative animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="space-y-1.5">
            <div className="w-44 h-3 bg-white/10 rounded-full" />
            <div className="w-60 h-2 bg-white/5 rounded-full" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-8 h-8 bg-white/10 rounded-xl" />
            <div className="w-8 h-8 bg-white/10 rounded-xl" />
          </div>
        </div>

        {/* Cards Row */}
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3, 4].map((card) => (
            <div
              key={card}
              className="w-[200px] sm:w-[220px] flex-shrink-0 rounded-2xl bg-[#282a38] border border-white/5 p-3 space-y-3"
            >
              <div className="w-full h-32 bg-white/5 rounded-xl" />
              <div className="space-y-2">
                <div className="w-16 h-2 bg-white/10 rounded-full" />
                <div className="w-full h-3.5 bg-white/10 rounded-full" />
                <div className="flex items-center justify-between pt-2">
                  <div className="w-20 h-4 bg-white/10 rounded-full" />
                  <div className="w-8 h-8 bg-white/10 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 my-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div
          key={item}
          className="bg-[#242532] border border-white/5 rounded-2xl p-3 sm:p-3.5 space-y-3 animate-pulse"
        >
          <div className="w-full h-40 sm:h-48 bg-white/5 rounded-xl" />
          <div className="space-y-2">
            <div className="w-16 h-2.5 bg-white/10 rounded-full" />
            <div className="w-full h-4 bg-white/10 rounded-full" />
            <div className="w-3/4 h-3 bg-white/5 rounded-full" />
            <div className="flex items-center justify-between pt-2">
              <div className="w-20 h-4 bg-white/10 rounded-full" />
              <div className="w-9 h-9 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
