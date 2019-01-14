let { BASEURL } = process.env;

let { createBtn } = require('../../libs/bots.js');
let { createURL } = require('../../libs/helpers/strings.js');

let createPeopleCards = (index) => (person) => {
  let tagged_person_messenger_id = person.fields['messenger user id'];

  let is_person_verified = person.fields['Verified?'];

  let title = `${person.fields['First Name']} | Age: ${person.fields['Age']}`;
  let subtitle = `${person.fields['City']} | ${person.fields['Country']}`;
  if (is_person_verified) subtitle = `Verified User ✅ | ${subtitle} `;

  let image_url = Object.keys(person.fields)
    .filter(field => field.startsWith('Profile Image URL'))
    .map(field => person.fields[field])[0];

  let send_tag_btn = createBtn(
    `Tag!|show_block|[JSON] Tag Profile`,
    { tagged_person_messenger_id }
  );

  let next_profile_btn = createBtn(
    `Next|show_block|[JSON] Browse Profiles`,
    { index }
  );

  let view_profile_url = createURL(
    `${BASEURL}/people/view/profile?v=%20`,
    { tagged_person_messenger_id }
  );

  let view_profile_btn = createBtn(
    `View Profile|web_url|${view_profile_url}`
  );

  let buttons = [send_tag_btn, next_profile_btn, view_profile_btn];

  return { title, subtitle, image_url, buttons };
}

module.exports = {
  createPeopleCards,
}
