-- D1 enforces foreign keys (unlike vanilla SQLite, where it's off by
-- default) — children must be deleted before the parents they reference.
DELETE FROM StudioCMSDiffTracking;
DELETE FROM StudioCMSPageContent;
DELETE FROM StudioCMSOAuthAccounts;
DELETE FROM StudioCMSSessionTable;
DELETE FROM StudioCMSPermissions;
DELETE FROM StudioCMSAPIKeys;
DELETE FROM StudioCMSUserResetTokens;
DELETE FROM StudioCMSEmailVerificationTokens;
DELETE FROM StudioCMSPageData;
DELETE FROM StudioCMSUsersTable;
DELETE FROM StudioCMSPageFolderStructure;
DELETE FROM StudioCMSPageDataTags;
DELETE FROM StudioCMSPageDataCategories;
DELETE FROM StudioCMSPluginData;
DELETE FROM StudioCMSDynamicConfigSettings;
DELETE FROM StudioCMSStorageManagerUrlMappings;
DELETE FROM contact_submissions;
DELETE FROM plugin_site_config;
DELETE FROM plugin_partners;
DELETE FROM plugin_protocol_items;
DELETE FROM plugin_testimonials;
DELETE FROM plugin_youtube_videos;
DELETE FROM plugin_podcast_episodes;
