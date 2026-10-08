import { useState } from 'react';
import { getInitials, getAvatarColor } from "../../utils/avatar";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

/**
 * Avatar — photo when available, coloured initials otherwise.
 * <Avatar src={url} firstName="Aman" lastName="Sharma" seed={email} size="md" />
 */
export default function Avatar({ src, firstName = "", lastName = "", seed, size = "md", className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);

  const full = `${firstName} ${lastName}`.trim();
  const failed = failedSrc === src;
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white shadow-sm ${SIZES[size] || SIZES.md} ${className}`}
      style={showImage ? undefined : { backgroundColor: getAvatarColor(seed || full) }}
    >
      {showImage ? (
        <img src={src} alt={full || "Profile photo"} onError={() => setFailedSrc(src)} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(firstName, lastName) || "?"}</span>
      )}
    </span>
  );
}
