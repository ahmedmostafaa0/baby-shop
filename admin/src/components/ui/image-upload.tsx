import { useEffect, useRef, useState } from "react";
import api from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  folder?: string;
  multiple?: boolean;
  onUploadingChange: (loading: boolean) => void;
}

const ImageUpload = ({
  value,
  onChange,
  disabled,
  folder = "baby-shop/test",
  multiple = false,
  onUploadingChange,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreview(Array.isArray(value) ? value : value ? [value] : []);
  }, [value]);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    onUploadingChange(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          alert("Only images are allowed");
          continue;
        }

        if (file.size > 4 * 1024 * 1024) {
          alert("Max image size is 4MB");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await api.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedUrls.push(res.data.url);
      }

      if (multiple) {
        const newImages = [...preview, ...uploadedUrls];
        setPreview(newImages);
        onChange(newImages);
      } else {
        setPreview([uploadedUrls[0]]);
        onChange(uploadedUrls[0]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
      onUploadingChange(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = preview.filter((_, i) => i !== index);
    setPreview(newImages);
    onChange(multiple ? newImages : "");
    if (inputRef.current && newImages.length === 0) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (disabled || loading) return;
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || loading) return;

    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card className="border-dashed overflow-hidden">
      <CardContent className="p-0">
        <div
          className={`
            flex flex-col items-center justify-center p-6
            ${
              disabled || loading
                ? "cursor-not-allowed opacity-50 pointer-events-none"
                : "cursor-pointer"
            }
          `}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
            }}
            disabled={disabled || loading}
          />

          {preview.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 w-full">
              {preview.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt="Preview"
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    disabled={disabled || loading}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}

              {loading && (
                <div className="col-span-3 text-center text-sm text-muted-foreground">
                  Uploading...
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] w-full border border-dashed border-muted-foreground/50 rounded-md">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground/70">
                Image (max 4MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
