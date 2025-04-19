import React, { useRef } from "react";
import { Button } from "./button";
import { Upload } from "lucide-react";

interface ImageUploadButtonProps {
  onChange: (file: File) => void;
  "aria-label"?: string;
  imageUrl?: string;
  buttonLabel?: string;
}

/**
 * A reusable image upload button that triggers a file input and displays an optional image preview.
 * Uses shadcn Button and lucide-react Upload icon.
 */
export function ImageUploadButton({ onChange, "aria-label": ariaLabel, imageUrl, buttonLabel }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label={ariaLabel}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        aria-label={ariaLabel}
      >
        <Upload className="w-5 h-5" />
        {buttonLabel && <span className="sr-only">{buttonLabel}</span>}
      </Button>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={ariaLabel || buttonLabel || "Preview"}
          className="mt-1 w-12 h-12 object-cover rounded"
          width={48}
          height={48}
        />
      )}
    </div>
  );
}
