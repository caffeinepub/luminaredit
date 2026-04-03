import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";


actor {
  type RecordId = Nat;
  var nextRecordId = 0;

  func generateId() : RecordId {
    nextRecordId += 1;
    nextRecordId;
  };

  func getProjectByIdInternal(projectId : RecordId) : VideoProject {
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) { project };
    };
  };

  module Timestamp {
    public func compare(lhs : Int, rhs : Int) : Order.Order {
      Int.compare(lhs, rhs);
    };
  };

  module VideoProject {
    public func compareByTimestamp(lhs : VideoProject, rhs : VideoProject) : Order.Order {
      Timestamp.compare(lhs.timestamp, rhs.timestamp);
    };
  };

  module VideoTemplate {
    public func compareByUsageCount(lhs : VideoTemplate, rhs : VideoTemplate) : Order.Order {
      Nat.compare(lhs.usageCount, rhs.usageCount);
    };
  };

  module Effect {
    public func compare(lhs : Effect, rhs : Effect) : Order.Order {
      Text.compare(lhs.name, rhs.name);
    };
  };

  module Post {
    public func compareByScheduledTime(lhs : Post, rhs : Post) : Order.Order {
      Timestamp.compare(lhs.scheduledTime, rhs.scheduledTime);
    };
  };

  module BulkJob {
    public func compareByCreatedAt(lhs : BulkJob, rhs : BulkJob) : Order.Order {
      Int.compare(lhs.createdAt, rhs.createdAt);
    };
  };

  include MixinStorage();
  // Authorization/Access control component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  public type SubscriptionTier = {
    #free;
    #pro;
  };

  public type UserProfile = {
    displayName : Text;
    avatarBlob : ExternalBlob;
    createdTime : Int;
    tier : SubscriptionTier;
    stripePaymentIntentId : ?Text;
    aiUsageCount : Nat;
    twitterId : ?Text;
    instagramId : ?Text;
    youtubeId : ?Text;
  };

  public type Resolution = {
    #_720p;
    #_1080p;
    #_2k;
    #_4k;
  };

  public type ProjectStatus = {
    #draft;
    #processing;
    #ready;
  };

  public type VideoProject = {
    id : RecordId;
    userId : Principal;
    title : Text;
    description : Text;
    thumbnailBlob : ExternalBlob;
    durationSeconds : Nat;
    resolution : Resolution;
    status : ProjectStatus;
    timelineStateJson : Text;
    timestamp : Int;
  };

  public type TemplateCategory = {
    #reels;
    #shorts;
    #tiktok;
    #youtube;
  };

  public type VideoTemplate = {
    id : RecordId;
    name : Text;
    category : TemplateCategory;
    previewBlob : ExternalBlob;
    isPremium : Bool;
    tags : [Text];
    usageCount : Nat;
  };

  public type Genre = Text;

  public type AudioTrack = {
    id : RecordId;
    title : Text;
    artist : Text;
    genre : Genre;
    bpm : Nat;
    durationSeconds : Nat;
    moodTags : [Text];
    audioBlob : ExternalBlob;
    isPremium : Bool;
  };

  public type EffectCategory = {
    #filter;
    #transition;
    #lut;
    #glitch;
    #cinematic;
    #_3d;
  };

  public type Effect = {
    id : RecordId;
    name : Text;
    category : EffectCategory;
    previewBlob : ExternalBlob;
    isPremium : Bool;
  };

  public type Platform = {
    #instagram;
    #youtube;
    #tiktok;
    #twitter;
  };

  public type PostStatus = {
    #scheduled;
    #published;
    #failed;
  };

  public type Post = {
    id : RecordId;
    userId : Principal;
    projectId : RecordId;
    platform : Platform;
    scheduledTime : Int;
    caption : Text;
    hashtags : [Text];
    status : PostStatus;
  };

  public type ProjectStats = {
    projectId : RecordId;
    viewCount : Nat;
    exportCount : Nat;
    shareCount : Nat;
    platformBreakdown : [(Platform, Nat)];
  };

  public type AiFeature = {
    #autoCaptions;
    #bgRemover;
    #faceTracking;
    #beatSync;
    #textToVideo;
    #voiceGen;
  };

  public type ProjectInput = {
    title : Text;
    description : Text;
    status : ProjectStatus;
    durationSeconds : Nat;
    resolution : Resolution;
    timelineStateJson : Text;
    thumbnailBlob : ExternalBlob;
  };

  public type VideoTemplateSortType = {
    #usageCount;
    #name;
  };

  // STATE FOR BULK VIDEO GENERATOR
  public type BulkJobStatus = {
    #queued;
    #processing;
    #done;
    #failed;
  };

  public type VideoAspectRatio = {
    #shorts9x16;
    #landscape16x9;
  };

  public type VoiceEmotion = {
    #happy;
    #neutral;
    #energetic;
    #sad;
    #excited;
  };

  public type VideoTone = {
    #viral;
    #educational;
    #cinematic;
    #motivational;
    #humorous;
  };

  public type BulkJobStyle = {
    #trendy;
    #minimal;
    #cinematic;
    #bold;
    #educational;
  };

  public type GeneratedScript = {
    id : RecordId;
    jobId : RecordId;
    hook : Text;
    body : Text;
    cta : Text;
    scenes : [Text];
    title : Text;
    description : Text;
    hashtags : [Text];
    viralityScore : Nat;
  };

  public type GeneratedVideo = {
    id : RecordId;
    scriptId : RecordId;
    jobId : RecordId;
    thumbnailBlob : ExternalBlob;
    aspectRatio : VideoAspectRatio;
    durationSeconds : Nat;
    status : BulkJobStatus;
  };

  public type BulkJob = {
    id : RecordId;
    userId : Principal;
    prompt : Text;
    status : BulkJobStatus;
    videoCount : Nat;
    tone : VideoTone;
    style : BulkJobStyle;
    voiceType : Text;
    voiceEmotion : VoiceEmotion;
    language : Text;
    aspectRatio : VideoAspectRatio;
    durationSeconds : Nat;
    createdAt : Int;
    completedAt : ?Int;
    totalScripts : Nat;
    completedVideos : Nat;
  };

  public type BulkJobInput = {
    prompt : Text;
    videoCount : Nat;
    tone : VideoTone;
    style : BulkJobStyle;
    voiceType : Text;
    voiceEmotion : VoiceEmotion;
    language : Text;
    aspectRatio : VideoAspectRatio;
    durationSeconds : Nat;
  };

  public type BulkVideoOutput = {
    scripts : [GeneratedScript];
    videos : [GeneratedVideo];
    job : BulkJob;
  };

  // State initialization
  let userProfiles = Map.empty<Principal, UserProfile>();
  let projects = Map.empty<RecordId, VideoProject>();
  let videoTemplates = Map.empty<Nat, VideoTemplate>();
  let audioTracks = Map.empty<Nat, AudioTrack>();
  let effects = Map.empty<Nat, Effect>();
  let posts = Map.empty<Nat, Post>();
  let projectStats = Map.empty<Nat, ProjectStats>();
  let tags = Map.empty<Text, Text>();
  let genres = Set.empty<Text>();
  var nextId = 0;
  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let aiUsageLimitFreeTier = 5;
  var templateUploadsDisabled = false;

  // NEW STATE FOR BULK VIDEO GENERATOR
  let bulkJobs = Map.empty<RecordId, BulkJob>();
  let generatedScripts = Map.empty<RecordId, GeneratedScript>();
  let generatedVideos = Map.empty<RecordId, GeneratedVideo>();

  // Helper functions
  func getCurrentTimestamp() : Int {
    Time.now();
  };

  func getNextId() : RecordId {
    let id = nextId;
    nextId += 1;
    id;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe must be configured first") };
      case (?c) { c };
    };
  };

  func getUserInternal(user : Principal) : UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile does not exist.") };
      case (?profile) { profile };
    };
  };

  func getAudioTrackInternal(id : Nat) : AudioTrack {
    switch (audioTracks.get(id)) {
      case (null) { Runtime.trap("Audio track not found") };
      case (?track) { track };
    };
  };

  func isProjectOwner(caller : Principal, project : VideoProject) : Bool {
    project.userId == caller;
  };

  func isPostOwner(caller : Principal, post : Post) : Bool {
    post.userId == caller;
  };

  func isBulkJobOwner(caller : Principal, job : BulkJob) : Bool {
    job.userId == caller;
  };

  func canAccessPremiumContent(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.tier == #pro };
    };
  };

  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func requireAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // PRODUCTION CONTRACT: DATA STORAGE, RETRIEVAL, AND MANAGEMENT CAPABILITIES
  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  // Project Management
  public query ({ caller }) func getProject(projectId : RecordId) : async VideoProject {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    // Users can view their own projects or admins can view any
    if (not isProjectOwner(caller, project) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own projects");
    };
    project;
  };

  public shared ({ caller }) func createProject(input : ProjectInput) : async RecordId {
    requireUser(caller);
    let id = generateId();
    let project = {
      id;
      userId = caller;
      title = input.title;
      description = input.description;
      thumbnailBlob = input.thumbnailBlob;
      durationSeconds = input.durationSeconds;
      resolution = input.resolution;
      status = input.status;
      timelineStateJson = input.timelineStateJson;
      timestamp = getCurrentTimestamp();
    };
    projects.add(id, project);
    // Initialize stats for the project
    projectStats.add(id, {
      projectId = id;
      viewCount = 0;
      exportCount = 0;
      shareCount = 0;
      platformBreakdown = [];
    });
    id;
  };

  public shared ({ caller }) func updateProject(projectId : RecordId, updatedProject : VideoProject) : async () {
    requireUser(caller);
    let existingProject = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, existingProject)) {
      Runtime.trap("Unauthorized: Can only update your own projects");
    };
    // Ensure userId cannot be changed
    let project = {
      id = updatedProject.id;
      userId = existingProject.userId;
      title = updatedProject.title;
      description = updatedProject.description;
      thumbnailBlob = updatedProject.thumbnailBlob;
      durationSeconds = updatedProject.durationSeconds;
      resolution = updatedProject.resolution;
      status = updatedProject.status;
      timelineStateJson = updatedProject.timelineStateJson;
      timestamp = updatedProject.timestamp;
    };
    projects.add(projectId, project);
  };

  public shared ({ caller }) func deleteUserProject(projectId : RecordId) : async () {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own projects");
    };
    projects.remove(projectId);
    projectStats.remove(projectId);
    // Clean up associated posts
    for ((postId, post) in posts.entries()) {
      if (post.projectId == projectId) {
        posts.remove(postId);
      };
    };
  };

  public query ({ caller }) func getProjectsByUser(userId : Principal) : async [VideoProject] {
    requireUser(caller);
    // Users can only list their own projects, admins can list any
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own projects");
    };
    projects.values().toArray().filter(
      func(project) { project.userId == userId }
    );
  };

  // Template Management
  public query ({ caller }) func getTemplate(id : Nat) : async VideoTemplate {
    // Anyone can view templates (including guests for browsing)
    switch (videoTemplates.get(id)) {
      case (null) { Runtime.trap("Template not found") };
      case (?template) { template };
    };
  };

  public query ({ caller }) func getTemplatesByUsageCount(mLimit : ?Nat) : async [VideoTemplate] {
    // Anyone can browse templates
    switch (mLimit) {
      case (null) { videoTemplates.values().toArray().sort(VideoTemplate.compareByUsageCount) };
      case (?limit) {
        let sortedTemplates = videoTemplates.values().toArray().sort(VideoTemplate.compareByUsageCount);
        switch (limit >= sortedTemplates.size()) {
          case (true) { sortedTemplates };
          case (false) { sortedTemplates.sliceToArray(0, limit) };
        };
      };
    };
  };

  public shared ({ caller }) func applyTemplate(templateId : Nat, projectId : RecordId) : async () {
    requireUser(caller);
    let template = switch (videoTemplates.get(templateId)) {
      case (null) { Runtime.trap("Template not found") };
      case (?t) { t };
    };
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only apply templates to your own projects");
    };
    // Check premium access
    if (template.isPremium and not canAccessPremiumContent(caller)) {
      Runtime.trap("Unauthorized: Premium templates require Pro subscription");
    };
    // Increment usage count
    let updatedTemplate = {
      id = template.id;
      name = template.name;
      category = template.category;
      previewBlob = template.previewBlob;
      isPremium = template.isPremium;
      tags = template.tags;
      usageCount = template.usageCount + 1;
    };
    videoTemplates.add(templateId, updatedTemplate);
  };

  public shared ({ caller }) func createTemplate(template : VideoTemplate) : async Nat {
    requireAdmin(caller);
    let id = getNextId();
    let newTemplate = {
      id;
      name = template.name;
      category = template.category;
      previewBlob = template.previewBlob;
      isPremium = template.isPremium;
      tags = template.tags;
      usageCount = 0;
    };
    videoTemplates.add(id, newTemplate);
    id;
  };

  public shared ({ caller }) func deleteTemplate(templateId : Nat) : async () {
    requireAdmin(caller);
    videoTemplates.remove(templateId);
  };

  // Audio Track Management
  public query ({ caller }) func getTrack(id : Nat) : async AudioTrack {
    // Anyone can view track metadata
    getAudioTrackInternal(id);
  };

  public shared ({ caller }) func useAudioTrack(trackId : Nat, projectId : RecordId) : async () {
    requireUser(caller);
    let track = getAudioTrackInternal(trackId);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only add audio to your own projects");
    };
    // Check premium access
    if (track.isPremium and not canAccessPremiumContent(caller)) {
      Runtime.trap("Unauthorized: Premium audio tracks require Pro subscription");
    };
  };

  public query ({ caller }) func isPremiumTrack(id : Nat) : async Bool {
    getAudioTrackInternal(id).isPremium;
  };

  public query ({ caller }) func filterTracksByGenre(tracks : [AudioTrack], genre : Genre) : async [AudioTrack] {
    tracks.filter(
      func(track) { track.genre == genre }
    );
  };

  public query ({ caller }) func getTracksGroupedByGenre(tracks : [AudioTrack]) : async [(Genre, [AudioTrack])] {
    let grouped = Map.empty<Genre, [AudioTrack]>();

    for (track in tracks.values()) {
      let currentGroup = switch (grouped.get(track.genre)) {
        case (null) { [] };
        case (?g) { g };
      };
      grouped.add(track.genre, currentGroup.concat([track]));
    };

    grouped.entries().toArray();
  };

  public shared ({ caller }) func createAudioTrack(track : AudioTrack) : async Nat {
    requireAdmin(caller);
    let id = getNextId();
    audioTracks.add(id, track);
    id;
  };

  public shared ({ caller }) func deleteAudioTrack(trackId : Nat) : async () {
    requireAdmin(caller);
    audioTracks.remove(trackId);
  };

  // Effects Management
  public query ({ caller }) func getEffect(id : Nat) : async Effect {
    // Anyone can view effects
    switch (effects.get(id)) {
      case (null) { Runtime.trap("Effect not found") };
      case (?effect) { effect };
    };
  };

  public shared ({ caller }) func applyEffect(effectId : Nat, projectId : RecordId) : async () {
    requireUser(caller);
    let effect = switch (effects.get(effectId)) {
      case (null) { Runtime.trap("Effect not found") };
      case (?e) { e };
    };
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only apply effects to your own projects");
    };
    // Check premium access
    if (effect.isPremium and not canAccessPremiumContent(caller)) {
      Runtime.trap("Unauthorized: Premium effects require Pro subscription");
    };
  };

  public query ({ caller }) func sortEffectsByName(effects : [Effect]) : async [Effect] {
    effects.sort();
  };

  public query ({ caller }) func getEffectCategories() : async [EffectCategory] {
    [
      #filter,
      #transition,
      #lut,
      #glitch,
      #cinematic,
      #_3d,
    ];
  };

  public shared ({ caller }) func createEffect(effect : Effect) : async Nat {
    requireAdmin(caller);
    let id = getNextId();
    effects.add(id, effect);
    id;
  };

  public shared ({ caller }) func deleteEffect(effectId : Nat) : async () {
    requireAdmin(caller);
    effects.remove(effectId);
  };

  // Content Schedule Management
  public query ({ caller }) func getPostInternal(postId : Nat) : async Post {
    requireUser(caller);
    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    if (not isPostOwner(caller, post) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own posts");
    };
    post;
  };

  public shared ({ caller }) func createPost(post : Post) : async Nat {
    requireUser(caller);
    // Verify project ownership
    let project = getProjectByIdInternal(post.projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only schedule posts for your own projects");
    };
    let id = getNextId();
    let newPost = {
      id;
      userId = caller;
      projectId = post.projectId;
      platform = post.platform;
      scheduledTime = post.scheduledTime;
      caption = post.caption;
      hashtags = post.hashtags;
      status = post.status;
    };
    posts.add(id, newPost);
    id;
  };

  public shared ({ caller }) func updatePost(postId : Nat, updatedPost : Post) : async () {
    requireUser(caller);
    let existingPost = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    if (not isPostOwner(caller, existingPost)) {
      Runtime.trap("Unauthorized: Can only update your own posts");
    };
    // Ensure userId cannot be changed
    let post = {
      id = updatedPost.id;
      userId = existingPost.userId;
      projectId = updatedPost.projectId;
      platform = updatedPost.platform;
      scheduledTime = updatedPost.scheduledTime;
      caption = updatedPost.caption;
      hashtags = updatedPost.hashtags;
      status = updatedPost.status;
    };
    posts.add(postId, post);
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    requireUser(caller);
    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    if (not isPostOwner(caller, post) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own posts");
    };
    posts.remove(postId);
  };

  public query ({ caller }) func getUpcomingPostsForUser(userId : Principal) : async [Post] {
    requireUser(caller);
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own posts");
    };
    let userPosts = posts.values().toArray().filter(
      func(post) { post.userId == userId and post.status == #scheduled }
    );
    userPosts.sort(Post.compareByScheduledTime);
  };

  public query ({ caller }) func filterPostsByStatus(postsArray : [Post], status : PostStatus) : async [Post] {
    postsArray.filter(
      func(post) { post.status == status }
    );
  };

  public query ({ caller }) func sortPostsByScheduledTime(postsArray : [Post]) : async [Post] {
    postsArray.sort(Post.compareByScheduledTime);
  };

  // Analytics Management
  public query ({ caller }) func getProjectStats(projectId : Nat) : async ProjectStats {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view stats for your own projects");
    };
    switch (projectStats.get(projectId)) {
      case (null) { Runtime.trap("Project stats not found") };
      case (?stats) { stats };
    };
  };

  public shared ({ caller }) func incrementProjectPostViewCount(projectId : Nat) : async () {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only update stats for your own projects");
    };
    switch (projectStats.get(projectId)) {
      case (null) { Runtime.trap("Stats do not exist") };
      case (?projectsStatsPost) {
        let newStatsPost = {
          projectId = projectsStatsPost.projectId;
          viewCount = projectsStatsPost.viewCount + 1 : Nat;
          exportCount = projectsStatsPost.exportCount;
          shareCount = projectsStatsPost.shareCount;
          platformBreakdown = projectsStatsPost.platformBreakdown;
        };
        projectStats.add(projectId, newStatsPost);
      };
    };
  };

  public shared ({ caller }) func incrementExportCount(projectId : Nat) : async () {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only update stats for your own projects");
    };
    switch (projectStats.get(projectId)) {
      case (null) { Runtime.trap("Stats do not exist") };
      case (?stats) {
        let newStats = {
          projectId = stats.projectId;
          viewCount = stats.viewCount;
          exportCount = stats.exportCount + 1;
          shareCount = stats.shareCount;
          platformBreakdown = stats.platformBreakdown;
        };
        projectStats.add(projectId, newStats);
      };
    };
  };

  public shared ({ caller }) func incrementShareCount(projectId : Nat) : async () {
    requireUser(caller);
    let project = getProjectByIdInternal(projectId);
    if (not isProjectOwner(caller, project)) {
      Runtime.trap("Unauthorized: Can only update stats for your own projects");
    };
    switch (projectStats.get(projectId)) {
      case (null) { Runtime.trap("Stats do not exist") };
      case (?stats) {
        let newStats = {
          projectId = stats.projectId;
          viewCount = stats.viewCount;
          exportCount = stats.exportCount;
          shareCount = stats.shareCount + 1;
          platformBreakdown = stats.platformBreakdown;
        };
        projectStats.add(projectId, newStats);
      };
    };
  };

  // Subscription Management
  public shared ({ caller }) func upgradeToPro(stripePaymentIntentId : Text) : async () {
    requireUser(caller);
    let profile = getUserInternal(caller);
    let updatedProfile = {
      displayName = profile.displayName;
      avatarBlob = profile.avatarBlob;
      createdTime = profile.createdTime;
      tier = #pro;
      stripePaymentIntentId = ?stripePaymentIntentId;
      aiUsageCount = profile.aiUsageCount;
      twitterId = profile.twitterId;
      instagramId = profile.instagramId;
      youtubeId = profile.youtubeId;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func downgradeToFree() : async () {
    requireUser(caller);
    let profile = getUserInternal(caller);
    let updatedProfile = {
      displayName = profile.displayName;
      avatarBlob = profile.avatarBlob;
      createdTime = profile.createdTime;
      tier = #free;
      stripePaymentIntentId = profile.stripePaymentIntentId;
      aiUsageCount = profile.aiUsageCount;
      twitterId = profile.twitterId;
      instagramId = profile.instagramId;
      youtubeId = profile.youtubeId;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func isFreeTier(user : Principal) : async Bool {
    requireUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own subscription tier");
    };
    getUserInternal(user).tier == #free;
  };

  public query ({ caller }) func getFreeTierSummary(user : Principal) : async {
    isFree : Bool;
    remainingAiUses : Nat;
    aiUsageLimit : Nat;
  } {
    requireUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own usage summary");
    };
    let profile = getUserInternal(user);
    let isFree = profile.tier == #free;
    let usedCount = profile.aiUsageCount;
    let remainingAiUses = if (usedCount >= aiUsageLimitFreeTier) { 0 } else { aiUsageLimitFreeTier - usedCount };
    {
      isFree;
      remainingAiUses;
      aiUsageLimit = aiUsageLimitFreeTier;
    };
  };

  // AI Feature Usage Tracking
  public shared ({ caller }) func useAiFeature(feature : AiFeature) : async () {
    requireUser(caller);
    let profile = getUserInternal(caller);
    // Check free tier limits
    if (profile.tier == #free and profile.aiUsageCount >= aiUsageLimitFreeTier) {
      Runtime.trap("AI usage limit reached. Please upgrade to Pro for unlimited AI features.");
    };
    let updatedProfile = {
      displayName = profile.displayName;
      avatarBlob = profile.avatarBlob;
      createdTime = profile.createdTime;
      tier = profile.tier;
      stripePaymentIntentId = profile.stripePaymentIntentId;
      aiUsageCount = profile.aiUsageCount + 1;
      twitterId = profile.twitterId;
      instagramId = profile.instagramId;
      youtubeId = profile.youtubeId;
    };
    userProfiles.add(caller, updatedProfile);
  };

  // Stripe Integration
  public shared ({ caller }) func configureStripe(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
    stripeConfig := ?config;
  };

  public shared ({ caller }) func getCheckoutSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    requireUser(caller);
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    requireUser(caller);
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  // Helper query functions (no sensitive data, can be public)
  public query ({ caller }) func filterProjectsByStatus(projectsArray : [VideoProject], status : ProjectStatus) : async [VideoProject] {
    projectsArray.filter(
      func(project) { project.status == status }
    );
  };

  public query ({ caller }) func sortProjectsByTimestamp(projectsArray : [VideoProject]) : async [VideoProject] {
    projectsArray.sort(VideoProject.compareByTimestamp);
  };

  // General redeclaration of shopping item
  public type ShoppingItem = {
    currency : Text;
    productName : Text;
    productDescription : Text;
    priceInCents : Nat;
    quantity : Nat;
  };

  public query ({ caller }) func toShoppingItemArray(items : [(Text, Text, Nat)]) : async [ShoppingItem] {
    items.map(func((productName, description, priceInCents)) { { productName; productDescription = description; priceInCents; currency = "usd"; quantity = 1 } });
  };

  // CONTRACT: STRIPE
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // BULK VIDEO GENERATOR CONTRACT
  // CORE FUNCTIONS (NOT PRO GATED)
  public shared ({ caller }) func createBulkJob(input : BulkJobInput) : async RecordId {
    requireUser(caller);
    let bulkJob : BulkJob = {
      id = generateId();
      userId = caller;
      prompt = input.prompt;
      status = #queued;
      videoCount = input.videoCount;
      tone = input.tone;
      style = input.style;
      voiceType = input.voiceType;
      voiceEmotion = input.voiceEmotion;
      language = input.language;
      aspectRatio = input.aspectRatio;
      durationSeconds = input.durationSeconds;
      createdAt = getCurrentTimestamp();
      completedAt = null;
      totalScripts = 0;
      completedVideos = 0;
    };
    bulkJobs.add(bulkJob.id, bulkJob);
    bulkJob.id;
  };

  public query ({ caller }) func getBulkJob(jobId : RecordId) : async BulkJob {
    requireUser(caller);
    let job = switch (bulkJobs.get(jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?job) { job };
    };
    // Users can only view their own jobs, admins can view any
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bulk jobs");
    };
    job;
  };

  public query ({ caller }) func getBulkJobsByUser(userId : Principal) : async [BulkJob] {
    requireUser(caller);
    // Users can only list their own jobs, admins can list any
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own bulk jobs");
    };
    bulkJobs.values().toArray().filter(
      func(job) { job.userId == userId }
    );
  };

  public shared ({ caller }) func updateBulkJobStatus(jobId : RecordId, status : BulkJobStatus, completedVideos : Nat, completedAt : ?Int) : async () {
    requireUser(caller);
    let job = switch (bulkJobs.get(jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    // Users can only update their own jobs, admins can update any
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own bulk jobs");
    };
    let updatedJob = {
      id = job.id;
      userId = job.userId;
      prompt = job.prompt;
      status;
      videoCount = job.videoCount;
      tone = job.tone;
      style = job.style;
      voiceType = job.voiceType;
      voiceEmotion = job.voiceEmotion;
      language = job.language;
      aspectRatio = job.aspectRatio;
      durationSeconds = job.durationSeconds;
      createdAt = job.createdAt;
      completedAt;
      totalScripts = job.totalScripts;
      completedVideos;
    };
    bulkJobs.add(jobId, updatedJob);
  };

  public shared ({ caller }) func deleteBulkJob(jobId : RecordId) : async () {
    requireUser(caller);
    let job = switch (bulkJobs.get(jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?job) { job };
    };
    // Users can only delete their own jobs, admins can delete any
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own bulk jobs");
    };
    bulkJobs.remove(jobId);
    // Clean up associated scripts and videos
    for ((scriptId, script) in generatedScripts.entries()) {
      if (script.jobId == jobId) {
        generatedScripts.remove(scriptId);
      };
    };
    for ((videoId, video) in generatedVideos.entries()) {
      if (video.jobId == jobId) {
        generatedVideos.remove(videoId);
      };
    };
  };

  public shared ({ caller }) func saveGeneratedScript(script : GeneratedScript) : async RecordId {
    requireUser(caller);
    // Verify job ownership
    let job = switch (bulkJobs.get(script.jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only save scripts for your own bulk jobs");
    };
    generatedScripts.add(script.id, script);
    script.id;
  };

  public query ({ caller }) func getScriptsForJob(jobId : RecordId) : async [GeneratedScript] {
    requireUser(caller);
    // Verify job ownership
    let job = switch (bulkJobs.get(jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view scripts for your own bulk jobs");
    };
    generatedScripts.values().toArray().filter(
      func(script) { script.jobId == jobId }
    );
  };

  public shared ({ caller }) func saveGeneratedVideo(video : GeneratedVideo) : async RecordId {
    requireUser(caller);
    // Verify job ownership
    let job = switch (bulkJobs.get(video.jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only save videos for your own bulk jobs");
    };
    generatedVideos.add(video.id, video);
    video.id;
  };

  public query ({ caller }) func getVideosForJob(jobId : RecordId) : async [GeneratedVideo] {
    requireUser(caller);
    // Verify job ownership
    let job = switch (bulkJobs.get(jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view videos for your own bulk jobs");
    };
    generatedVideos.values().toArray().filter(
      func(video) { video.jobId == jobId }
    );
  };

  public shared ({ caller }) func deleteGeneratedScript(scriptId : RecordId) : async () {
    requireUser(caller);
    let script = switch (generatedScripts.get(scriptId)) {
      case (null) { Runtime.trap("Generated script not found") };
      case (?script) { script };
    };
    // Verify job ownership
    let job = switch (bulkJobs.get(script.jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete scripts for your own bulk jobs");
    };
    generatedScripts.remove(scriptId);
  };

  public shared ({ caller }) func deleteGeneratedVideo(videoId : RecordId) : async () {
    requireUser(caller);
    let video = switch (generatedVideos.get(videoId)) {
      case (null) { Runtime.trap("Generated video not found") };
      case (?video) { video };
    };
    // Verify job ownership
    let job = switch (bulkJobs.get(video.jobId)) {
      case (null) { Runtime.trap("Bulk job not found") };
      case (?j) { j };
    };
    if (not isBulkJobOwner(caller, job) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete videos for your own bulk jobs");
    };
    generatedVideos.remove(videoId);
  };
};
