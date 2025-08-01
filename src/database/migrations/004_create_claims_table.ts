import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('claims', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Claim identification
    table.string('claim_number', 50).notNullable().unique();
    table.string('external_claim_id', 100).nullable();
    
    // Relationships
    table.uuid('policy_id').notNullable();
    table.uuid('claimant_id').notNullable(); // Usually the policyholder
    table.uuid('adjuster_id').nullable(); // Claims adjuster assigned
    
    // Claim details
    table.string('status', 30).defaultTo('submitted').notNullable();
    // submitted, under_review, investigating, approved, denied, closed, reopened
    table.enum('type', ['auto', 'property', 'health', 'life', 'liability', 'other']).notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    
    // Incident information
    table.timestamp('incident_date').notNullable();
    table.timestamp('reported_date').notNullable();
    table.string('incident_location', 500).nullable();
    table.text('incident_description').notNullable();
    table.jsonb('incident_details').nullable(); // Additional structured incident data
    
    // Financial details
    table.decimal('claimed_amount', 15, 2).notNullable();
    table.decimal('approved_amount', 15, 2).nullable();
    table.decimal('paid_amount', 15, 2).defaultTo(0);
    table.decimal('deductible_amount', 10, 2).nullable();
    table.decimal('reserve_amount', 15, 2).nullable(); // Amount reserved for this claim
    table.string('currency', 3).defaultTo('USD').notNullable();
    
    // Assessment and investigation
    table.text('investigation_notes').nullable();
    table.jsonb('investigation_findings').nullable();
    table.decimal('liability_percentage', 5, 2).nullable(); // 0-100%
    table.boolean('is_fraudulent').defaultTo(false);
    table.text('fraud_indicators').nullable();
    
    // Coverage information
    table.jsonb('coverage_verification').nullable();
    table.boolean('coverage_valid').nullable();
    table.text('coverage_notes').nullable();
    
    // Documents and evidence
    table.jsonb('documents').nullable(); // Array of document references
    table.jsonb('photos').nullable(); // Photo evidence
    table.jsonb('reports').nullable(); // Police reports, medical reports, etc.
    
    // Communication and updates
    table.jsonb('communications').nullable(); // Communication history
    table.timestamp('last_contact_date').nullable();
    table.timestamp('next_followup_date').nullable();
    
    // Resolution
    table.text('resolution_notes').nullable();
    table.text('denial_reason').nullable();
    table.timestamp('resolution_date').nullable();
    table.timestamp('payment_date').nullable();
    table.string('payment_method', 50).nullable();
    table.string('payment_reference', 100).nullable();
    
    // Legal and regulatory
    table.boolean('legal_action_involved').defaultTo(false);
    table.text('legal_notes').nullable();
    table.boolean('regulatory_reporting_required').defaultTo(false);
    table.timestamp('regulatory_reported_at').nullable();
    
    // Workflow and assignments
    table.uuid('assigned_to').nullable();
    table.timestamp('assigned_at').nullable();
    table.jsonb('workflow_status').nullable();
    table.integer('escalation_level').defaultTo(0);
    
    // Audit trail
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.uuid('closed_by').nullable();
    table.timestamp('closed_at').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('policy_id').references('id').inTable('policies').onDelete('CASCADE');
    table.foreign('claimant_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('adjuster_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('closed_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['claim_number']);
    table.index(['policy_id']);
    table.index(['claimant_id']);
    table.index(['adjuster_id']);
    table.index(['status']);
    table.index(['type']);
    table.index(['priority']);
    table.index(['incident_date']);
    table.index(['reported_date']);
    table.index(['assigned_to']);
    table.index(['next_followup_date']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('claims');
}