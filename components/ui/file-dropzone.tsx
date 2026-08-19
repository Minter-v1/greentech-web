"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

// MARK: - 파일 드롭존

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 ** 2).toFixed(1)} MB`;
}

interface FileDropzoneProps {
  id: string;
  name: string;
  required?: boolean;
  maxSize?: number;
  accept?: string;
  allowedTypes?: string[];
  helperText?: string;
  onError?: (message?: string) => void;
}

export function FileDropzone({
  id,
  name,
  required,
  maxSize = MAX_FILE_SIZE,
  accept,
  allowedTypes,
  helperText,
  onError,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File>();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const reset = () => {
      setFile(undefined);
      setDragging(false);
      onError?.(undefined);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [onError]);

  const selectFile = (next?: File) => {
    if (!next) return;
    if (next.size > maxSize) {
      onError?.(`파일은 ${formatFileSize(maxSize)} 이하만 업로드할 수 있습니다`);
      return;
    }
    if (allowedTypes && !allowedTypes.includes(next.type)) {
      onError?.("허용된 파일 형식을 선택하세요");
      return;
    }

    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    transfer.items.add(next);
    input.files = transfer.files;
    setFile(next);
    onError?.(undefined);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFile(undefined);
    onError?.(undefined);
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-xs">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      <label
        htmlFor={id}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          selectFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-xs rounded-md px-lg py-xl text-center",
          "border border-dashed border-hairline-strong/45 bg-canvas-soft transition-interactive focus-within:ring-2 focus-within:ring-ink",
          "hover:border-hairline-strong hover:bg-canvas-soft-2",
          dragging && "border-ink bg-canvas-soft-2 ring-2 ring-ink",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-canvas text-body shadow-level-1">
          <UploadCloud className="size-5" aria-hidden />
        </span>
        <span className="text-body-sm font-medium text-ink">
          파일을 끌어놓거나 클릭해서 선택
        </span>
        <span className="text-caption text-mute">
          {helperText ?? `파일당 최대 ${formatFileSize(maxSize)}`}
        </span>
      </label>

      {file ? (
        <div className="flex items-center gap-xs rounded-sm bg-canvas-soft-2 px-sm py-xs ring-1 ring-inset ring-hairline">
          <FileText className="size-4 shrink-0 text-mute" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-body-sm font-medium">{file.name}</span>
          <span className="shrink-0 text-caption tabular-nums text-mute">
            {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            aria-label="선택한 파일 제거"
            onClick={clear}
            className="rounded-sm p-xxs text-mute transition-interactive focus-ring hover:bg-canvas hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
