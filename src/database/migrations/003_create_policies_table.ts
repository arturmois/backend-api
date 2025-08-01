import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('policies', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Policy identification
    table.string('policy_number', 50).notNullable().unique();
    table.string('external_id', 100).nullable(); // For integration with external systems
    
    // Relationships
    table.uuid('user_id').notNullable();
    table.uuid('policy_type_id').notNullable();
    table.uuid('agent_id').nullable(); // Insurance agent who sold the policy
    
    // Policy details
    table.string('status', 20).defaultTo('draft').notNullable();
    // draft, pending_approval, active, suspended, cancelled, expired
    table.date('effective_date').notNullable();
    table.date('expiry_date').notNullable();
    table.date('renewal_date').nullable();
    
    // Coverage and pricing
    table.decimal('coverage_amount', 15, 2).notNullable();
    table.decimal('premium_amount', 10, 2).notNullable();
    table.decimal('deductible_amount', 10, 2).nullable();
    table.enum('premium_frequency', ['monthly', 'quarterly', 'semi_annual', 'annual']).defaultTo('monthly');
    table.string('currency', 3).defaultTo('USD').notNullable();
    
    // Policy terms and conditions
    table.jsonb('coverage_details').nullable(); // Specific coverage details
    table.jsonb('terms_and_conditions').nullable();
    table.jsonb('exclusions').nullable();
    table.jsonb('beneficiaries').nullable(); // For life insurance, etc.
    
    // Risk assessment
    table.decimal('risk_score', 5, 2).nullable();
    table.jsonb('risk_factors').nullable();
    
    // Documents and attachments
    table.jsonb('documents').nullable(); // Array of document references
    
    // Billing information
    table.uuid('billing_account_id').nullable();
    table.date('next_billing_date').nullable();
    table.decimal('outstanding_balance', 10, 2).defaultTo(0);
    
    // Audit trail
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('approved_at').nullable();
    table.uuid('approved_by').nullable();
    table.text('cancellation_reason').nullable();
    table.timestamp('cancelled_at').nullable();
    table.uuid('cancelled_by').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('policy_type_id').references('id').inTable('policy_types').onDelete('RESTRICT');
    table.foreign('agent_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('approved_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('cancelled_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['policy_number']);
    table.index(['user_id']);
    table.index(['policy_type_id']);
    table.index(['agent_id']);
    table.index(['status']);
    table.index(['effective_date']);
    table.index(['expiry_date']);
    table.index(['renewal_date']);
    table.index(['next_billing_date']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('policies');
}