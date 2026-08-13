import React from "react";

const Line = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <Line className="h-4 w-40" />
          <Line className="h-3 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Line className="h-3 w-24" />
            <Line className="h-11 w-full" />
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        <Line className="h-4 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Line key={i} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;