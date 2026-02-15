/**
 * Type definitions for Edlink Graph API V2 entities
 * @see https://ed.link/docs/guides/v2.0/graph-api/people
 * @see https://ed.link/docs/guides/v2.0/graph-api/events
 */

/**
 * Represents an Event from the Edlink Graph API
 * Events track changes and activities in the system
 */
export interface EdlinkEvent {
  /** Unique identifier for the event */
  id?: string;
  /** Type of event (e.g., 'person.created', 'person.updated') */
  type?: string;
  /** Event payload containing the changed entity */
  data?: Record<string, unknown>;
  /** ISO 8601 timestamp when the event was created */
  created_date?: string;
  /** ISO 8601 timestamp when the event was last updated */
  updated_date?: string;
}

/**
 * Represents a Person from the Edlink Graph API
 * People can be students, teachers, administrators, etc.
 */
export interface EdlinkPerson {
  /** Unique identifier for the person */
  id?: string;
  /** First name */
  first_name?: string;
  /** Middle name */
  middle_name?: string;
  /** Last name */
  last_name?: string;
  /** Display name (formatted name for UI) */
  display_name?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** User's locale/language preference */
  locale?: string;
  /** User's timezone */
  time_zone?: string;
  /** URL to user's profile picture */
  picture_url?: string;
  /** User's birthday */
  birthday?: string;
  /** User's gender */
  gender?: string;
  /** Roles assigned to this person */
  roles?: EdlinkRole[];
  /** IDs of schools this person is associated with */
  school_ids?: string[];
  /** Grade levels (for students) */
  grade_levels?: EdlinkGradeLevel[];
  /** Year of graduation (for students) */
  graduation_year?: number;
  /** District ID this person belongs to */
  district_id?: string;
  /** Demographic information */
  demographics?: EdlinkDemographics;
  /** Custom properties */
  properties?: Record<string, unknown>;
  /** External object type identifier */
  external_object_type?: string;
  /** ISO 8601 timestamp when created */
  created_date?: string;
  /** ISO 8601 timestamp when last updated */
  updated_date?: string;
}

/**
 * Role that a person can have
 */
export interface EdlinkRole {
  id?: string;
  /** Role name (e.g., 'student', 'teacher', 'admin') */
  name?: string;
  /** Role type */
  type?: string;
}

/**
 * Grade level information
 */
export interface EdlinkGradeLevel {
  id?: string;
  name?: string;
}

/**
 * Demographic information for a person
 */
export interface EdlinkDemographics {
  [key: string]: unknown;
}

/**
 * Pagination response wrapper from Edlink API
 */
export interface EdlinkPaginatedResponse<T> {
  /** Array of items in this page */
  $data: T[];
  /** Cursor for the next page (null if no more pages) */
  $next: string | null;
}
