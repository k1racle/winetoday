"use client";

import { EditorPanel } from "./EditorPanel";
import { GalleryPhotoPicker } from "./media";
import type { UploadedAsset } from "./types";

type GalleryPhotosPanelProps = {
  photos: number[];
  assets: UploadedAsset[];
  onToggle: (id: number) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearAll: () => void;
};

export function GalleryPhotosPanel({ photos, assets, onToggle, onUpload, onClearAll }: GalleryPhotosPanelProps) {
  return (
    <EditorPanel title={<>🖼 Фотографии галереи</>}>
      <GalleryPhotoPicker
        assets={assets}
        selectedIds={photos}
        onToggle={onToggle}
        onUpload={onUpload}
        onClearAll={onClearAll}
      />
    </EditorPanel>
  );
}
