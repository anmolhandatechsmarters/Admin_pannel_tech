// seeds/YYYYMMDDHHMMSS_users.js

exports.seed = async function(knex) {
  // Clear existing data
  await knex('users').del(); // or use .truncate() to reset the table
 await knex('roles').del()


 await knex('roles').insert([
  { id: 1, role: 'Admin' },
  { id: 2, role: 'HR' }, // Assuming 'HR' is the role for ID 2
  { id: 3, role: 'Employee' } // 'Employee' for ID 3
]);

  // Insert seed data
  await knex('users').insert([
    {
      email: 'admin@gmail.com',
      emp_id: 'admin',
      first_name: 'Admin',
      last_name: 'Lastname',
      street1: '123 Main St',
      street2: 'Apt 4B',
      city: 1, // Ensure this exists in the City table
      state: 1, // Ensure this exists in the State table
      country: 1, // Ensure this exists in the Country table
      role: 1, // Ensure this exists in the Role table
      status: '1',
      user_agent: 'Mozilla/5.0',
      ip: '192.168.1.1',
      created_by: 'admin',
      password: 'admin' // Ensure this is hashed in practice
    }
  ]);

  console.log('Seed data inserted successfully.');
};
