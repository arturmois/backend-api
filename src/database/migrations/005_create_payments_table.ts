import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payments', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Payment identification
    table.string('payment_reference', 100).notNullable().unique();
    table.string('external_payment_id', 100).nullable();
    table.string('transaction_id', 100).nullable();
    
    // Relationships
    table.uuid('policy_id').nullable(); // For premium payments
    table.uuid('claim_id').nullable(); // For claim payouts
    table.uuid('user_id').notNullable(); // Payer or payee
    
    // Payment details
    table.enum('type', ['premium', 'claim_payout', 'refund', 'fee', 'commission', 'other']).notNullable();
    table.enum('direction', ['inbound', 'outbound']).notNullable(); // inbound = payment received, outbound = payment sent
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).defaultTo('pending');
    
    // Financial details
    table.decimal('amount', 15, 2).notNullable();
    table.string('currency', 3).defaultTo('USD').notNullable();
    table.decimal('fee_amount', 10, 2).defaultTo(0);
    table.decimal('net_amount', 15, 2).notNullable(); // amount - fees
    
    // Payment method and gateway
    table.string('payment_method', 50).notNullable(); // credit_card, bank_transfer, check, cash, etc.
    table.string('payment_gateway', 50).nullable(); // stripe, paypal, square, etc.
    table.jsonb('payment_details').nullable(); // Gateway-specific details
    table.jsonb('gateway_response').nullable(); // Response from payment gateway
    
    // Dates
    table.timestamp('payment_date').notNullable();
    table.timestamp('due_date').nullable();
    table.timestamp('processed_at').nullable();
    table.timestamp('settled_at').nullable();
    
    // Billing period (for premium payments)
    table.date('billing_period_start').nullable();
    table.date('billing_period_end').nullable();
    
    // Bank/Card details (encrypted/tokenized)
    table.string('bank_account_last4', 4).nullable();
    table.string('card_last4', 4).nullable();
    table.string('card_brand', 20).nullable();
    
    // Reconciliation
    table.boolean('is_reconciled').defaultTo(false);
    table.timestamp('reconciled_at').nullable();
    table.string('bank_statement_reference', 100).nullable();
    
    // Failure and retry information
    table.text('failure_reason').nullable();
    table.integer('retry_count').defaultTo(0);
    table.timestamp('next_retry_at').nullable();
    
    // Audit trail
    table.uuid('created_by').nullable();
    table.uuid('processed_by').nullable();
    table.uuid('approved_by').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('policy_id').references('id').inTable('policies').onDelete('CASCADE');
    table.foreign('claim_id').references('id').inTable('claims').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('processed_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('approved_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['payment_reference']);
    table.index(['policy_id']);
    table.index(['claim_id']);
    table.index(['user_id']);
    table.index(['type']);
    table.index(['status']);
    table.index(['payment_date']);
    table.index(['due_date']);
    table.index(['is_reconciled']);
    table.index(['created_at']);
    
    // Constraints
    table.check('(policy_id IS NOT NULL AND claim_id IS NULL) OR (policy_id IS NULL AND claim_id IS NOT NULL) OR (policy_id IS NULL AND claim_id IS NULL)');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('payments');
}