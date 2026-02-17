export interface Release {
    id: number;
    title: string;
    type: 'single' | 'ep' | 'album';
    year: number;
    cover: string;
    spotifyUrl: string | null;
    youtubeUrl: string | null;
    sortOrder: number;
}
export interface MusicSettings {
    id: number;
    subtitle: string;
    spotifyEmbedUrl: string;
}
export interface GalleryImage {
    id: number;
    src: string;
    alt: string;
    sortOrder: number;
}
export interface MerchItem {
    id: number;
    name: string;
    price: number;
    currency: string;
    image: string;
    url: string | null;
    sortOrder: number;
}
export interface TourDate {
    id: number;
    date: string;
    city: string;
    venue: string;
    country: string;
    ticketUrl: string | null;
    soldOut: boolean;
}
export interface PressItem {
    id: number;
    source: string;
    quote: string;
    url: string | null;
}
export interface ContactCategory {
    id: number;
    label: string;
    email: string;
    sortOrder: number;
}
export interface ContactSettings {
    id: number;
    subtitle: string;
}
export interface SocialLink {
    id: number;
    name: string;
    url: string;
    iconKey: string;
    sortOrder: number;
}
export interface NavigationItem {
    id: number;
    label: string;
    href: string;
    visible: boolean;
    sortOrder: number;
}
export interface SiteSetting {
    id: number;
    key: string;
    value: string;
}
export interface AboutContent {
    id: number;
    photo: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    subtitle: string;
}
export interface AdminUser {
    id: number;
    username: string;
    passwordHash: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    token: string;
}
//# sourceMappingURL=types.d.ts.map