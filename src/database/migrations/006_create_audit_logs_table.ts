import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Audit information
    table.string('action', 50).notNullable(); // create, update, delete, login, logout, etc.
    table.string('entity_type', 50).notNullable(); // user, policy, claim, payment, etc.
    table.uuid('entity_id').nullable(); // ID of the affected entity
    table.string('table_name', 50).nullable(); // Database table name
    
    // User and session information
    table.uuid('user_id').nullable(); // User who performed the action
    table.string('session_id', 255).nullable();
    table.string('request_id', 255).nullable();
    
    // Request information
    table.string('method', 10).nullable(); // HTTP method
    table.string('url', 500).nullable(); // Request URL
    table.string('ip_address').nullable();
    table.string('user_agent', 500).nullable();
    
    // Data changes
    table.jsonb('old_values').nullable(); // Previous values (for updates)
    table.jsonb('new_values').nullable(); // New values (for creates/updates)
    table.jsonb('changed_fields').nullable(); // Array of field names that changed
    
    // Context and metadata
    table.string('context', 100).nullable(); // admin_panel, api, mobile_app, etc.
    table.text('description').nullable(); // Human-readable description
    table.string('severity', 20).defaultTo('info'); // info, warning, error, critical
    table.jsonb('metadata').nullable(); // Additional context data
    
    // Success and error information
    table.boolean('success').defaultTo(true);
    table.text('error_message').nullable();
    table.string('error_code', 50).nullable();
    
    // Compliance and regulatory
    table.boolean('pii_accessed').defaultTo(false); // Personally Identifiable Information
    table.boolean('sensitive_data_accessed').defaultTo(false);
    table.string('compliance_level', 20).nullable(); // low, medium, high, critical
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    
    // Foreign key constraints
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes for performance
    table.index(['action']);
    table.index(['entity_type']);
    table.index(['entity_id']);
    table.index(['user_id']);
    table.index(['created_at']);
    table.index(['ip_address']);
    table.index(['success']);
    table.index(['severity']);
    table.index(['pii_accessed']);
    table.index(['sensitive_data_accessed']);
    
    // Composite indexes for common queries
    table.index(['entity_type', 'entity_id', 'created_at']);
    table.index(['user_id', 'created_at']);
    table.index(['action', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('audit_logs');
}