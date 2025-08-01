import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('policy_types').del();

  // Insert seed entries
  await knex('policy_types').insert([
    {
      name: 'Auto Insurance',
      code: 'AUTO',
      description: 'Comprehensive automobile insurance coverage',
      category: 'auto',
      is_active: true,
      coverage_options: {
        liability: { required: true, description: 'Liability coverage for bodily injury and property damage' },
        collision: { required: false, description: 'Collision coverage for vehicle damage' },
        comprehensive: { required: false, description: 'Comprehensive coverage for theft, vandalism, and weather damage' },
        uninsured_motorist: { required: false, description: 'Protection against uninsured/underinsured drivers' },
        personal_injury: { required: false, description: 'Personal injury protection' }
      },
      pricing_factors: {
        driver_age: { weight: 0.3, description: 'Age of primary driver' },
        driving_record: { weight: 0.4, description: 'Driving history and violations' },
        vehicle_type: { weight: 0.2, description: 'Make, model, and year of vehicle' },
        location: { weight: 0.1, description: 'Geographic location and risk factors' }
      },
      requirements: {
        minimum_age: 18,
        valid_license: true,
        vehicle_inspection: false
      },
      minimum_coverage: 15000.00,
      maximum_coverage: 1000000.00,
      minimum_term_months: 6,
      maximum_term_months: 12
    },
    {
      name: 'Homeowners Insurance',
      code: 'HOME',
      description: 'Comprehensive homeowners insurance protection',
      category: 'property',
      is_active: true,
      coverage_options: {
        dwelling: { required: true, description: 'Coverage for the home structure' },
        personal_property: { required: true, description: 'Coverage for personal belongings' },
        liability: { required: true, description: 'Personal liability protection' },
        additional_living: { required: false, description: 'Additional living expenses during repairs' },
        medical_payments: { required: false, description: 'Medical payments for injuries on property' }
      },
      pricing_factors: {
        home_value: { weight: 0.4, description: 'Current market value of home' },
        location: { weight: 0.3, description: 'Geographic location and natural disaster risk' },
        construction_type: { weight: 0.2, description: 'Construction materials and methods' },
        security_features: { weight: 0.1, description: 'Security systems and fire protection' }
      },
      requirements: {
        property_ownership: true,
        home_inspection: true,
        minimum_age: 18
      },
      minimum_coverage: 50000.00,
      maximum_coverage: 5000000.00,
      minimum_term_months: 12,
      maximum_term_months: 12
    },
    {
      name: 'Life Insurance',
      code: 'LIFE',
      description: 'Term and whole life insurance coverage',
      category: 'life',
      is_active: true,
      coverage_options: {
        term_life: { required: false, description: 'Term life insurance coverage' },
        whole_life: { required: false, description: 'Whole life insurance with cash value' },
        accidental_death: { required: false, description: 'Additional coverage for accidental death' },
        disability_waiver: { required: false, description: 'Waiver of premium for disability' }
      },
      pricing_factors: {
        age: { weight: 0.4, description: 'Age of insured person' },
        health_status: { weight: 0.3, description: 'Current health and medical history' },
        lifestyle: { weight: 0.2, description: 'Smoking, drinking, and risky activities' },
        coverage_amount: { weight: 0.1, description: 'Amount of coverage requested' }
      },
      requirements: {
        medical_exam: true,
        minimum_age: 18,
        maximum_age: 75,
        beneficiary_designation: true
      },
      minimum_coverage: 25000.00,
      maximum_coverage: 10000000.00,
      minimum_term_months: 12,
      maximum_term_months: 360
    },
    {
      name: 'Health Insurance',
      code: 'HEALTH',
      description: 'Medical and health insurance coverage',
      category: 'health',
      is_active: true,
      coverage_options: {
        medical: { required: true, description: 'Basic medical coverage' },
        dental: { required: false, description: 'Dental care coverage' },
        vision: { required: false, description: 'Vision care coverage' },
        mental_health: { required: false, description: 'Mental health services' },
        prescription: { required: false, description: 'Prescription drug coverage' }
      },
      pricing_factors: {
        age: { weight: 0.3, description: 'Age of insured person' },
        location: { weight: 0.2, description: 'Geographic location and provider network' },
        plan_type: { weight: 0.3, description: 'HMO, PPO, or high-deductible plan' },
        family_size: { weight: 0.2, description: 'Number of covered family members' }
      },
      requirements: {
        minimum_age: 0,
        maximum_age: 99,
        enrollment_period: true
      },
      minimum_coverage: 1000.00,
      maximum_coverage: 500000.00,
      minimum_term_months: 12,
      maximum_term_months: 12
    },
    {
      name: 'Business Liability Insurance',
      code: 'BIZ_LIABILITY',
      description: 'General liability insurance for businesses',
      category: 'business',
      is_active: true,
      coverage_options: {
        general_liability: { required: true, description: 'General business liability coverage' },
        professional_liability: { required: false, description: 'Professional errors and omissions' },
        product_liability: { required: false, description: 'Product liability coverage' },
        cyber_liability: { required: false, description: 'Cyber security and data breach coverage' }
      },
      pricing_factors: {
        business_type: { weight: 0.4, description: 'Type of business and industry risk' },
        revenue: { weight: 0.3, description: 'Annual business revenue' },
        employee_count: { weight: 0.2, description: 'Number of employees' },
        location: { weight: 0.1, description: 'Business location and local risk factors' }
      },
      requirements: {
        business_license: true,
        minimum_revenue: 10000,
        certificate_of_incorporation: true
      },
      minimum_coverage: 100000.00,
      maximum_coverage: 10000000.00,
      minimum_term_months: 12,
      maximum_term_months: 12
    }
  ]);
}