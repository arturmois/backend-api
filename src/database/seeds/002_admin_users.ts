import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Only create admin users if none exist
  const existingAdmins = await knex('users').where('role', 'admin').first();
  
  if (!existingAdmins) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123!@#', saltRounds);
    
    await knex('users').insert([
      {
        first_name: 'System',
        last_name: 'Administrator',
        email: 'admin@bensseguros.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'admin',
        permissions: [
          'users:read',
          'users:write',
          'users:delete',
          'policies:read',
          'policies:write',
          'policies:delete',
          'claims:read',
          'claims:write',
          'claims:delete',
          'payments:read',
          'payments:write',
          'reports:read',
          'system:admin'
        ],
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        address: {
          street: '123 Admin Street',
          city: 'Corporate City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        metadata: {
          created_by: 'system',
          notes: 'System administrator account created during initial setup'
        }
      },
      {
        first_name: 'Agent',
        last_name: 'Demo',
        email: 'agent@bensseguros.com',
        password: hashedPassword,
        phone: '+1234567891',
        role: 'agent',
        permissions: [
          'users:read',
          'policies:read',
          'policies:write',
          'claims:read',
          'claims:write',
          'payments:read',
          'reports:read'
        ],
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        address: {
          street: '456 Agent Avenue',
          city: 'Sales City',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        metadata: {
          created_by: 'system',
          notes: 'Demo insurance agent account',
          agent_code: 'AGT001',
          branch_office: 'New York Main'
        }
      },
      {
        first_name: 'Test',
        last_name: 'User',
        email: 'user@bensseguros.com',
        password: hashedPassword,
        phone: '+1234567892',
        role: 'user',
        permissions: [
          'policies:read',
          'claims:read',
          'claims:write',
          'payments:read'
        ],
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        address: {
          street: '789 Customer Lane',
          city: 'Client City',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        metadata: {
          created_by: 'system',
          notes: 'Demo customer account'
        }
      }
    ]);
    
    console.log('Demo users created:');
    console.log('Admin: admin@bensseguros.com / admin123!@#');
    console.log('Agent: agent@bensseguros.com / admin123!@#');
    console.log('User: user@bensseguros.com / admin123!@#');
  }
}