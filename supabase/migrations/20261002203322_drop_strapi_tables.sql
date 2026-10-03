-- Remove the tables of the old Strapi CMS.
-- Strapi created them in this project (they were never part of these migrations). Their content was copied
-- into the eu_ tables on 2026-10-02, and a full backup was taken before this ran
-- (supabase_data/backups/before-strapi-drop-20261003-020213.dump, kept locally and out of git).
--
-- One statement, so the links between the Strapi tables don't matter; no CASCADE, so anything else that
-- unexpectedly depends on them stops the migration instead of being dropped too. Their id sequences go with them.
-- "if exists" makes this a no-op on databases built only from these migrations.

drop table if exists
  public.admin_permissions,
  public.admin_permissions_role_lnk,
  public.admin_roles,
  public.admin_users,
  public.admin_users_roles_lnk,
  public.blogs,
  public.files,
  public.files_folder_lnk,
  public.files_related_mph,
  public.i18n_locale,
  public.khabars,
  public.strapi_api_token_permissions,
  public.strapi_api_token_permissions_token_lnk,
  public.strapi_api_tokens,
  public.strapi_core_store_settings,
  public.strapi_database_schema,
  public.strapi_history_versions,
  public.strapi_migrations,
  public.strapi_migrations_internal,
  public.strapi_release_actions,
  public.strapi_release_actions_release_lnk,
  public.strapi_releases,
  public.strapi_transfer_token_permissions,
  public.strapi_transfer_token_permissions_token_lnk,
  public.strapi_transfer_tokens,
  public.strapi_webhooks,
  public.strapi_workflows,
  public.strapi_workflows_stage_required_to_publish_lnk,
  public.strapi_workflows_stages,
  public.strapi_workflows_stages_permissions_lnk,
  public.strapi_workflows_stages_workflow_lnk,
  public.success_stories,
  public.testimonials,
  public.up_permissions,
  public.up_permissions_role_lnk,
  public.up_roles,
  public.up_users,
  public.up_users_role_lnk,
  public.upload_folders,
  public.upload_folders_parent_lnk,
  public.visa_stamps,
  public.work_permits;
