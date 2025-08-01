import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('policy_types', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Policy type information
    table.string('name', 100).notNullable().unique();
    table.string('code', 20).notNullable().unique();
    table.text('description').nullable();
    table.string('category', 50).notNullable(); // auto, health, life, property, etc.
    
    // Configuration
    table.boolean('is_active').defaultTo(true).notNullable();
    table.jsonb('coverage_options').nullable(); // Available coverage types
    table.jsonb('pricing_factors').nullable(); // Factors that affect pricing
    table.jsonb('requirements').nullable(); // Requirements for this policy type
    
    // Business rules
    table.decimal('minimum_coverage', 15, 2).nullable();
    table.decimal('maximum_coverage', 15, 2).nullable();
    table.integer('minimum_term_months').nullable();
    table.integer('maximum_term_months').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['name']);
    table.index(['code']);
    table.index(['category']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('policy_types');
}