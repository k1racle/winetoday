export interface MediaAsset {
  id: string;
  path: string;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: string | number | null;
  altText?: string | null;
  createdAt: string;
}
