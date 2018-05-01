let { BASEURL, USERS_BASE_ID } = process.env;
let { createGallery } = require('../libs/bots');
let { createURL, shuffleArray } = require('../libs/helpers');

let { searchProviders, sortProviders, toGalleryElement } = require('../libs/providers');
let { searchUserByMessengerID } = require('../libs/users');
let { getTable, getAllDataFromTable, createTableData, updateTableData } = require('../libs/data');

let getUsersTable = getTable('Users');
let usersTable = getUsersTable(USERS_BASE_ID);

let createNewUser = createTableData(usersTable);
let updateUser = updateTableData(usersTable);

let createOrUpdateUser = async (user, query) => {
  let first_name = query['first name'];
	let last_name = query['last name'];
	let gender = query['gender'];
	let messenger_user_id = query['messenger user id'];

  let { search_providers_state, search_providers_city, search_providers_zip_code } = query;

  let last_state_searched = search_providers_state ? search_providers_state.trim().toLowerCase() : null;
  let last_city_searched = search_providers_city ? search_providers_city.trim().toLowerCase() : null;
  let last_zip_code_searched = search_providers_zip_code ? Number(search_providers_zip_code.trim()) : null;

  if (!user) {
		let newUserData = {
			'messenger user id': messenger_user_id,
			'User Type': 'CONSUMER',
			'First Name': first_name,
			'Last Name': last_name,
			'Gender': gender,
			'Last State Searched': last_state_searched,
			'Last City Searched': last_city_searched,
			'Last Zip Code Searched': last_zip_code_searched,
		}

		let newUser = await createNewUser(newUserData);
    return newUser;
	}

  let updateUserData = {};

  if (last_state_searched) updateUserData['Last State Searched'] = last_state_searched;
  if (last_city_searched) updateUserData['Last City Searched'] = last_city_searched;
  if (last_zip_code_searched) updateUserData['Last Zip Code Searched'] = last_zip_code_searched;

  let updatedUser = await updateUser(updateUserData, user);
  return updatedUser;
}

// Main
let getProviders = async ({ query, params }, res) => {
  let { search_type } = params;

  let first_name = query['first name'];
  let last_name = query['last name'];
  let gender = query['gender'];
	let messenger_user_id = query['messenger user id'];
  let data = { first_name, last_name, gender, messenger_user_id };

	let user = await searchUserByMessengerID({ messenger_user_id });
	let createdOrUpdatedUser = await createOrUpdateUser(user, query);

	let providers = await searchProviders(query, { search_type });

  if (!providers[0]) {
    let redirect_to_blocks = ['No Providers Found'];
    res.send({ redirect_to_blocks });
    return;
  }

  let textMsg = { text: `Here's are some providers I found ${first_name}` };
  let randomProviders = shuffleArray(providers).slice(0, 10).sort(sortProviders).map(toGalleryElement(data));
	let providersGallery = createGallery(randomProviders);

	let messages = [textMsg, providersGallery];
	res.send({ messages });
}

let handleErrors = (req, res) => (error) => {
  console.log(error);
	let source = 'airtable';
	res.send({ source, error });
}

module.exports = (req, res) => {
	getProviders(req, res)

	.catch(
		handleErrors(req, res)
	);
}