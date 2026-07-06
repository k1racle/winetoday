export declare class UpdateWatermarkDto {
    enabled?: boolean;
    mediaId?: string;
    opacity?: number;
    sizePercent?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    offsetTopPercent?: number;
    offsetRightPercent?: number;
    offsetBottomPercent?: number;
    offsetLeftPercent?: number;
    minSizePx?: number;
    maxSizePx?: number;
}
