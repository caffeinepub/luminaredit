import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface BulkJobInput {
    voiceType: string;
    videoCount: bigint;
    voiceEmotion: VoiceEmotion;
    tone: VideoTone;
    language: string;
    style: BulkJobStyle;
    durationSeconds: bigint;
    prompt: string;
    aspectRatio: VideoAspectRatio;
}
export interface BulkJob {
    id: RecordId;
    status: BulkJobStatus;
    completedAt?: bigint;
    voiceType: string;
    videoCount: bigint;
    voiceEmotion: VoiceEmotion;
    completedVideos: bigint;
    userId: Principal;
    createdAt: bigint;
    tone: VideoTone;
    language: string;
    style: BulkJobStyle;
    durationSeconds: bigint;
    prompt: string;
    totalScripts: bigint;
    aspectRatio: VideoAspectRatio;
}
export type Genre = string;
export type RecordId = bigint;
export interface ProjectInput {
    status: ProjectStatus;
    title: string;
    description: string;
    resolution: Resolution;
    thumbnailBlob: ExternalBlob;
    durationSeconds: bigint;
    timelineStateJson: string;
}
export interface Effect {
    id: RecordId;
    isPremium: boolean;
    name: string;
    category: EffectCategory;
    previewBlob: ExternalBlob;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Post {
    id: RecordId;
    status: PostStatus;
    hashtags: Array<string>;
    scheduledTime: bigint;
    userId: Principal;
    platform: Platform;
    projectId: RecordId;
    caption: string;
}
export interface AudioTrack {
    id: RecordId;
    bpm: bigint;
    title: string;
    isPremium: boolean;
    audioBlob: ExternalBlob;
    moodTags: Array<string>;
    genre: Genre;
    durationSeconds: bigint;
    artist: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface VideoProject {
    id: RecordId;
    status: ProjectStatus;
    title: string;
    userId: Principal;
    description: string;
    resolution: Resolution;
    thumbnailBlob: ExternalBlob;
    durationSeconds: bigint;
    timestamp: bigint;
    timelineStateJson: string;
}
export interface ProjectStats {
    platformBreakdown: Array<[Platform, bigint]>;
    shareCount: bigint;
    viewCount: bigint;
    projectId: RecordId;
    exportCount: bigint;
}
export interface VideoTemplate {
    id: RecordId;
    isPremium: boolean;
    name: string;
    usageCount: bigint;
    tags: Array<string>;
    category: TemplateCategory;
    previewBlob: ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface GeneratedScript {
    id: RecordId;
    cta: string;
    title: string;
    viralityScore: bigint;
    hashtags: Array<string>;
    scenes: Array<string>;
    body: string;
    hook: string;
    jobId: RecordId;
    description: string;
}
export interface GeneratedVideo {
    id: RecordId;
    status: BulkJobStatus;
    scriptId: RecordId;
    jobId: RecordId;
    thumbnailBlob: ExternalBlob;
    durationSeconds: bigint;
    aspectRatio: VideoAspectRatio;
}
export interface UserProfile {
    aiUsageCount: bigint;
    displayName: string;
    avatarBlob: ExternalBlob;
    tier: SubscriptionTier;
    createdTime: bigint;
    youtubeId?: string;
    twitterId?: string;
    stripePaymentIntentId?: string;
    instagramId?: string;
}
export enum AiFeature {
    beatSync = "beatSync",
    bgRemover = "bgRemover",
    voiceGen = "voiceGen",
    textToVideo = "textToVideo",
    faceTracking = "faceTracking",
    autoCaptions = "autoCaptions"
}
export enum BulkJobStatus {
    done = "done",
    queued = "queued",
    processing = "processing",
    failed = "failed"
}
export enum BulkJobStyle {
    bold = "bold",
    trendy = "trendy",
    minimal = "minimal",
    cinematic = "cinematic",
    educational = "educational"
}
export enum EffectCategory {
    _3d = "_3d",
    lut = "lut",
    cinematic = "cinematic",
    transition = "transition",
    filter = "filter",
    glitch = "glitch"
}
export enum Platform {
    tiktok = "tiktok",
    twitter = "twitter",
    instagram = "instagram",
    youtube = "youtube"
}
export enum PostStatus {
    scheduled = "scheduled",
    published = "published",
    failed = "failed"
}
export enum ProjectStatus {
    processing = "processing",
    draft = "draft",
    ready = "ready"
}
export enum Resolution {
    _2k = "_2k",
    _4k = "_4k",
    _1080p = "_1080p",
    _720p = "_720p"
}
export enum SubscriptionTier {
    pro = "pro",
    free = "free"
}
export enum TemplateCategory {
    tiktok = "tiktok",
    shorts = "shorts",
    youtube = "youtube",
    reels = "reels"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VideoAspectRatio {
    shorts9x16 = "shorts9x16",
    landscape16x9 = "landscape16x9"
}
export enum VideoTone {
    humorous = "humorous",
    viral = "viral",
    cinematic = "cinematic",
    educational = "educational",
    motivational = "motivational"
}
export enum VoiceEmotion {
    sad = "sad",
    happy = "happy",
    energetic = "energetic",
    excited = "excited",
    neutral = "neutral"
}
export interface backendInterface {
    applyEffect(effectId: bigint, projectId: RecordId): Promise<void>;
    applyTemplate(templateId: bigint, projectId: RecordId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    configureStripe(config: StripeConfiguration): Promise<void>;
    createAudioTrack(track: AudioTrack): Promise<bigint>;
    createBulkJob(input: BulkJobInput): Promise<RecordId>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createEffect(effect: Effect): Promise<bigint>;
    createPost(post: Post): Promise<bigint>;
    createProject(input: ProjectInput): Promise<RecordId>;
    createTemplate(template: VideoTemplate): Promise<bigint>;
    deleteAudioTrack(trackId: bigint): Promise<void>;
    deleteBulkJob(jobId: RecordId): Promise<void>;
    deleteEffect(effectId: bigint): Promise<void>;
    deleteGeneratedScript(scriptId: RecordId): Promise<void>;
    deleteGeneratedVideo(videoId: RecordId): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    deleteTemplate(templateId: bigint): Promise<void>;
    deleteUserProject(projectId: RecordId): Promise<void>;
    downgradeToFree(): Promise<void>;
    filterPostsByStatus(postsArray: Array<Post>, status: PostStatus): Promise<Array<Post>>;
    filterProjectsByStatus(projectsArray: Array<VideoProject>, status: ProjectStatus): Promise<Array<VideoProject>>;
    filterTracksByGenre(tracks: Array<AudioTrack>, genre: Genre): Promise<Array<AudioTrack>>;
    getBulkJob(jobId: RecordId): Promise<BulkJob>;
    getBulkJobsByUser(userId: Principal): Promise<Array<BulkJob>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckoutSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getEffect(id: bigint): Promise<Effect>;
    getEffectCategories(): Promise<Array<EffectCategory>>;
    getFreeTierSummary(user: Principal): Promise<{
        aiUsageLimit: bigint;
        isFree: boolean;
        remainingAiUses: bigint;
    }>;
    getPostInternal(postId: bigint): Promise<Post>;
    getProject(projectId: RecordId): Promise<VideoProject>;
    getProjectStats(projectId: bigint): Promise<ProjectStats>;
    getProjectsByUser(userId: Principal): Promise<Array<VideoProject>>;
    getScriptsForJob(jobId: RecordId): Promise<Array<GeneratedScript>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTemplate(id: bigint): Promise<VideoTemplate>;
    getTemplatesByUsageCount(mLimit: bigint | null): Promise<Array<VideoTemplate>>;
    getTrack(id: bigint): Promise<AudioTrack>;
    getTracksGroupedByGenre(tracks: Array<AudioTrack>): Promise<Array<[Genre, Array<AudioTrack>]>>;
    getUpcomingPostsForUser(userId: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideosForJob(jobId: RecordId): Promise<Array<GeneratedVideo>>;
    incrementExportCount(projectId: bigint): Promise<void>;
    incrementProjectPostViewCount(projectId: bigint): Promise<void>;
    incrementShareCount(projectId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isFreeTier(user: Principal): Promise<boolean>;
    isPremiumTrack(id: bigint): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveGeneratedScript(script: GeneratedScript): Promise<RecordId>;
    saveGeneratedVideo(video: GeneratedVideo): Promise<RecordId>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    sortEffectsByName(effects: Array<Effect>): Promise<Array<Effect>>;
    sortPostsByScheduledTime(postsArray: Array<Post>): Promise<Array<Post>>;
    sortProjectsByTimestamp(projectsArray: Array<VideoProject>): Promise<Array<VideoProject>>;
    toShoppingItemArray(items: Array<[string, string, bigint]>): Promise<Array<ShoppingItem>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBulkJobStatus(jobId: RecordId, status: BulkJobStatus, completedVideos: bigint, completedAt: bigint | null): Promise<void>;
    updatePost(postId: bigint, updatedPost: Post): Promise<void>;
    updateProject(projectId: RecordId, updatedProject: VideoProject): Promise<void>;
    upgradeToPro(stripePaymentIntentId: string): Promise<void>;
    useAiFeature(feature: AiFeature): Promise<void>;
    useAudioTrack(trackId: bigint, projectId: RecordId): Promise<void>;
}
