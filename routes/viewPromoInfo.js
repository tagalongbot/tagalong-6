let { BASEURL } = process.env;
let { createURL, localizeDate } = require('../libs/helpers');
let { createButtonMessage } = require('../libs/bots');
let { getProviderByUserID } = require('../libs/providers');

let { getTable, getAllDataFromTable, findTableData, createTableData, updateTableData } = require('../libs/data');

let getPromosTable = getTable('Promos');

let createPromoMsg = ({ id: promo_id, fields: promo }, provider_base_id) => {
  let text = `
  Promotion Name: ${promo['Promotion Name']}
  Type: ${promo['Type']}
  Active: ${promo['Active?'] ? 'TRUE' : 'FALSE'}
  Terms: ${promo['Terms']}
  Expiration Date: ${promo['Expiration Date']}
  Claim Limit: ${promo['Claim Limit']}
  Total Claim Count: ${promo['Total Claim Count']}
  Claim Limit Reached: ${(promo['Claim Limit Reached']) === 1 ? 'TRUE' : 'FALSE'}
`;

  let update_promo_url = createURL(`${BASEURL}/promo/update`, { promo_id, provider_base_id });
  let toggle_promo_url = createURL(`${BASEURL}/promo/toggle`, { promo_id, provider_base_id });

  let msg = createButtonMessage(
    text,
    `${promo['Active?'] ? 'Deactivate' : 'Activate'}|json_plugin_url|${toggle_promo_url}`,
    `Update Promo|json_plugin_url|${update_promo_url}`,
  );

  return msg;
}

let viewPromoInfo = async ({ query }, res) => {
  let { promo_id, provider_base_id } = query;
  let messenger_user_id = query['messenger user id'];
  let provider = await getProviderByUserID(messenger_user_id);

  let promosTable = getPromosTable(provider_base_id);
  let findPromo = findTableData(promosTable);

  let promo = await findPromo(promo_id);

  let promoMsg = createPromoMsg(promo, provider_base_id);

  let messages = [promoMsg];
  res.send({ messages });
}

module.exports = viewPromoInfo;