let { BASEURL } = process.env;
let { createTextMessage, createGallery } = require('../libs/bots');
let { getServices, getActivePromos } = require('../libs/data');

let byZipCode = (zip_code) => (provider) => {
  if (!zip_code) return true;
  return provider['postal'].includes(zip_code);
}

let byState = (state) => (provider) => {
  if (!state) return true;
  return provider['state'].toLowerCase().includes(state.toLowerCase());
}

let byCity = (city) => (provider) => {
  if (!city) return true;
  return provider['city'].toLowerCase().includes(city.toLowerCase());
}

let filterProviders = (parameters, providers) => {
  let { provider, provider_type, state, city, zip_code, quality, location, brand_name} = parameters;

  let filteredProviders = providers
    .filter(byZipCode(zip_code))
    .filter(byState(state))
    .filter(byCity(city));
    // .filter(byQuality(quality)
  
  return filteredProviders;
}

let toGalleryElement = (provider) => {
  let title = provider.practice_name.slice(0, 80);
  let subtitle = `${provider.first_name} ${provider.last_name} | ${provider.address}`;
  let image_url = provider.practice_panel_photo_uri;

  let btn1 = {
    title: 'View Services',
    type: 'json_plugin_url',
    url: `${BASEURL}/provider/services?provider_id=${provider.providerid}&provider_name=${encodeURIComponent(provider.practice_name)}`
  }

 let btn2 = {
    title: 'View Promos',
    type: 'json_plugin_url',
    url: `${BASEURL}/provider/promos?provider_id=${provider.providerid}&provider_name=${encodeURIComponent(provider.practice_name)}`
  }

  let buttons = [btn1, btn2];

  let element = { title, subtitle, image_url, buttons};
  return element;
}

let findPromos = async ({ res, parameters, user}) => {
  let { first_name } = user;
  let { brand_name, procedure } = parameters;
  
  let services = await getServices();
  
  let servicesAskedFor = services.filter((service) => {
    let serviceName = service.service_name.toLowerCase();
    let procedureName = procedure.toLowerCase();
    let brandName = procedure.toLowerCase();
    
    return serviceName.includes(procedureName) || serviceName.includes(brandName); 
  });
  
  let servicesNumArr = servicesAskedFor.map((service) => service.serviceid);
  
  let activePromos = await getActivePromos();
  
  let foundProviders = filterProviders(parameters, activePromos);

  if (!foundProviders[0]) {
    let redirect_to_blocks = ['No Providers Found'];
    res.send({ redirect_to_blocks });
    return;
  }
  
  let txtMsg = createTextMessage(`${first_name} here's what I found`);
  
  let galleryData = foundProviders.map(toGalleryElement).slice(0, 10);
  let gallery = createGallery(galleryData);
  
  let messages = [txtMsg, gallery];
  res.send({ messages });
}

module.exports = findPromos;