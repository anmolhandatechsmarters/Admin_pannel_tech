exports.seed = async function (knex) {
  // Start by inserting into the referenced tables if they don't have data
  await knex('role').insert({ id: 1, role: 'Admin' });

  // Then insert into the users table
  await knex('users').del(); // Clear existing data (if needed)

  await knex('users').insert([
    {
      email: 'admin@gmail.com',
      emp_id: 'admin',
      first_name: 'admin',
      last_name: 'lastname',
      street1: '123 Main St',
      street2: 'Apt 4B',
      city: 1, // Make sure this exists in the city table
      state: 1, // Make sure this exists in the state table
      country: 1, // Make sure this exists in the country table
      role: 1, // Make sure this exists in the role table
      status: '1',
      user_agent: 'Mozilla/5.0',
      ip: '192.168.1.1',
      created_by: 'admin',
      password: 'admin' // Ensure this is hashed in practice
    }
  ]);
};



