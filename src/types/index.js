/**
 * @typedef {Object} Board
 * @property {string} id - UUID
 * @property {string} title
 * @property {string|null} description
 * @property {string} created_at - ISO 8601
 * @property {string} updated_at - ISO 8601
 */

/**
 * @typedef {Object} Column
 * @property {string} id - UUID
 * @property {string} board_id - UUID
 * @property {string} title
 * @property {number} position
 * @property {string|null} color
 * @property {string} created_at - ISO 8601
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} board_id - UUID
 * @property {string} column_id - UUID
 * @property {string} title
 * @property {string|null} description
 * @property {'task'|'user_story'|'bug'|'epic'|'spike'} type
 * @property {'low'|'medium'|'high'|'urgent'} priority
 * @property {string|null} assignee
 * @property {number} position - float
 * @property {string|null} due_date - ISO 8601 date string
 * @property {string} created_at - ISO 8601
 * @property {string} updated_at - ISO 8601
 */

export {};
