import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Basic user information
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('phone', 20).nullable();
    table.date('date_of_birth').nullable();
    
    // Role and permissions
    table.enum('role', ['user', 'agent', 'admin']).defaultTo('user').notNullable();
    table.jsonb('permissions').nullable();
    
    // Account status
    table.boolean('is_active').defaultTo(true).notNullable();
    table.boolean('email_verified').defaultTo(false).notNullable();
    table.timestamp('email_verified_at').nullable();
    table.timestamp('last_login_at').nullable();
    
    // Authentication tokens
    table.text('refresh_token').nullable();
    table.string('password_reset_token', 255).nullable();
    table.timestamp('password_reset_token_expiry').nullable();
    table.string('email_verification_token', 255).nullable();
    table.timestamp('email_verification_token_expiry').nullable();
    
    // Address information (JSONB for flexibility)
    table.jsonb('address').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
    table.index(['last_login_at']);
    table.index(['password_reset_token']);
    table.index(['email_verification_token']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}