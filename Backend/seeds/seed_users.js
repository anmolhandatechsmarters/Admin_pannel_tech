exports.seed = async function (knex) {
  // Start by inserting into the role table
  // Ensure the role table is cleared before inserting
  await knex('role').del(); // Clear existing roles if necessary

  // Insert predefined roles into the role table
  await knex('role').insert([
    { id: 1, role: 'Admin' },
    { id: 2, role: 'HR' },
    { id: 3, role: 'Employee' }
  ]);

  console.log('Roles inserted successfully.');

  // Clear existing users data if needed
  await knex('users').del();

  // Insert data into the users table
  await knex('users').insert([
    {
      email: 'admin@gmail.com',
      emp_id: 'admin',
      first_name: 'Admin',
      last_name: 'Lastname',
      street1: '123 Main St',
      street2: 'Apt 4B',
      city: 1, // Ensure this exists in the city table
      state: 1, // Ensure this exists in the state table
      country: 1, // Ensure this exists in the country table
      role: 1, // Ensure this exists in the role table
      status: '1',
      user_agent: 'Mozilla/5.0',
      ip: '192.168.1.1',
      created_by: 'admin',
      password: 'admin' // Ensure this is hashed in practice
    }
  ]);

  console.log('User data inserted successfully.');
};
