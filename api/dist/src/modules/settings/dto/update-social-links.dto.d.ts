declare class SocialLinkDto {
    label: string;
    href: string;
    icon?: string;
}
export declare class UpdateSocialLinksDto {
    title?: string;
    links: SocialLinkDto[];
}
export {};
