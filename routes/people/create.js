let { getPersonByMessengerID, createPerson } = require('../../libs/data/people.js');

let { uploadCloudinaryImage, getFaceFromImage } = require('../../libs/cloudinary.js');

let createNewPerson = async ({ query }, res) => {
  let { 
    messenger_user_id,
    first_name,
    last_name,
    gender,
    zip_code,
    latitude,
    longitude,
    messenger_link,
    profile_image,
    is_runner,
    is_cyclist,
    is_gymnist
  } = query;

  let person = await getPersonByMessengerID(messenger_user_id);

  if (person) {
    let redirect_to_blocks = ['Profile Already Created'];
    res.send({ redirect_to_blocks });
    return;
  }

  let new_profile_image_url = await uploadCloudinaryImage(
    { image_url: profile_image }
  );

  let face_profile_image_url = await getFaceFromImage(
    { image_url: new_profile_image_url }
  );
  
  let activities = [
    is_runner ? 'Running' : null,
    is_cyclist ? 'Cycling' : null,
    is_gymnist ? 'Gym' : null,
  ];

  let new_person_data = {
    ['messenger user id']: messenger_user_id,
    ['Active?']: true,
    ['First Name']: first_name,
    ['Last Name']: last_name,
    ['Gender']: gender,
    ['Activities']: activities,
    ['Zip Code']: zip_code,
    ['Latitude']: Number(latitude),
    ['Longitude']: Number(longitude),
    ['Messenger Link']: messenger_link,
    ['Profile Image URL']: face_profile_image_url,
  }

  let new_person = await createPerson(new_person_data);

  let redirect_to_blocks = ['New Profile Created'];

  res.send({ redirect_to_blocks });
}

module.exports = createNewPerson;